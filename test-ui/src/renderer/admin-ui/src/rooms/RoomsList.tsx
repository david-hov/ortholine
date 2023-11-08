import {
    List,
    TextField,
    CreateButton,
    Datagrid,
    TopToolbar,
    EditButton,
    Pagination,
    TextInput,
    ReferenceArrayField,
    SingleFieldList,
    ChipField,
} from 'react-admin';
import { Box, Typography } from '@mui/material';
import { matchPath, useLocation } from 'react-router-dom';
import ShowIcon from '@mui/icons-material/Visibility';

import { RoomsCreate } from './RoomsCreate';
import { RoomsEdit } from './RoomsEdit';

const LoadedGridList = () => {
    const location = useLocation();

    const postRowStyle = (record: any) => {
        const selectedField = matchPath('/rooms/:id', location.pathname);
        if (record.id == selectedField?.params.id) {
            return ({
                backgroundColor: '#a6c1c9',
            })
        }
    };

    return (
        <Datagrid rowStyle={postRowStyle}>
            <TextField emptyText='-' source='name' label='Անուն' />
            <ReferenceArrayField label="Բժիշկներ" reference="doctors" source="doctors">
                <SingleFieldList>
                    <ChipField source="name" />
                </SingleFieldList>
            </ReferenceArrayField>
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
            className='guide-rooms-create'
            variant='contained' />
    </Box>
);

const RoomsActions = () => {
    return (
        <TopToolbar>
            <CreateButton
                className='guide-rooms-create'
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

export const RoomsList = () => {
    const location = useLocation();
    const matchCreate = matchPath('/rooms/create', location.pathname);
    const matchEdit = matchPath('/rooms/:id', location.pathname);

    return (
        <>
            <List
                pagination={<PostPagination />}
                actions={<RoomsActions />}
                exporter={false}
                perPage={25}
                empty={<Empty />}
                component='div'
                sort={{ field: 'id', order: 'ASC' }}
            >
                <LoadedGridList />
            </List>
            {matchCreate &&
                <RoomsCreate open={!!matchCreate} />
            }
            {matchEdit && matchCreate == null ?
                <RoomsEdit open={!!matchEdit} id={matchEdit?.params.id} /> : null
            }
        </>
    );
};
