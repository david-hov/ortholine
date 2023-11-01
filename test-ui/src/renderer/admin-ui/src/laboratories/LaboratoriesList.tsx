import {
    List,
    TextField,
    CreateButton,
    Datagrid,
    TopToolbar,
    EditButton,
    Pagination,
    TextInput,
} from 'react-admin';
import { Box, Typography } from '@mui/material';
import { matchPath, useLocation } from 'react-router-dom';
import ShowIcon from '@mui/icons-material/Visibility';

import { LaboratoriesCreate } from './LaboratoriesCreate';
import { LaboratoriesEdit } from './LaboratoriesEdit';

const LoadedGridList = () => {
    const location = useLocation();

    const postRowStyle = (record: any) => {
        const selectedField = matchPath('/laboratories/:id', location.pathname);
        if (record.id == selectedField?.params.id) {
            return ({
                backgroundColor: '#a6c1c9',
            })
        }
    };

    return (
        <Datagrid rowStyle={postRowStyle}>
            <TextField emptyText='-' source='name' label='Անուն' />
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
            variant='contained' />
    </Box>
);

const LaboratoriesActions = () => {
    return (
        <TopToolbar>
            <CreateButton
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

export const LaboratoriesList = () => {
    const location = useLocation();
    const matchCreate = matchPath('/laboratories/create', location.pathname);
    const matchEdit = matchPath('/laboratories/:id', location.pathname);

    const postFilters = [
        <TextInput label='Փնտրել' source='name' alwaysOn={true} />,
    ];

    return (
        <>
            <List
                pagination={<PostPagination />}
                actions={<LaboratoriesActions />}
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
                <LaboratoriesCreate open={!!matchCreate} />
            }
            {matchEdit && matchCreate == null ?
                <LaboratoriesEdit open={!!matchEdit} id={matchEdit?.params.id} /> : null
            }
        </>
    );
};
