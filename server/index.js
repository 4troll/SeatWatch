const dns = require('node:dns');
dns.setDefaultResultOrder('ipv4first');

const dotenv = require("dotenv");
dotenv.config();

const path = require('node:path');
const express = require("express");
const bodyParser = require('body-parser');
const { MongoClient } = require("mongodb");

const webdriverio = require('webdriverio');

const Bull = require('bull');
const scrapingQueue = new Bull('scraping');



const PORT = process.env.PORT || 3001;

const timeout = 2000;

const app = express();

var jsonParser = bodyParser.json();

const middleware = {
    jsonParser: jsonParser
}

const schedule = require('node-schedule');

const nmailer = require("nodemailer");
let transporter = nmailer.createTransport({
	host: "smtp.office365.com",
	pool: true,
	port: 587,
	secure: false,
	maxConnections: 1,
	auth: {
		user: process.env.EMAIL_ADDRESS,
		pass: process.env.EMAIL_PASS,
	},
});

const date = new Date();
const month = date.getMonth();
const year = date.getFullYear();

const startingSeason = month < 6 ? 0 : (month < 9 ? 1 : 2);

const validTerms = [];




// desiredTermNum: term number in a string
async function getCourseSections(desiredTermNum, desiredCourseStr) {
	try {
		// const desiredTermStr = "2022 Fall";
		// const termArray = desiredTermStr.split(/\s+/);
		// const seasonNum = termArray[1] == "Winter" ? 1 : (termArray[1] == "Spring/Summer" ? 5 : 9);
		// const termNum = `${termArray[0].charAt(0)}${termArray[0].charAt(2)}${termArray[0].charAt(3)}${seasonNum}`;
		
		const seasonStr = desiredTermNum.charAt(3) == 1 ? "Winter" : (desiredTermNum.charAt(3) == 5 ? "Spring/Summer" : "Fall");
		const desiredTermStr = `20${desiredTermNum.charAt(1)}${desiredTermNum.charAt(2)} ${seasonStr}`

		//const desiredCourseStr = "COMPSCI 2C03";
		const courseArray = desiredCourseStr.split(/\s+/);
		const courseGroupText = courseArray[0];
		const courseTagText = courseArray[1];
		const firstChar = courseGroupText.charAt(0).toUpperCase();

		const browser = await webdriverio.remote({
			logLevel: 'silent',
			// beforeSession: () => {
			// 	dns.setDefaultResultOrder('ipv4first');
			// },
			capabilities: {
				browserName: 'Chrome',
				"goog:chromeOptions": {
					args: ["--disable-gpu"],
				},
			},
			maxInstances: 4,
		})
		await browser.url("https://applicants.mcmaster.ca/psp/prepprd/EMPLOYEE/PSFT_LS/c/COMMUNITY_ACCESS.SSS_BROWSE_CATLG.GBL");
		browser.switchToFrame(1);
		// First Page

		const careerDropdown = await browser.$("#MCM_SSS_BCC_WRK_ACAD_CAREER");
		const termDropdown = await browser.$("#MCM_SSS_BCC_WRK_STRM");
		const termChoice = await browser.$(`#MCM_SSS_BCC_WRK_STRM option[value='${desiredTermNum}']`);
		const changeButton = await browser.$("#MCM_SSS_BCC_WRK_SSS_PB_CHANGE");

		await careerDropdown.setValue("Undergraduate");
		await termChoice.waitForExist({ timeout: timeout });
		await termDropdown.setValue(desiredTermStr);
		await changeButton.click();

		const courseGroup = await browser.$("#win0divDERIVED_SSS_BCC_GROUP_DETAIL");
		await courseGroup.waitForExist({ timeout: timeout });
		await browser.execute(`submitAction_win0(document.win0,'DERIVED_SSS_BCC_SSR_ALPHANUM_${firstChar}')`, undefined);
		
		const desiredCourseGroup = await browser.$(`*=${courseGroupText}`);
		await desiredCourseGroup.waitForExist({ timeout: timeout });
		desiredCourseGroup.click();
		
		const desiredCourseNum = await browser.$(`=${courseTagText}`);
		await desiredCourseNum.click();

		// Second Page

		await browser.switchToFrame(null);
		await browser.switchToFrame(1);

		const goButton = await browser.$("#DERIVED_SAA_CRS_SSR_PB_GO");
		await goButton.click();

		const termDropdown2 = await browser.$("#DERIVED_SAA_CRS_TERM_ALT");
		await termDropdown2.setValue(desiredTermStr);

		const submitButton = await browser.$("[value='Show Sections']");
		await submitButton.waitForExist({ timeout: timeout });
		await submitButton.click();

		const gridLabelWait = await browser.$(`td*=sections for ${desiredTermStr}`)
		await gridLabelWait.waitForExist({ timeout: timeout });


		const sectionLabels = await browser.$$("a[id*='CLASS_SECTION']");
		sectionLabels.splice(0,1); // remove first el (that is return link)
		sectionLabels.splice(-1,1); // remove last el (that is bottom return link)
		const sectionTextArray = await Promise.all(sectionLabels.map((el) => {
			return el.getText();
		}));
		const statuses = await browser.$$("img[alt='Open'], img[alt='Closed']");
		statuses.splice(0,2); // remove first two els (those are part of legend)
		const statusTextArray = await Promise.all(statuses.map((el) => {
			return el.getAttribute("alt");
		}));

		// turn into dictionary
		var result = []
		sectionTextArray.forEach((key, i) => {
			result[i] = {
				"section": key,
				"status": statusTextArray[i]
			};
		});
		browser.deleteSession()
		return result;
	} catch (e) {
		throw e;
	}
}
class InvalidTermError extends Error {
	constructor(message) {
		this.message = message;
		this.name = "Invalid Term";
	}
}

function emailCheck(field) {
	return /^[a-z0-9]*@mcmaster\.ca$/gi.test(field)
}

app.post('/api/getCourse', [middleware.jsonParser], async (req, res) => {
	if (req) {
		try {
			var body = req.body;
			var term = body.term;
			var course = body.course;
			var email = body.email;
			var fname = body.fname;
			var lname = body.lname;
			const response = await getCourseSections(term, course);
			// Terms.updateOne({"version": process.env.DB_VERSION}, 
			// {$set: {"terms.$[i].courses.$[j].followers.$[k]": {
			// 	email: email,
			// }}},
			// {arrayFilters: [{"i.term": term},{"j.course": course, "k.email": email}], "upsert": true},
			// function(err, doc) {
			// 	if (err) console.log(err);
			// });
			if (!validTerms.includes(term)) {
				throw new InvalidTermError("You entered an invalid term!")
			}
			const client = new MongoClient(process.env.MONGO_URI)
			const coursesDB = client.db("Followers:" + term)
			const followerCollection = coursesDB.collection(course)
			followerCollection.updateOne({email: email},{$set: {fname: fname, lname: lname}},{upsert: true})
			client.close()
			res.json(response);
			res.status(100);
		}
		catch(err) {
			res.status(404).send(err);
			throw err
		}
		finally {

		}
	}
	//res.sendFile(path.resolve(__dirname, 'client', 'index.html'));
});

app.use("/static", express.static("client"));

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client/public', 'index.html'));
});

for (let i = 0; i < 4; ++i) {
	const curYear = `${year + Math.floor((startingSeason + i) / 3)}`
	const curSzn = (startingSeason + i) % 3
	const sznText = curSzn === 0 ? "Winter" : (curSzn === 1 ? "Spring/Summer" : "Fall");

	const seasonNum = curSzn == 0 ? 1 : (curSzn == 1 ? 5 : 9);
	const termNum = `${curYear.charAt(0)}${curYear.charAt(2)}${curYear.charAt(3)}${seasonNum}`;

	validTerms.push(termNum);
}

const client = new MongoClient(process.env.MONGO_URI)


async function addScrapingTask(term, courseCode) {
	await scrapingQueue.add({ term, courseCode });
}

scrapingQueue.process(4, async job => {
	const term = job.data.term
	const courseCode = job.data.courseCode
	try {
		var cronProm = new Promise((resolve, reject) => {
			// if (instances >= maxInstances) {
			// 	return
			// }
			// const followersDB = client.db("Followers:" + term)
			const dataDB = client.db("Data:" + term)
			// followersDB.listCollections().toArray().then((data) => {
					// const courseCode = data[indicies[term]].name
					// instances++
					getCourseSections(term, courseCode).then(async (response) =>{
						const followersCollection = followersDB.collection(courseCode)
						const courseCollection = dataDB.collection(courseCode)
						await response.forEach(async (obj) => {
							const updateResponse = await courseCollection.updateOne({section: obj.section}, {$set: {status: obj.status}}, {upsert: true})
							const isModified = !!(updateResponse.modifiedCount)
							const isInserted = !!(updateResponse.upsertedCount)
							const tString = term.charAt(3) == 1 ? "Winter" : (term.charAt(3) == 5 ? "Spring/Summer" : "Fall");
							if (isModified && obj.status == "Open"){
								const mailList = []
								await followersCollection.find().forEach(async(follower) => {
									
									// alert user
									console.log(courseCode)
									mailList.push(follower.email)
								})
								let info = await transporter.sendMail({
									from: `"SeatWatch" <${process.env.EMAIL_ADDRESS}>`, // sender address
									bcc: mailList.join(","), // list of receivers
									subject: `${courseCode} ${obj.section} ${tString} Availability`, // Subject line
									text: `To whom it may concern,\r\n\r\n${courseCode}'s ${obj.section} offering is now available in ${tString} term.\r\n\r\n-SeatWatch`, // plain text body
									html: `To whom it may concern,<br><br>${courseCode}'s ${obj.section} offering is now available in ${tString} term.<br><br>-SeatWatch`, // html body
								});
								console.log("Preview URL: %s", nmailer.getTestMessageUrl(info));
		
							}
						})
					})
					
				// }
				
			// })
			

		}).then(()=>{
			client.close()
			
		})
	} catch(e) {
		
	}
	
});


async function scheduleScrapingTasks() {
	validTerms.forEach(function (term,index) {
		const followersDB = client.db("Followers:" + term)
		// const dataDB = client.db("Data:" + term)
		followersDB.listCollections().toArray().then((data) => {
			data.forEach(async (courseCode) => {
				await addScrapingTask(term,courseCode);
			})
		});
	});
}

scrapingQueue.add(
	{},
	{
	  repeat: {
		every: 1000
	  },
	  jobId: 'scrapeCourses',
	  removeOnComplete: true,
	  removeOnFail: true
	},
	async (job) => {
	  await scheduleScrapingTasks();
	}
  );