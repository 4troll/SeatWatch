import * as React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TablePagination,
    TableHead,
    TableRow,
    Paper
} from '@mui/material';

export default function OfferingsTable(props){
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
  
    const handleChangePage = (event, newPage) => {
      setPage(newPage);
    };
  
    const handleChangeRowsPerPage = (event) => {
      setRowsPerPage(+event.target.value);
      setPage(0);
    };

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
            {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((row) => (
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
      
    </TableContainer>
    <TablePagination
        rowsPerPageOptions={[3, 5, 7]}
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      </Paper>);
}