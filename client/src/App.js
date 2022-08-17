import './App.css';
import * as React from 'react';
import ReactDOM from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink
} from "react-router-dom";
import { 
  AppBar, 
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  ThemeProvider,
  Paper
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CrisisAlertIcon from '@mui/icons-material/CrisisAlert';
import AdbIcon from '@mui/icons-material/Adb';
import { theme } from "./theme.js";

const pages = ['Home', 'About', 'Contact'];
const settings = ['Profile', 'Account', 'Dashboard', 'Logout'];


function App() {
  let activeClassName = "nav-active";
  let activeClassNameAlt = "nav-active-alt";
  let inactiveClassName = "nav-inactive";
  let siteName = "SeatWatch";
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };
  return (
	<ThemeProvider theme={theme}>
    <BrowserRouter>
		<Paper style={{position: 'sticky', bottom: 0, width: "100%"}}>
			<AppBar position="static">
			<Container maxWidth="xl">
				<Toolbar disableGutters>
					<CrisisAlertIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
					<Typography
						variant="h6"
						noWrap
						component="a"
						href="/"
						sx={{
						mr: 2,
						display: { xs: 'none', md: 'flex' },
						fontFamily: 'monospace',
						fontWeight: 700,
						letterSpacing: '.2rem',
						color: 'inherit',
						textDecoration: 'none',
						}}
						>
					{siteName}
					</Typography>
					<Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
					<IconButton
						size="large"
						aria-label="account of current user"
						aria-controls="menu-appbar"
						aria-haspopup="true"
						onClick={handleOpenNavMenu}
						color="inherit"
						>
						<MenuIcon />
					</IconButton>
						<Menu
					id="menu-appbar"
					anchorEl={anchorElNav}
					anchorOrigin={{
						vertical: 'bottom',
						horizontal: 'left',
					}}
					keepMounted
					transformOrigin={{
						vertical: 'top',
						horizontal: 'left',
					}}
					open={Boolean(anchorElNav)}
					onClose={handleCloseNavMenu}
					sx={{
						display: { xs: 'block', md: 'none' },
					}}
					>
						{pages.map((page) => (
						<NavLink to={page} color="primary" className={({ isActive }) => isActive ? activeClassName : inactiveClassName}>
							<MenuItem key={page} >
								<Typography textAlign="center">
								{page}
								</Typography>
							</MenuItem>
						</NavLink>
						))}
						</Menu>
					</Box>
					<CrisisAlertIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
					<Typography
						variant="h5"
						noWrap
						component="a"
						href=""
						sx={{
						mr: 2,
						display: { xs: 'flex', md: 'none' },
						flexGrow: 1,
						fontFamily: 'monospace',
						fontWeight: 700,
						letterSpacing: '.3rem',
						color: 'inherit',
						textDecoration: 'none',
						}}
					>
						{siteName}
					</Typography>
					<Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
						{pages.map((page) => (
							<NavLink to={page} className={({ isActive }) => isActive ? activeClassNameAlt : inactiveClassName} >
								<Button
								key={page}
								sx={{ my: 2, color: "inherit", display: 'block' }}
							>
								{page}
							</Button>
						</NavLink>
						
						))}
					</Box>
					

					
					{/*
					
					users???
					
					 <Box sx={{ flexGrow: 0 }}>
						<Tooltip title="Open settings">
						<IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
							<Avatar alt="Test Test" />
						</IconButton>
						</Tooltip>
						<Menu
						sx={{ mt: '45px' }}
						id="menu-appbar"
						anchorEl={anchorElUser}
						anchorOrigin={{
							vertical: 'top',
							horizontal: 'right',
						}}
						keepMounted
						transformOrigin={{
							vertical: 'top',
							horizontal: 'right',
						}}
						open={Boolean(anchorElUser)}
						onClose={handleCloseUserMenu}
						>
						{settings.map((setting) => (
							<MenuItem key={setting} onClick={handleCloseUserMenu}>
							<Typography textAlign="center">{setting}</Typography>
							</MenuItem>
						))}
						</Menu>
					</Box> */}


				</Toolbar>
			</Container>
			</AppBar>
			<Routes>
				<Route path="/" element={<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>} />
			</Routes>
			<AppBar position="static" style={{marginTop: 'calc(10% + 60px)',
				position: 'fixed',
				bottom: 0,
				width: '100%',
				textAlign: "center"
				}} 
				color="secondary">
				<span>
				{siteName} is not affiliated with <a href="https://www.mcmaster.ca">McMaster University</a>
				</span>
				
			</AppBar>
		</Paper>
		
    </BrowserRouter>
	</ThemeProvider>
  );
}

export default App;
