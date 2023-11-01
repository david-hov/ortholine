import {
    List,
    TextField,
    Datagrid,
    Pagination,
    ReferenceField,
    NumberField,
    FunctionField,
    DateField,
    ReferenceInput,
    AutocompleteInput,
} from 'react-admin';
import { Box, Typography } from '@mui/material';

const LoadedGridList = () => {
    return (
        <Datagrid>
            <TextField emptyText='-' source='title' label='Գործողություն' />
            <NumberField source="prevValue" label='Նախկին արժեք' />
            <NumberField source="currentValue" label='Փոփոխված արժեք' />
            <ReferenceField link={(record: any, reference: any) => `/${reference}/${record.id}`} emptyText='-' label='Անկետա' source='clients' reference='clients'>
                <TextField source='name' />
            </ReferenceField>
            <ReferenceField link={(record: any, reference: any) => `/${reference}/${record.id}`} emptyText='-' label='Այցելություն' source='visits' reference='visits'>
                <FunctionField
                    render={(record: any) => record && `Տեսնել`}
                />
            </ReferenceField>
            <DateField locales="fr-FR" showTime source='date' label='Ամսաթիվ' />
        </Datagrid>
    );
}

const Empty = () => (
    <Box textAlign='center'>
        <Typography variant='h4' paragraph>
            Ցանկը դատարկ է
        </Typography>
    </Box>
);


const PostPagination = (props: any) => <Pagination rowsPerPageOptions={[10, 25, 50, 100]} {...props} />;

export const SuperNotificationsListList = () => {

    const postFilters = [
        <ReferenceInput source="clients" reference="clients" alwaysOn>
            <AutocompleteInput label="Պացիենտ" optionText="name" />
        </ReferenceInput>
    ];

    return (
        <>
            <List
                pagination={<PostPagination />}
                actions={false}
                exporter={false}
                filters={postFilters}
                perPage={25}
                empty={<Empty />}
                component='div'
                sort={{ field: 'date', order: 'DESC' }}
            >
                <LoadedGridList />
            </List>
        </>
    );
};
