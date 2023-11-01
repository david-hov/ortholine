import { Tabs, Tab, Toolbar, AppBar, Box, Menu, useMediaQuery } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { Link, matchPath, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Home';
import DoorsIcon from '@mui/icons-material/SensorDoor';
import ClientsIcon from '@mui/icons-material/People';
import VisitsIcon from '@mui/icons-material/Assignment';
import DoctorsIcon from '@mui/icons-material/AccountCircle';
import CalendarIcon from '@mui/icons-material/CalendarMonth';
import InsuranceIcon from '@mui/icons-material/HealthAndSafety';
import SettingsIcon from '@mui/icons-material/Settings';
import LateIcon from '@mui/icons-material/AssignmentLate';
import WaitingIcon from '@mui/icons-material/Alarm';
import NotFinishedVisitsIcon from '@mui/icons-material/HourglassEmpty';
import PriceListsIcon from '@mui/icons-material/PriceChange';
import LaboratoriesIcon from '@mui/icons-material/Biotech';
import OtherIcon from '@mui/icons-material/FolderCopy';
import MoneyIcon from '@mui/icons-material/LocalAtm';
import UsersIcon from '@mui/icons-material/Accessibility';
import ExitIcon from '@mui/icons-material/PowerSettingsNew';
import StatisticsIcon from '@mui/icons-material/Assessment';
import PriceIssueIcon from '@mui/icons-material/NewReleases';
import ClientsTemplatesIcon from '@mui/icons-material/Diversity2';
import SuperNotificationsIcon from '@mui/icons-material/CurrencyExchange';
import CallClientsIcon from '@mui/icons-material/Phone';
import CallLabIcon from '@mui/icons-material/PhoneEnabled';
import NotestIcon from '@mui/icons-material/Comment';
import SpecialClientsTemplatesIcon from '@mui/icons-material/Stars';

import { dataProvider } from '../dataProvider';
import { useSocket } from '../utils/socketHook';
import { usePermissions, useLogout } from 'react-admin';
import HeaderMobile from './HeaderMobile';

const Header = () => {
    const logout = useLogout();
    const isSmall = useMediaQuery('(max-width:600px)');
    const { isLoading, permissions } = usePermissions();
    const [notFinishedClients, setNotFinishedClients] = useState<any>([]);
    const [waitingClients, setWaitingClients] = useState<any>([]);
    const [notFinishedVisits, setNotFinishedVisits] = useState<any>([]);
    const [priceIssues, setPriceIssues] = useState<any>([]);
    const [callClients, setCallClients] = useState<any>([]);
    const [callLabs, setCallLabs] = useState<any>([]);
    const [superPriceChanges, setSuperPriceChanges] = useState<any>([]);
    const [clientsReminder, setClientsReminder] = useState<any>([]);
    const [clientsTemplates, setClientsTemplates] = useState<any>([]);
    const location = useLocation();
    const socket = useSocket();
    // const history = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const [userName, setUserName] = useState<any>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: any) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    useEffect(() => {
        // history('/dashboard');
        const getNotFinishedData = async () => {
            const { data } = await dataProvider.getList('notifications/notFinished', {
                pagination: { page: 1, perPage: 1000 },
                sort: { field: 'id', order: 'DESC' },
                filter: { isFinished: 'needToCall', isWaiting: true, notFinishedVisitNotes: true }
            })

            if (data.length !== 0) {
                const waiting = data.filter((el: any) => el.isWaiting == true);
                const notFinished = data.filter((el: any) => el.isFinished == 'needToCall');
                setNotFinishedClients(notFinished);
                setWaitingClients(waiting);
            }
        }

        const getCallClientsLabs = async () => {
            const { data } = await dataProvider.getList('notifications/callClientsLabs', {
                pagination: { page: 1, perPage: 1000 },
                sort: { field: 'id', order: 'DESC' },
                filter: {}
            })
            setCallClients(data[0]);
            setCallLabs(data[1]);
        }

        const getPriceChanges = async () => {
            const { data } = await dataProvider.getList('superNotifications', {
                pagination: { page: 1, perPage: 100000 },
                sort: { field: 'id', order: 'DESC' },
                filter: {}
            })
            setSuperPriceChanges(data);
        }

        const getClientsTemplates = async () => {
            const { data } = await dataProvider.getList('clientsTemplates', {
                pagination: { page: 1, perPage: 100000 },
                sort: { field: 'id', order: 'DESC' },
                filter: { confirmed: false }
            })
            setClientsTemplates(data);
        }

        const getClientsReminder = async () => {
            const { data } = await dataProvider.getList('notifications/clientsReminder', {
                pagination: { page: 1, perPage: 100000 },
                sort: { field: 'id', order: 'DESC' },
                filter: {}
            })
            setClientsReminder(data);
        }

        const getPriceIssues = async () => {
            const { data } = await dataProvider.getList('notifications/priceIssues', {
                pagination: { page: 1, perPage: 1000 },
                sort: { field: 'id', order: 'DESC' },
                filter: {}
            })
            setPriceIssues(data);
        }

        const getNotFinishedVisits = async () => {
            const { data } = await dataProvider.getList('notifications/notFinishedVisits', {
                pagination: { page: 1, perPage: 1000 },
                sort: { field: 'id', order: 'DESC' },
                filter: {}
            })
            setNotFinishedVisits(data);
        }

        if (permissions && permissions == 'doctor') {
            getNotFinishedVisits();
        }

        if (permissions && permissions !== 'doctor') {
            getNotFinishedData();
            getPriceIssues();
            getCallClientsLabs();
            getClientsReminder();
            getNotFinishedVisits();
        }

        if (permissions && permissions == 'super') {
            getPriceChanges();
            getClientsTemplates();
        }


        setUserName(localStorage.getItem('name'));
    }, [!isLoading])

    const onMessage = useCallback(async () => {
        const { data } = await dataProvider.getList('notifications/notFinished', {
            pagination: { page: 1, perPage: 1000 },
            sort: { field: 'id', order: 'DESC' },
            filter: { isFinished: false, isWaiting: true, notFinishedVisitNotes: true }
        })
        const getClientsReminder = async () => {
            const { data } = await dataProvider.getList('notifications/clientsReminder', {
                pagination: { page: 1, perPage: 100000 },
                sort: { field: 'id', order: 'DESC' },
                filter: {}
            })
            setClientsReminder(data);
        }
        const getPriceIssues = async () => {
            const { data } = await dataProvider.getList('notifications/priceIssues', {
                pagination: { page: 1, perPage: 1000 },
                sort: { field: 'id', order: 'DESC' },
                filter: {}
            })
            setPriceIssues(data);
        }
        const getClientsTemplates = async () => {
            const { data } = await dataProvider.getList('clientsTemplates', {
                pagination: { page: 1, perPage: 100000 },
                sort: { field: 'id', order: 'DESC' },
                filter: { confirmed: false }
            })
            setClientsTemplates(data);
        }
        const getPriceChanges = async () => {
            const { data } = await dataProvider.getList('superNotifications', {
                pagination: { page: 1, perPage: 100000 },
                sort: { field: 'id', order: 'DESC' },
                filter: {}
            })
            setSuperPriceChanges(data);
        }
        const getCallClientsLabs = async () => {
            const { data } = await dataProvider.getList('notifications/callClientsLabs', {
                pagination: { page: 1, perPage: 1000 },
                sort: { field: 'id', order: 'DESC' },
                filter: {}
            })
            setCallClients(data[0]);
            setCallLabs(data[1]);
        }

        const getNotFinishedVisits = async () => {
            const { data } = await dataProvider.getList('notifications/notFinishedVisits', {
                pagination: { page: 1, perPage: 1000 },
                sort: { field: 'id', order: 'DESC' },
                filter: {}
            })
            setNotFinishedVisits(data);
        }

        if (permissions && permissions == 'doctor') {
            getNotFinishedVisits();
        }

        if (permissions && permissions == 'super') {
            getPriceChanges();
            getClientsTemplates();
        }

        if (permissions && permissions !== 'doctor') {
            const waiting = data.filter((el: any) => el.isWaiting == true);
            const notFinished = data.filter((el: any) => el.isFinished == 'needToCall');
            setNotFinishedClients(notFinished);
            setWaitingClients(waiting);
            getPriceIssues();
            getCallClientsLabs();
            getClientsReminder();
            getNotFinishedVisits();
        }

    }, [!isLoading]);

    useEffect(() => {
        socket.addEventListener('msgToClient', onMessage);
        return () => {
            socket.removeEventListener('msgToClient', onMessage);
        };
    }, [socket, onMessage])

    let currentPath = '/dashboard';
    let currentOthersPath = '/insurance';
    let settingsUsers = '/';
    if (!!matchPath('/clients/*', location.pathname)) {
        currentPath = '/clients';
    } else if (!!matchPath('/visits/*', location.pathname)) {
        currentPath = '/visits';
    } else if (!!matchPath('/insurance/*', location.pathname)) {
        currentOthersPath = '/insurance';
    } else if (!!matchPath('/rooms/*', location.pathname)) {
        currentOthersPath = '/rooms';
    } else if (!!matchPath('/calendar/*', location.pathname)) {
        currentPath = '/calendar';
    } else if (!!matchPath('/doctors/*', location.pathname)) {
        currentPath = '/doctors';
    } else if (!!matchPath('/clientsTemplates/*', location.pathname)) {
        currentOthersPath = '/clientsTemplates';
    } else if (!!matchPath('/priceLists/*', location.pathname)) {
        currentOthersPath = '/priceLists';
    } else if (!!matchPath('/laboratories/*', location.pathname)) {
        currentOthersPath = '/laboratories';
    } else if (!!matchPath('/users/*', location.pathname)) {
        settingsUsers = '/users';
    } else if (!!matchPath('/settings/*', location.pathname)) {
        currentOthersPath = '/settings';
    } else if (!!matchPath('/dashboard/*', location.pathname)) {
        currentPath = '/dashboard';
    } else if (!!matchPath('/statistics/*', location.pathname)) {
        currentOthersPath = '/statistics';
    } else if (!!matchPath('/superNotifications/*', location.pathname)) {
        settingsUsers = '/superNotifications';
    } else if (!!matchPath('/salaries/*', location.pathname)) {
        currentOthersPath = '/salaries';
    } else if (!!matchPath('/doctorPage/*', location.pathname)) {
        currentPath = '/doctorPage';
    }
    else {
        currentPath = '/dashboard';
        currentOthersPath = '/insurance';
        settingsUsers = '/';
    }

    return (
        <div style={{
            position: 'sticky',
            top: '0',
            zIndex: '9',
        }}>
            {isSmall ? <HeaderMobile notFinishedVisits={notFinishedVisits} permissions={permissions} userName={userName} /> :
                <Box component='nav' sx={{ flexGrow: 1 }}>
                    <AppBar position='static' color='primary'>
                        <Toolbar variant='dense'>
                            <Box flex={1} display='flex' justifyContent='space-between'>
                                <Box display='flex'>
                                    <Tabs
                                        value={currentPath}
                                        aria-label='Navigation Tabs'
                                        indicatorColor='secondary'
                                        textColor='inherit'
                                    >
                                        <Tab
                                            label={'Գլխավոր'}
                                            icon={<DashboardIcon />}
                                            component={Link}
                                            to='/dashboard'
                                            value='/dashboard'
                                        />
                                        <Tab
                                            className='guide-calendar'
                                            label={'Օրացույց'}
                                            icon={<CalendarIcon />}
                                            component={Link}
                                            to='/calendar'
                                            value='/calendar'
                                        />
                                        <Tab
                                            className='guide-clients'
                                            style={{ position: 'relative' }}
                                            icon={<ClientsIcon />}
                                            label={<div>
                                                <div>Անկետաներ</div>
                                                {clientsReminder.length !== 0 ?
                                                    <div title='Պացիենտը ունի հիշեցում'>
                                                        <span style={{
                                                            position: 'absolute',
                                                            left: '2px',
                                                            bottom: '3px',
                                                            fontSize: '15px'
                                                        }} className='notify-icon-counter'>{clientsReminder.length}</span>
                                                        <div style={{
                                                            position: 'absolute',
                                                            left: '-2px',
                                                            bottom: '10px',
                                                        }}>
                                                            <NotestIcon fontSize='small' className='alertIcon' />
                                                        </div>
                                                    </div>
                                                    : null
                                                }
                                                {waitingClients.length !== 0 ?
                                                    <div title='Պացիենտը ունի այց և սպասում է շտապ այցի'>
                                                        <span style={{
                                                            top: '1px',
                                                            left: waitingClients.length > 9 ? '0' : '5px',
                                                        }} className='notify-icon-counter'>{waitingClients.length}</span>
                                                        <div style={{
                                                            position: 'absolute',
                                                            left: waitingClients.length > 9 ? '19px' : '15px',
                                                            top: '5px',
                                                        }}>
                                                            <WaitingIcon className='alertIcon' />
                                                        </div>
                                                    </div> : null}
                                                {notFinishedClients.length !== 0 ?
                                                    <div title='Պացիենտը չունի հետագա այց'>
                                                        <span style={{
                                                            top: '1px',
                                                            right: notFinishedClients.length > 9 ? '9px' : '5px',
                                                        }} className='notify-icon-counter'>{notFinishedClients.length}</span>
                                                        <div style={{
                                                            position: 'absolute',
                                                            right: notFinishedClients.length > 9 ? '25px' : '15px',
                                                            top: '5px',
                                                        }}>
                                                            <LateIcon className='alertIcon' />
                                                        </div></div> : null
                                                }
                                            </div>}
                                            component={Link}
                                            to='/clients'
                                            value='/clients'
                                        />
                                        <Tab
                                            style={{ position: 'relative' }}
                                            icon={<VisitsIcon />}
                                            className='guide-visits'
                                            label={<div>
                                                <div>Այցեր</div>
                                                {priceIssues.length !== 0 ?
                                                    <div title='Առկա է անհամապատասխանություն արժեքների մեջ'>
                                                        <span style={{
                                                            top: '1px',
                                                            left: priceIssues.length > 9 ? '0' : '5px',
                                                        }} className='notify-icon-counter'>{priceIssues.length}</span>
                                                        <div style={{
                                                            position: 'absolute',
                                                            left: priceIssues.length > 9 ? '18px' : '15px',
                                                            top: '5px',
                                                        }}>
                                                            <PriceIssueIcon className='alertIcon' />
                                                        </div>
                                                    </div>
                                                    : null
                                                }
                                                {callClients.length !== 0 ?
                                                    <div title='Զանգ պացիենտին, հարցման համար'>
                                                        <span style={{
                                                            position: 'absolute',
                                                            left: '2px',
                                                            bottom: '3px',
                                                            fontSize: '15px'
                                                        }} className='notify-icon-counter'>{callClients.length}</span>
                                                        <div style={{
                                                            position: 'absolute',
                                                            left: '2px',
                                                            bottom: '10px',
                                                        }}>
                                                            <CallClientsIcon fontSize='small' className='alertIcon' />
                                                        </div>
                                                    </div>
                                                    : null
                                                }
                                                {callLabs.length !== 0 ?
                                                    <div title='Զանգ լաբորատորիա, հարցման համար'>
                                                        <span style={{
                                                            position: 'absolute',
                                                            right: '5px',
                                                            bottom: '3px',
                                                            fontSize: '15px'
                                                        }} className='notify-icon-counter'>{callLabs.length}</span>
                                                        <div style={{
                                                            position: 'absolute',
                                                            right: '5px',
                                                            bottom: '9px',
                                                        }}>
                                                            <CallLabIcon fontSize='small' className='alertIcon' />
                                                        </div>
                                                    </div>
                                                    : null
                                                }
                                                {notFinishedVisits.length !== 0 ?
                                                    <div title='Բժիշկը չի լրացրել կատարված աշխատանքը'>
                                                        <span style={{
                                                            top: '1px',
                                                            right: notFinishedVisits.length > 9 ? '0' : '5px',
                                                        }} className='notify-icon-counter'>{notFinishedVisits.length}</span>
                                                        <div style={{
                                                            position: 'absolute',
                                                            right: '15px',
                                                            top: '5px',
                                                        }}>
                                                            <NotFinishedVisitsIcon className='alertIcon' />
                                                        </div>
                                                    </div> : null
                                                }
                                            </div>}
                                            component={Link}
                                            to='/visits'
                                            value='/visits'
                                        />
                                        {permissions == 'doctor' ?
                                            <Tab
                                                icon={<DoctorsIcon />}
                                                label={'Իմ Էջը'}
                                                component={Link}
                                                onClick={handleClose}
                                                to='/doctorPage'
                                                value='/doctorPage'
                                            /> :
                                            <Tab
                                                icon={<DoctorsIcon />}
                                                label={'Բժիշկներ'}
                                                className='guide-doctors'
                                                component={Link}
                                                onClick={handleClose}
                                                to='/doctors'
                                                value='/doctors'
                                            />
                                        }
                                        {permissions == 'doctor' ? null :
                                            <Tab
                                                className='guide-other'
                                                icon={<OtherIcon />}
                                                label={
                                                    <div>
                                                        <div>Այլ</div>
                                                        {clientsTemplates.length !== 0 ?
                                                            <div title='Չհաստատված հատուկ աղբյուրներ'>
                                                                <span style={{
                                                                    top: '1px',
                                                                    right: '5px',
                                                                }} className='notify-icon-counter'>{clientsTemplates.length}</span>
                                                                <div style={{
                                                                    position: 'absolute',
                                                                    right: '15px',
                                                                    top: '5px',
                                                                }}>
                                                                    <SpecialClientsTemplatesIcon className='alertIcon' />
                                                                </div>
                                                            </div> : null
                                                        }
                                                    </div>
                                                }
                                                id="basic-button"
                                                aria-controls={open ? 'basic-menu' : undefined}
                                                aria-haspopup="true"
                                                aria-expanded={open ? 'true' : undefined}
                                                onClick={handleClick}
                                            />
                                        }
                                        <Tabs
                                            className='settingsUsers'
                                            value={settingsUsers}
                                            indicatorColor='secondary'
                                            textColor='inherit'
                                        >
                                            {permissions == 'super' ?
                                                <Tab
                                                    label={
                                                        <div>
                                                            <div>Արժ. Փոփոխ.</div>
                                                            {superPriceChanges.length !== 0 ?
                                                                <div>
                                                                    <span style={{
                                                                        top: '1px',
                                                                        left: '20px',
                                                                    }} className='notify-icon-counter'>{superPriceChanges.length}</span>
                                                                </div>
                                                                : null
                                                            }
                                                        </div>
                                                    }
                                                    icon={<SuperNotificationsIcon />}
                                                    component={Link}
                                                    to='/superNotifications'
                                                    value='/superNotifications'
                                                /> : null
                                            }
                                            {permissions == 'doctor' || permissions == 'administration' ? null :
                                                <Tab
                                                    className='guide-users'
                                                    icon={<UsersIcon />}
                                                    label={'Օգտվողներ'}
                                                    component={Link}
                                                    to='/users'
                                                    value='/users'
                                                />
                                            }
                                            <Tab
                                                icon={<ExitIcon color='warning' />}
                                                label={userName !== null ? userName : 'Ելք'}
                                                component={Link}
                                                onClick={() => logout()}
                                                to='/'
                                                value='/'
                                            />
                                        </Tabs>
                                        {permissions == 'doctor' ? null :
                                            <Menu
                                                id="basic-menu"
                                                anchorEl={anchorEl}
                                                open={open}
                                                onClose={handleClose}
                                                MenuListProps={{
                                                    'aria-labelledby': 'basic-button',
                                                }}
                                            >
                                                <Tabs
                                                    style={{
                                                        justifyContent: 'space-around'
                                                    }}
                                                    value={currentOthersPath}
                                                    className='sub-basic-menu'
                                                    variant="scrollable"
                                                    scrollButtons="auto"
                                                    aria-label="scrollable auto tabs example"
                                                    indicatorColor='secondary'
                                                >
                                                    <Tab
                                                        className='guide-insurance'
                                                        icon={<InsuranceIcon />}
                                                        label={'Ապահովագրական'}
                                                        component={Link}
                                                        onClick={handleClose}
                                                        to='/insurance'
                                                        value='/insurance'
                                                    />
                                                    <Tab
                                                        className='guide-rooms'
                                                        icon={<DoorsIcon />}
                                                        label={'Սենյակներ'}
                                                        component={Link}
                                                        onClick={handleClose}
                                                        to='/rooms'
                                                        value='/rooms'
                                                    />
                                                    <Tab
                                                        className='guide-clientsTemplates'
                                                        icon={<ClientsTemplatesIcon />}
                                                        label={'Աղբյուր'}
                                                        component={Link}
                                                        onClick={handleClose}
                                                        to='/clientsTemplates'
                                                        value='/clientsTemplates'
                                                    />
                                                    <Tab
                                                        className='guide-priceLists'
                                                        icon={<PriceListsIcon />}
                                                        label={'Գնացուցակ'}
                                                        component={Link}
                                                        onClick={handleClose}
                                                        to='/priceLists'
                                                        value='/priceLists'
                                                    />
                                                    <Tab
                                                        icon={<LaboratoriesIcon />}
                                                        label={'Լաբորատորիաներ'}
                                                        component={Link}
                                                        onClick={handleClose}
                                                        to='/laboratories'
                                                        value='/laboratories'
                                                    />
                                                    <Tab
                                                        icon={<MoneyIcon />}
                                                        label={'Աշխատավարձեր'}
                                                        component={Link}
                                                        onClick={handleClose}
                                                        to='/salaries'
                                                        value='/salaries'
                                                    />
                                                    {permissions == 'doctor' || permissions == 'administration' ? null :
                                                        <Tab
                                                            label={'Վիճակագրություն'}
                                                            icon={<StatisticsIcon />}
                                                            component={Link}
                                                            onClick={handleClose}
                                                            to='/statistics'
                                                            value='/statistics'
                                                        />
                                                    }
                                                    {permissions == 'doctor' || permissions == 'administration' ? null :
                                                        <Tab
                                                            icon={<SettingsIcon />}
                                                            label={'Կարգավորում'}
                                                            component={Link}
                                                            onClick={handleClose}
                                                            to='/settings'
                                                            value='/settings'
                                                        />
                                                    }
                                                </Tabs>
                                            </Menu>
                                        }
                                    </Tabs>
                                </Box>
                            </Box>
                        </Toolbar>
                    </AppBar>
                </Box >
            }
        </div>
    );
};

export default Header;
