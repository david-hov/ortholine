import { Admin, Resource, defaultTheme } from 'react-admin';
import polyglotI18nProvider from 'ra-i18n-polyglot';
import { ReactNotifications } from 'react-notifications-component';
import 'react-notifications-component/dist/theme.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import visits from './visits';
import dashboard from './dashboard';
import doctors from './doctors';
import calendar from './calendar';
import insurance from './insurance';
import rooms from './rooms';
import clientsTemplates from './clientsTemplates';
import priceLists from './priceLists';
import laboratories from './laboratories';
import salaries from './salaries';
import users from './users';
import { LoginPage } from './loginPage';
import statistics from './statistics';
import doctorPage from './doctorPage';
import settings from './settings';
import superNotifications from './superNotifications';
import { dataProvider } from './dataProvider';
import { authProvider } from './authProvider';
import Layout from './Layout';
import clients from './clients';
import { SocketProvider } from './utils/socketConfig';
const armenianMessages = require('ra-language-armenian');

// missing translations from lib (գանդոնի ձեռի գործ էլի, ինչ ասես)
armenianMessages.ra.action.clear_array_input = 'Մաքրել ամբողջը';
armenianMessages.ra.action.move_up = 'Բարձրացնել';
armenianMessages.ra.action.move_down = 'Իջեցնել';
armenianMessages.ra.action.open = 'Բացել';
armenianMessages.ra.action.unselect = 'Չեղարկել';
armenianMessages.ra.message.clear_array_input = 'Բոլոր տարբերակները կհեռացվեն';
//

const messages: any = {
    'am': armenianMessages,
};
const i18nProvider = polyglotI18nProvider((locale: any) => messages['am']);

const App = () => (
    <div className='main'>
        <ReactNotifications />
        <SocketProvider>
            <Admin
                loginPage={LoginPage}
                i18nProvider={i18nProvider}
                dataProvider={dataProvider}
                authProvider={authProvider}
                layout={Layout}
                theme={{
                    ...defaultTheme,
                    palette: {
                        background: {
                            default: '#fafafb',
                        },
                    },
                }}
                requireAuth
            >
                <Resource name='dashboard' {...dashboard} />
                <Resource name='statistics' {...statistics} />
                <Resource name='doctorPage' {...doctorPage} />
                <Resource name='calendar' {...calendar} />
                <Resource name="clients" {...clients} />
                <Resource name="visits" {...visits} />
                <Resource name="attachments" />
                <Resource name='doctors' {...doctors} />
                <Resource name='insurance' {...insurance} />
                <Resource name='rooms' {...rooms} />
                <Resource name='clientsTemplates' {...clientsTemplates} />
                <Resource name='priceLists' {...priceLists} />
                <Resource name='laboratories' {...laboratories} />
                <Resource name='salaries' {...salaries} />
                <Resource name='users' {...users} />
                <Resource name='settings' {...settings} />
                <Resource name='superNotifications' {...superNotifications} />
                <Resource name='doctorSalaries' />
            </Admin>
        </SocketProvider>
        {/* <p style={{
            position: 'absolute',
            bottom: '0',
            width: '100%',
            textAlign: 'center',
        }}>Powered by Wesage.io</p> */}
    </div>
);

export default App;
