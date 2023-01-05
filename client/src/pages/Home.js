import React, {
    Fragment,
    useState
} from 'react';
import { 
    AppBar, 
    Box,
    Toolbar,
    IconButton,
    Typography,
    Menu,
    Container,
    Button,
    Tooltip,
    MenuItem,
    Paper,
    Select,
    FormControl,
    InputLabel,
    TextField,
    FormHelperText,
    List,
    ListItem,
    Modal
  } from '@mui/material';
import OfferingsTable from '../components/offeringsTable';

const date = new Date();
const month = date.getMonth();
const year = date.getFullYear();

const startingSeason = month < 6 ? 0 : (month < 9 ? 1 : 2);

const startingSznText = startingSeason === 0 ? "Winter" : (startingSeason === 1 ? "Spring/Summer" : "Fall")

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };

export default function Home(){
    const [term, setTerm] = useState("");
    const [course, setCourse] = useState("");
    const [email, setEmail] = useState("");
    const [fname, setFname] = useState("");
    const [lname, setLname] = useState("");
    const [waiting, setWaiting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const [modalOpen, setModalOpen] = useState(false);
    const [openings, setOpenings] = useState(null);
    const [error, setError] = useState(null);
    const handleModalClose = () => setModalOpen(false);

    function handleChangeTerm(event) {
        setSubmitted(false);
        setTerm(event.target.value);
    }
    function handleChangeCourse(event) {
        setSubmitted(false);
        setCourse(event.target.value);
    }
    function handleChangeEmail(event) {
        setSubmitted(false);
        setEmail(event.target.value);
    }
    function handleChangeFname(event) {
        setSubmitted(false);
        setFname(event.target.value);
    }
    function handleChangeLname(event) {
        setSubmitted(false);
        setLname(event.target.value);
    }
    function invalidField(field) {
        if (field.length === 0 && submitted) {
            return [true, "This field is required."]
        }
    }
    function invalidEmail(field) {
        if (!(/^[a-z0-9]*@mcmaster\.ca$/gi.test(field)) && submitted) {
            return [true, "Invalid email address"]
        }
    }
    function emailCheck(field) {
        return /^[a-z0-9]*@mcmaster\.ca$/gi.test(field)
    }

    function submittable(){
        return term.length > 0 && course.length > 0 && emailCheck(email) && !waiting
    }
    function unsubmittable(){
        return !submittable()
    }

    async function sendCourseTrackForm(event) {
        event.preventDefault();
        setError(false);
        const finalCourse = course.toUpperCase();
        setCourse(finalCourse);
        setSubmitted(true);
        setWaiting(true);
        var formData;
        try {
            if (submittable()) {
                // all clear
                console.log(term)
                const termArray = term.split(/\s+/);
		        const seasonNum = termArray[1] == "Winter" ? 1 : (termArray[1] == "Spring/Summer" ? 5 : 9);
		        const termNum = `${termArray[0].charAt(0)}${termArray[0].charAt(2)}${termArray[0].charAt(3)}${seasonNum}`;
                formData = {
                    "term": termNum,
                    "course": finalCourse,
                    "email": email,
                    "fname": fname || "Anonymous",
                    "lname": lname || "Anonymous"
                }
                let response = await fetch("/api/getCourse", {
                    method: "post",
                    body: JSON.stringify(formData),
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                })
                if (!response.ok) {
                    throw new Error("HTTP error, status = " + response.status);
                }
                else {
                    await response.json()
                    .then(function (resData) {
                        console.log(resData);
                        setOpenings(resData);
                        
                        return resData;
                    })
                    .catch(e => {
                        setError(true);
                        console.error(e);
                    });
                }
            }
        }
        catch(e) {
            setError(true);
        }
        finally {
            setModalOpen(true);
            setWaiting(false);
        }
        
    }
    return (
        <Fragment>
            <Modal
            open={modalOpen}
            onClose={handleModalClose}
            aria-labelledby="trackConfirmTitle"
            aria-describedby="trackConfirmDescription"
            >
            <Box sx={modalStyle}>
                {(function(){
                    if (error){
                        return (
                            <Fragment>
                                <Typography id="trackConfirmTitle" variant="h6" component="h2">
                                Course offering not found
                                </Typography>
                                <Typography id="trackConfirmDescription" sx={{ mt: 2 }}>
                                {`Either an error happened, or we could not find ${course}'s ${term} offering. Make sure to precisely enter a valid and existing course code and its corresponding term.`}
                                </Typography>
                            </Fragment>
                        );
                    } else {
                        return (
                        <Fragment>
                            <Typography id="trackConfirmTitle" variant="h6" component="h2">
                            Course Watch Confirmation
                            </Typography>
                            <Typography id="trackConfirmDescription" sx={{ mt: 2 }}>
                            {`You are now watching ${course}'s ${term} offering. Below are the current statuses for each section:`}
                            </Typography>
                            <OfferingsTable data={openings}/>
                        </Fragment>
                        
                        )
                    }
                })()}
            </Box>
            </Modal>
            <Box m={2} pt={2}>
                <Container maxWidth="sm">
                    <Paper elevation={2}>
                        <form id="trackCourseForm" 
                        onSubmit={sendCourseTrackForm} 
                        noValidate>
                            <Typography m={2} pt={1} variant="h6">
                                    Track McMaster course availability
                            </Typography>
                            <Box m={2} pt={0}>
                                
                                <FormControl fullWidth>
                                    <InputLabel id="select-term-label">Term</InputLabel>
                                    <Select
                                        labelId="select-term-label"
                                        id="outlined-required"
                                        value={term}
                                        label="Term"
                                        error={invalidField(term)}
                                        onChange={handleChangeTerm}
                                    >
                                        <MenuItem value={`${year} ${startingSznText}`}>{year} {startingSznText}</MenuItem>
                                        {
                                            React.Children.toArray(
                                                Array.from(Array(3)).map((_,i) => {
                                                    const curYear = `${year + Math.floor((startingSeason + i + 1) / 3)}`
                                                    const curSzn = (startingSeason + i + 1) % 3
                                                    const sznText = curSzn === 0 ? "Winter" : (curSzn === 1 ? "Spring/Summer" : "Fall");

                                                    const seasonNum = curSzn === 0 ? 1 : (curSzn === 1 ? 5 : 9);
                                                    const termNum = `${curYear.charAt(0)}${curYear.charAt(2)}${curYear.charAt(3)}${seasonNum}`;
                                                    return <MenuItem value={termNum}>{curYear} {sznText}</MenuItem>
                                                })
                                            )
                                        }
                                    </Select>
                                    <FormHelperText sx={{color: "#d32f2f"}}>{invalidField(term)}</FormHelperText>
                                </FormControl>
                            </Box>
                            <Box m={2} pt={0} pb={0}>
                                <TextField
                                required
                                id="outlined-required"
                                label="Course (case insensitive)"
                                value={course}
                                disabled={term.length === 0}
                                error={invalidField(course)}
                                helperText={invalidField(course)}
                                onChange={handleChangeCourse}
                                //defaultValue=""
                                />
                            </Box>
                            <Box m={2} pt={0} pb={0} fullWidth>
                                <TextField
                                required
                                fullWidth
                                id="outlined-required"
                                label="Email (mcmaster.ca)"
                                value={email}
                                disabled={course.length === 0}
                                error={invalidEmail(email)}
                                helperText={invalidEmail(email)}
                                onChange={handleChangeEmail}
                                //defaultValue=""
                                />
                            </Box>
                            <Box>
                                <Typography m={2} variant="h7">
                                        Names are optional and will remain confidential.
                                </Typography>
                                <List  style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    padding: 0,
                                }} 
                                fullWidth>
                                    <ListItem>
                                        <TextField
                                        id="outlined-required"
                                        label="First name"
                                        value={fname}
                                        disabled={course.length === 0}
                                        onChange={handleChangeFname}
                                        //defaultValue=""
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <TextField
                                        id="outlined-required"
                                        label="Last name"
                                        value={lname}
                                        disabled={course.length === 0}
                                        onChange={handleChangeLname}
                                        //defaultValue=""
                                        />
                                    </ListItem>
                                </List>
                            </Box>
                            
                            
                            <Box m={2} pt={0} pb={3} fullWidth>
                            <Button 
                            disabled={unsubmittable()}
                            form="trackCourseForm" variant="contained" color="primary" type="submit" sx={{mt: 1}}>
                                Watch
                            </Button>
                            {waiting ? "Waiting..." : ""}
                            </Box>
                            
                        </form>
                    </Paper>
                </Container>
            </Box>
        </Fragment>
    );
}