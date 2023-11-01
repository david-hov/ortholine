import {
    List,
    TextField,
    CreateButton,
    Datagrid,
    TopToolbar,
    EditButton,
    Pagination,
    NullableBooleanInput,
    NumberField,
    useRefresh,
    usePermissions,
    Loading,
} from 'react-admin';
import { Box, Typography } from '@mui/material';
import { matchPath, useLocation, useNavigate } from 'react-router-dom';
import ShowIcon from '@mui/icons-material/Visibility';

import { ClientsTemplatesCreate } from './ClientsTemplatesCreate';
import { ClientsTemplatesEdit } from './ClientsTemplatesEdit';
import { useSocket } from '../utils/socketHook';
import { useCallback, useEffect } from 'react';

const LoadedGridList = () => {
    const location = useLocation();

    const postRowStyle = (record: any) => {
        const selectedField = matchPath('/clientsTemplates/:id', location.pathname);
        if (record.id == selectedField?.params.id) {
            return ({
                backgroundColor: '#a6c1c9',
            })
        }
    };

    return (
        <Datagrid rowStyle={postRowStyle}>
            <TextField sortable={false} emptyText='-' source='name' label='Անուն' />
            <TextField sortable={false} emptyText='-' label="Բժիշկ" source="doctors.name" />
            <NumberField sortable={false} emptyText='-' source='percentage' label='Տոկոս %' />
            <EditButton icon={<ShowIcon />} label='Տեսնել' />
        </Datagrid>
    );
}

const Empty = () => (
    <Box textAlign='center'>
        <Typography variant='h4' paragraph>
            Ցանկը դատարկ է
        </Typography>
        <CreateButton
            className='guide-clientsTemplates-create'
            variant='contained' />
    </Box>
);

const ClientsTemplatesActions = () => {
    return (
        <TopToolbar>
            <CreateButton
                className='guide-clientsTemplates-create'
                style={{
                    padding: '10px',
                    fontWeight: 'bolder'
                }}
                variant='contained'
                sx={{ marginLeft: 2 }}
            />
        </TopToolbar>
    );
};

const PostPagination = (props: any) => <Pagination rowsPerPageOptions={[10, 25, 50, 100]} {...props} />;

export const ClientsTemplatesList = () => {
    const { permissions, isLoading } = usePermissions();
    const location = useLocation();
    const history = useNavigate();
    const refresh = useRefresh();
    const matchCreate = matchPath('/clientsTemplates/create', location.pathname);
    const matchEdit = matchPath('/clientsTemplates/:id', location.pathname);
    const socket = useSocket();

    const postFilters = [
        <NullableBooleanInput source='confirmed' label='Հաստատված' alwaysOn />,
    ];

    const onMessage = useCallback(async () => {
        history('/clientsTemplates');
        refresh();
    }, []);

    useEffect(() => {
        socket.addEventListener('msgToClientCloseModalsWhenUpdate', onMessage);
        return () => {
            socket.removeEventListener('msgToClientCloseModalsWhenUpdate', onMessage);
        };
    }, [socket, onMessage]);

    if (isLoading) return <Loading />
    return (
        <>
            <List
                pagination={<PostPagination />}
                actions={<ClientsTemplatesActions />}
                disableSyncWithLocation={true}
                exporter={false}
                filters={permissions == 'super' ? postFilters : []}
                perPage={25}
                empty={<Empty />}
                component='div'
                sort={{ field: 'id', order: 'ASC' }}
            >
                <LoadedGridList />
            </List>
            {matchCreate &&
                <ClientsTemplatesCreate open={!!matchCreate} />
            }
            {matchEdit && matchCreate == null ?
                <ClientsTemplatesEdit open={!!matchEdit} id={matchEdit?.params.id} /> : null
            }
        </>
    );
};
