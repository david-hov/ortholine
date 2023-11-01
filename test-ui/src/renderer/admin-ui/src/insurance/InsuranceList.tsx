import {
    List,
    TextField,
    CreateButton,
    Datagrid,
    TopToolbar,
    EditButton,
    Pagination,
    TextInput,
    NumberField,
} from 'react-admin';
import { Box, Typography } from '@mui/material';
import { matchPath, useLocation } from 'react-router-dom';
import ShowIcon from '@mui/icons-material/Visibility';

import { InsuranceCreate } from './InsuranceCreate';
import { InsuranceEdit } from './InsuranceEdit';

const LoadedGridList = () => {
    const location = useLocation();

    const postRowStyle = (record: any) => {
        const selectedField = matchPath('/insurance/:id', location.pathname);
        if (record.id == selectedField?.params.id) {
            return ({
                backgroundColor: '#a6c1c9',
            })
        }
    };

    return (
        <Datagrid rowStyle={postRowStyle}>
            <TextField emptyText='-' source='name' label='Անուն' />
            <NumberField emptyText='-' source='percentage' label='Տոկոս %' />
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
            className='guide-insurance-create'
            variant='contained' />
    </Box>
);

const InsuranceActions = () => {
    return (
        <TopToolbar>
            <CreateButton
                className='guide-insurance-create'
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

export const InsuranceList = () => {
    const location = useLocation();
    const matchCreate = matchPath('/insurance/create', location.pathname);
    const matchEdit = matchPath('/insurance/:id', location.pathname);

    const postFilters = [
        <TextInput label='Փնտրել' source='name' alwaysOn={true} />,
    ];

    return (
        <>
            <List
                pagination={<PostPagination />}
                actions={<InsuranceActions />}
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
                <InsuranceCreate open={!!matchCreate} />
            }
            {matchEdit && matchCreate == null ?
                <InsuranceEdit open={!!matchEdit} id={matchEdit?.params.id} /> : null
            }
        </>
    );
};
