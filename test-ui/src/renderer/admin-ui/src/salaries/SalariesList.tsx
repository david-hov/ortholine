import {
    List,
    CreateButton,
    Datagrid,
    TopToolbar,
    EditButton,
    Pagination,
    DateField,
    DateInput,
    ReferenceInput,
    AutocompleteInput,
    usePermissions,
    Loading,
    FunctionField,
} from 'react-admin';
import { Box, Typography } from '@mui/material';
import { matchPath, useLocation } from 'react-router-dom';
import ShowIcon from '@mui/icons-material/Visibility';

import { SalariesCreate } from './SalariesCreate';
import { SalariesEdit } from './SalariesEdit';
import { useEffect, useState } from 'react';

const LoadedGridList = () => {
    const location = useLocation();

    const postRowStyle = (record: any) => {
        const selectedField = matchPath('/salaries/:id', location.pathname);
        if (record.id == selectedField?.params.id) {
            return ({
                backgroundColor: '#a6c1c9',
            })
        }
    };

    return (
        <Datagrid rowStyle={postRowStyle}>
            <FunctionField
                label='Բժիշկ'
                source='doctor'
                sortable={false}
                render={(record: any) => record && record.doctors &&
                    <span>{record.doctors.name}</span>}
            />
            <DateField source="date" label='Ամսաթիվ' />
            <EditButton icon={<ShowIcon />} label='Տեսնել' />
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

const SalariesActions = ({ permissions }: any) => {
    return (
        <TopToolbar>
        </TopToolbar>
    );
};

const PostPagination = (props: any) => <Pagination rowsPerPageOptions={[10, 25, 50, 100]} {...props} />;

export const SalariesList = () => {
    const { isLoading, permissions } = usePermissions();
    const [doctorId, setDoctorId] = useState<any>(null);
    const location = useLocation();
    const matchCreate = matchPath('/salaries/create', location.pathname);
    const matchEdit = matchPath('/salaries/:id', location.pathname);

    useEffect(() => {
        setDoctorId(location.state ? location.state.doctorId : null);
    }, [])

    const postFilters = [
        <ReferenceInput source="doctors" reference="doctors" alwaysOn={true}>
            <AutocompleteInput onChange={() => setDoctorId(null)} label="Բժիշկ" optionText='name' />
        </ReferenceInput>,
        <DateInput label='Ամսաթիվ' source='date' alwaysOn={true} />
    ];
    if (isLoading) return <Loading />
    return (
        <>
            <List
                pagination={<PostPagination />}
                actions={permissions == 'super' ? <SalariesActions /> : false}
                exporter={false}
                filter={doctorId ? { doctor: `${doctorId}` } : undefined}
                filters={postFilters}
                perPage={25}
                empty={<Empty />}
                component='div'
                sort={{ field: 'date', order: 'DESC' }}
            >
                <LoadedGridList />
            </List>
            {matchCreate &&
                <SalariesCreate open={!!matchCreate} />
            }
            {matchEdit && matchCreate == null ?
                <SalariesEdit open={!!matchEdit} id={matchEdit?.params.id} /> : null
            }
        </>
    );
};
