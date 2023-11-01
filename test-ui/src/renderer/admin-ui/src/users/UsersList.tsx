import {
    List,
    TextField,
    CreateButton,
    Datagrid,
    TopToolbar,
    EditButton,
    Pagination,
    TextInput,
    ReferenceField,
} from 'react-admin';
import { Box, Typography } from '@mui/material';
import { matchPath, useLocation } from 'react-router-dom';
import ShowIcon from '@mui/icons-material/Visibility';

import { UsersCreate } from './UsersCreate';
import { UsersEdit } from './UsersEdit';

const LoadedGridList = () => {
    const location = useLocation();

    const postRowStyle = (record: any) => {
        const selectedField = matchPath('/users/:id', location.pathname);
        if (record.id == selectedField?.params.id) {
            return ({
                backgroundColor: '#a6c1c9',
            })
        }
    };

    return (
        <Datagrid rowStyle={postRowStyle}>
            <TextField emptyText='-' source='name' label='Անուն' />
            <ReferenceField label="Դեր" reference="roles" source="roles">
                <TextField source='name' />
            </ReferenceField>
            <ReferenceField emptyText='-' label="Օգտվող" reference="doctors" source="doctors">
                <TextField source='name' />
            </ReferenceField>
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
            className='guide-users-create'
            variant='contained' />
    </Box>
);

const UsersActions = () => {
    return (
        <TopToolbar>
            <CreateButton
                className='guide-users-create'
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

export const UsersList = () => {
    const location = useLocation();
    const matchCreate = matchPath('/users/create', location.pathname);
    const matchEdit = matchPath('/users/:id', location.pathname);

    const postFilters = [
        <TextInput label='Փնտրել' source='name' alwaysOn={true} />,
    ];

    return (
        <>
            <List
                pagination={<PostPagination />}
                actions={<UsersActions />}
                exporter={false}
                filters={postFilters}
                perPage={25}
                empty={<Empty />}
                component='div'
                sort={{ field: 'id', order: 'ASC' }}
            >
                <LoadedGridList />
            </List>
            {matchCreate &&
                <UsersCreate open={!!matchCreate} />
            }
            {matchEdit && matchCreate == null ?
                <UsersEdit open={!!matchEdit} id={matchEdit?.params.id} /> : null
            }
        </>
    );
};
