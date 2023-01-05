import * as React from 'react';

import {
	AppBar,
	Box,
	Toolbar,
	IconButton,
	Typography,
	Menu,
	Container,
	//   Avatar,
	Button,
	//   Tooltip,
	MenuItem,
	ThemeProvider,
	Paper
} from '@mui/material';
import {
	useParams
} from "react-router-dom";

function emailCheck(field) {
	return /^[a-z0-9]*@mcmaster\.ca$/gi.test(field)
}

export default function Unsubscribe() {
	const { id } = useParams()
	async function sendUnsubscribe() {
		const targetEmail = id + "@mcmaster.ca"
		
		try {
			if (!emailCheck(targetEmail)) {
				throw new Error("Invalid Email")
			}
			const formData = {
				email: targetEmail
			}
			let response = await fetch("/api/unsubscribe", {
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
					return resData;
				})
				.catch(e => {
					console.error(e);
				});
			}
		} catch (e) {

		} finally {

		}
	}
	React.useEffect(()=> {
		sendUnsubscribe()
	});
	return (
		<Box m={2} pt={2}>
			<Container maxWidth="sm">
				<Paper elevation={2}>
					<Box m={2} pt={1} pb={2}>
						<Typography m={2} pt={0} variant="h6">
							Unsubscribed
						</Typography>
						<Typography m={2} pt={0} variant="h7">
							{`You have unsubscribed from all courses associated with your email ${id}@mcmaster.ca`}
						</Typography>
					</Box>
				</Paper>
			</Container>
		</Box>);
}