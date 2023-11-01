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
    FunctionField,
    BooleanField,
} from 'react-admin';
import { Box, Typography } from '@mui/material';
import { matchPath, useLocation } from 'react-router-dom';
import ShowIcon from '@mui/icons-material/Visibility';

import { DoctorsCreate } from './DoctorsCreate';
import { DoctorsEdit } from './DoctorsEdit';

const LoadedGridList = () => {
    const location = useLocation();


    const postRowStyle = (record: any) => {
        const selectedField = matchPath('/doctors/:id', location.pathname);
        if (record.id == selectedField?.params.id) {
            return ({
                backgroundColor: '#a6c1c9',
            })
        }
    };

    return (
        <Datagrid rowStyle={postRowStyle}>
            <TextField emptyText='-' source='name' label='Անուն Ազգանուն Հայրանուն' />
            <TextField emptyText='-' source='shortName' label='Կարճ անուն' />
            <ReferenceField emptyText='-' link={(record: any, reference: any) => `/${reference}/${record.id}`} label="Սենյակ" source="rooms" reference="rooms">
                <TextField source="name" />
            </ReferenceField>
            <BooleanField source='vacation' label='Արձակուրդ' />
            <FunctionField
                emptyText='-'
                source="color"
                label="Ունիկալ Գույն"
                render={(record: any) => record && <span style={{ backgroundColor: record.color, padding: '5px 25%' }} ></span>}
            />
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
            className='guide-doctors-create'
            variant='contained' />
    </Box>
);

const DoctorsActions = () => {
    return (
        <TopToolbar>
            <CreateButton
                style={{
                    padding: '10px',
                    fontWeight: 'bolder'
                }}
                className='guide-doctors-create'
                variant='contained'
                sx={{ marginLeft: 2 }}
            />
        </TopToolbar>
    );
};

const PostPagination = (props: any) => <Pagination rowsPerPageOptions={[10, 25, 50, 100]} {...props} />;

export const DoctorsList = () => {
    const location = useLocation();
    const matchCreate = matchPath('/doctors/create', location.pathname);
    const matchEdit = matchPath('/doctors/:id', location.pathname);

    const postFilters = [
        <TextInput label='Փնտրել' source='name' alwaysOn={true} />,
    ];

    return (
        <>
            <List
                pagination={<PostPagination />}
                actions={<DoctorsActions />}
                exporter={false}
                disableSyncWithLocation={true}
                filters={postFilters}
                perPage={25}
                empty={<Empty />}
                component='div'
                sort={{ field: 'id', order: 'ASC' }}
            >
                <LoadedGridList />
            </List>
            {matchCreate &&
                <DoctorsCreate open={!!matchCreate} />
            }
            {matchEdit && matchCreate == null ?
                <DoctorsEdit open={!!matchEdit} id={matchEdit?.params.id} /> : null
            }
        </>
    );
};
