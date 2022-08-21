import * as React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper
} from '@mui/material';

export default function OfferingsTable(props){
    const rows = props.data;
    return (
    <Paper elevation={5}>
    <TableContainer sx={{mt: 1}}>
      
        <Table aria-label="table" >
            <TableHead>
            <TableRow>
                <TableCell>Section</TableCell>
                <TableCell align="right">Status</TableCell>
            </TableRow>
            </TableHead>
            <TableBody>
            {rows.map((row) => (
                <TableRow
                key={row.section}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                <TableCell component="th" scope="row">
                    {row.section}
                </TableCell>
                <TableCell align="right">{row.status}</TableCell>
                </TableRow>
            ))}
            </TableBody>
        </Table>
      
    </TableContainer></Paper>);
}