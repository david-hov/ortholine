import {
    List,
    TextField,
    CreateButton,
    Datagrid,
    TopToolbar,
    EditButton,
    Pagination,
    TextInput,
    ReferenceInput,
    SelectInput,
    NumberField,
    ReferenceField,
} from 'react-admin';
import { Box, Typography } from '@mui/material';
import { matchPath, useLocation } from 'react-router-dom';
import ShowIcon from '@mui/icons-material/Visibility';

import { PriceListsCreate } from './PriceListsCreate';
import { PriceListsEdit } from './PriceListsEdit';

const LoadedGridList = () => {
    const location = useLocation();

    const postRowStyle = (record: any) => {
        const selectedField = matchPath('/priceLists/:id', location.pathname);
        if (record.id == selectedField?.params.id) {
            return ({
                backgroundColor: '#a6c1c9',
            })
        }
    };

    return (
        <Datagrid rowStyle={postRowStyle}>
            <TextField emptyText='-' source='name' label='Անուն' />
            <NumberField emptyText='-' source='price' label='Արժեք' />
            <ReferenceField label="Ապահովագրական" source="insurance" reference="insurance">
                <TextField source="name" />
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
            className='guide-priceList-create'
            variant='contained' />
    </Box>
);

const PriceListsActions = () => {
    return (
        <TopToolbar>
            <CreateButton
                className='guide-priceList-create'
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

export const PriceListsList = () => {
    const location = useLocation();
    const matchCreate = matchPath('/priceLists/create', location.pathname);
    const matchEdit = matchPath('/priceLists/:id', location.pathname);

    const postFilters = [
        <TextInput label='Փնտրել' source='name' alwaysOn={true} />,
        <ReferenceInput source="insurance" reference="insurance" alwaysOn={true}>
            <SelectInput label="Ապահովագրական" optionText="name" />
        </ReferenceInput>
    ];

    return (
        <>
            <List
                pagination={<PostPagination />}
                actions={<PriceListsActions />}
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
                <PriceListsCreate open={!!matchCreate} />
            }
            {matchEdit && matchCreate == null ?
                <PriceListsEdit open={!!matchEdit} id={matchEdit?.params.id} /> : null
            }
        </>
    );
};
