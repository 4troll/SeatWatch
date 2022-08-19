import React, {
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
    TextField
  } from '@mui/material';

const date = new Date();
const month = date.getMonth();
const year = date.getFullYear();

const startingSeason = month < 6 ? 0 : (month < 9 ? 1 : 2);

const startingSznText = startingSeason == 0 ? "Winter" : (startingSeason == 1 ? "Spring/Summer" : "Fall")

export default function Home(){
    const [term, setTerm] = useState("");
    function handleChange(event) {
        setTerm(event.target.value);
    }
    return (
        <Box m={2} pt={3}>
            <Container maxWidth="sm">
                <Paper elevation={2}>
                    <Box m={2} pt={3}>
                        <FormControl fullWidth>
                            <InputLabel id="select-term-label">Term</InputLabel>
                            <Select
                                labelId="select-term-label"
                                id="select-term"
                                value={term}
                                label="Term"
                                onChange={handleChange}
                            >
                                <MenuItem value={0}>{year} {startingSznText}</MenuItem>
                                {
                                    React.Children.toArray(
                                        Array.from(Array(3)).map((_,i) => {
                                            const curYear = year + Math.floor((startingSeason + i + 1) / 3)
                                            const curSzn = (startingSeason + i + 1) % 3

                                            const sznText = curSzn == 0 ? "Winter" : (curSzn == 1 ? "Spring/Summer" : "Fall")
                                            return <MenuItem value={i + 1}>{curYear} {sznText}</MenuItem>
                                        })
                                    )
                                }
                            </Select>
                        </FormControl>
                    </Box>
                    <Box m={2} pt={2} pb={3}>
                        <TextField
                        required
                        id="outlined-required"
                        label="Course"
                        defaultValue="Hello World"
                        />
                    </Box>
                    
                </Paper>
            </Container>
        </Box>
    );
}