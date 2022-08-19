const { remote } = require('webdriverio');
const express = require("express");

const PORT = process.env.PORT || 3001;

const app = express();

async function getCourseSections(desiredTermStr, desiredCourseStr) {
	//const desiredTermStr = "2022 Fall";
	const termArray = desiredTermStr.split(/\s+/);
	const seasonNum = termArray[1] == "Winter" ? 1 : (termArray[1] == "Spring/Summer" ? 5 : 9);
	const termNum = `${termArray[0].charAt(0)}${termArray[0].charAt(2)}${termArray[0].charAt(3)}${seasonNum}`;

	//const desiredCourseStr = "COMPSCI 2C03";
	const courseArray = desiredCourseStr.split(/\s+/);
	const courseGroupText = courseArray[0];
	const courseTagText = courseArray[1];
	const firstChar = courseGroupText.charAt(0).toUpperCase();

    const browser = await remote({
        logLevel: 'trace',
        capabilities: {
            browserName: 'chrome'
        }
    })
	await browser.url("https://applicants.mcmaster.ca/psp/prepprd/EMPLOYEE/PSFT_LS/c/COMMUNITY_ACCESS.SSS_BROWSE_CATLG.GBL");
	browser.switchToFrame(1);

	// First Page

	const careerDropdown = await browser.$("#MCM_SSS_BCC_WRK_ACAD_CAREER");
	const termDropdown = await browser.$("#MCM_SSS_BCC_WRK_STRM");
	const termChoice = await browser.$(`#MCM_SSS_BCC_WRK_STRM option[value='${termNum}']`);
	const changeButton = await browser.$("#MCM_SSS_BCC_WRK_SSS_PB_CHANGE");

	await careerDropdown.setValue("Undergraduate");
	await termChoice.waitForExist({ timeout: 5000 });
	await termDropdown.setValue("2022 Fall");
	await changeButton.click();

	const courseGroup = await browser.$("#win0divDERIVED_SSS_BCC_GROUP_DETAIL");
	await courseGroup.waitForExist({ timeout: 5000 });
	await browser.execute(`submitAction_win0(document.win0,'DERIVED_SSS_BCC_SSR_ALPHANUM_${firstChar}')`, undefined);
	
	const desiredCourseGroup = await browser.$(`*=${courseGroupText}`);
	await desiredCourseGroup.waitForExist({ timeout: 5000 });
	desiredCourseGroup.click();
	
	const desiredCourseNum = await browser.$(`=${courseTagText}`);
	await desiredCourseNum.click();

	// Second Page

	await browser.switchToFrame(null);
	await browser.switchToFrame(1);

	const goButton = await browser.$("#DERIVED_SAA_CRS_SSR_PB_GO");
	await goButton.click();

	const termDropdown2 = await browser.$("#DERIVED_SAA_CRS_TERM_ALT");
	await termDropdown2.setValue("2022 Fall");

	const submitButton = await browser.$("[value='Show Sections']");
	await submitButton.waitForExist({ timeout: 5000 });
	await submitButton.click();

	const gridLabelWait = await browser.$(`td*=sections for ${desiredTermStr}`)
	await gridLabelWait.waitForExist({ timeout: 5000 });


	const sectionLabels = await browser.$$("a[ptlinktgt='pt_peoplecode']");
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
	var result = {}
	sectionTextArray.forEach((key, i) => result[key] = statusTextArray[i]);
	console.log(result);
	return result;
}

app.use("/static", express.static("client"));

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'client', 'index.html'));
});