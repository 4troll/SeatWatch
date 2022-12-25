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
    function invalidTerm() {
        if (term.length === 0 && submitted) {
            return [true, "This field is required."]
        }
    }

    function invalidCourse() {
        if (course.length === 0 && submitted) {
            return [true, "This field is required."]
        }
    }

    async function sendCourseTrackForm(event) {
        event.preventDefault();
        setError(false);
        const finalCourse = course.toUpperCase();
        setCourse(finalCourse);
        var formData;
        try {
            if (term.length > 0 && course.length > 0) {
                // all clear
                formData = {
                    "term": term,
                    "course": finalCourse,
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
        }
        setSubmitted(true);
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
            <Box m={2} pt={3}>
                <Container maxWidth="sm">
                    <Paper elevation={2}>
                        <form id="trackCourseForm" 
                        onSubmit={sendCourseTrackForm} 
                        noValidate>
                            <Box m={2} pt={3}>
                                <FormControl fullWidth>
                                    <InputLabel id="select-term-label">Term</InputLabel>
                                    <Select
                                        labelId="select-term-label"
                                        id="select-term"
                                        value={term}
                                        label="Term"
                                        error={invalidTerm()}
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
                                    <FormHelperText sx={{color: "#d32f2f"}}>{invalidTerm()}</FormHelperText>
                                </FormControl>
                            </Box>
                            <Box m={2} pt={2} pb={3}>
                                <TextField
                                required
                                id="outlined-required"
                                label="Course (case insensitive)"
                                value={course}
                                error={invalidCourse()}
                                helperText={invalidCourse()}
                                onChange={handleChangeCourse}
                                //defaultValue=""
                                />
                                <Button form="trackCourseForm" variant="contained" color="primary" type="submit" sx={{mt: 1}}>
                                    Track
                                </Button>
                            </Box>
                        </form>
                    </Paper>
                </Container>
            </Box>
        </Fragment>
    );
}