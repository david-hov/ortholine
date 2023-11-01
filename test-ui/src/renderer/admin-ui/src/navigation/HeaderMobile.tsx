import * as React from 'react';
import { useLogout, useRedirect } from 'react-admin';

import { ListItemIcon } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import DashboardIcon from '@mui/icons-material/Home';
import ClientsIcon from '@mui/icons-material/People';
import VisitsIcon from '@mui/icons-material/Assignment';
import DoctorsIcon from '@mui/icons-material/AccountCircle';
import CalendarIcon from '@mui/icons-material/CalendarMonth';
import ExitIcon from '@mui/icons-material/PowerSettingsNew';
import NotFinishedVisitsIcon from '@mui/icons-material/HourglassEmpty';

const navItems = [
    {
        'name': 'Գլխավոր',
        'path': '/',
        'icon': <DashboardIcon />,
    },
    {
        'name': 'Օրացույց',
        'path': '/calendar',
        'icon': <CalendarIcon />,
    },
    {
        'name': 'Անկետաներ',
        'path': '/clients',
        'icon': <ClientsIcon />,
    },
    {
        'name': 'Այցեր',
        'path': '/visits',
        'icon': <VisitsIcon />,
    },
    {
        'name': 'Բժիշկներ',
        'path': '/doctors',
        'icon': <DoctorsIcon />,
    },
    {
        'name': 'Իմ էջը',
        'path': '/doctorPage',
        'icon': <DoctorsIcon />,
    }
];

export default function HeaderMobile(props: any) {
    const { window, userName } = props;
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const redirect = useRedirect();
    const logout = useLogout();

    const handleDrawerToggle = () => {
        setMobileOpen((prevState) => !prevState);
    };

    const drawer = (
        <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ margin: 0 }}>
                {userName}
            </Typography>
            <Divider />
            <List>
                {navItems.map((item: any, key: number) => {
                    if (props.permissions != 'doctor' && item.path == '/doctorPage') {
                        return;
                    } else if (props.permissions == 'doctor' && item.path == '/doctors') {
                        return;
                    }
                    return (
                        <ListItem key={key} disablePadding>
                            <ListItemButton onClick={() => redirect(`${item.path}`)} sx={{ textAlign: 'center' }}>
                                <ListItemIcon>
                                    {item.icon}
                                </ListItemIcon>
                                {props.notFinishedVisits.length !== 0 && item.path == '/visits' ?
                                    <div>
                                        <div key={key} style={{
                                            position: 'absolute',
                                            right: '15px',
                                            top: '5px',

                                        }}>
                                            <NotFinishedVisitsIcon className='alertIcon' />
                                        </div>
                                        <ListItemText style={{ textAlign: 'left' }} primary={item.name} />
                                    </div> :
                                    <ListItemText style={{ textAlign: 'left' }} primary={item.name} />
                                }
                            </ListItemButton>
                        </ListItem>
                    )
                })}
            </List>
            <p style={{
                marginBottom: '0', textAlign: 'left', position: 'absolute',
                bottom: '5px'
            }}><ExitIcon fontSize='large' onClick={() => logout()} color='warning' /></p>
        </Box>
    );

    const container = window !== undefined ? () => window().document.body : undefined;

    return (
        <Box sx={{ display: 'flex', height: '55px' }}>
            <CssBaseline />
            <AppBar component="nav">
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>
            <Box component="nav">
                <Drawer
                    container={container}
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true, // Better open performance on mobile.
                    }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 'fit-content' },
                    }}
                >
                    {drawer}
                </Drawer>
            </Box>
        </Box>
    );
}