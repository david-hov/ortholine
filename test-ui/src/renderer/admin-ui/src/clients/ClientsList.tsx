import {
    List,
    TextField,
    CreateButton,
    Datagrid,
    TopToolbar,
    EditButton,
    Pagination,
    TextInput,
    DateField,
    NullableBooleanInput,
    FunctionField,
    useRefresh,
    usePermissions,
    Loading,
    AutocompleteInput,
    ReferenceInput,
    FilterButton,
    SelectInput,
    useRedirect,
    useListContext,
    RadioButtonGroupInput,
    BulkDeleteButton,
} from 'react-admin';
import { Box, Button, useMediaQuery, Typography, Card, CardContent } from '@mui/material';
import { matchPath, useLocation, useNavigate } from 'react-router-dom';
import ShowIcon from '@mui/icons-material/Visibility';
import WaitingIcon from '@mui/icons-material/Alarm';
import CancelIcon from '@mui/icons-material/Cancel';
import moment from 'moment';

import { ClientsCreate } from './ClientsCreate';
import { ClientsEdit } from './ClientsEdit';
import { dataProvider } from '../dataProvider';
import { showNotification } from '../utils/utils';
import { useCallback, useEffect } from 'react';
import { useSocket } from '../utils/socketHook';

const LoadedGridList = ({ permissions }: any) => {
    const { isLoading, isFetching } = useListContext();
    const location = useLocation();
    const refresh = useRefresh();
    const redirect = useRedirect();

    const postRowStyle = (record: any) => {
        const selectedField = matchPath('/clients/:id', location.pathname);
        if (record.id == selectedField?.params.id) {
            return ({
                backgroundColor: '#a6c1c9',
            })
        }
    };

    const setFinished = async (body: any) => {
        const status = body.isFinished == 'finished' ? 'notFinished' : body.isFinished == 'notFinished' ? 'finished' : 'needToCall';
        if (status == 'finished') {
            redirect(`/clients/${body.id}`);
        } else {
            body.isFinished = status
            const { data } = await dataProvider.update('clients', {
                id: body.id,
                data: body,
                previousData: {}
            });
            if (data) {
                refresh();
                showNotification('Պահպանված է', '', 'success', 2000)
                if (data.updated.isFinished == 'notFinished' || data.updated.isFinished == 'needToCall') {
                    redirect('create', 'visits', undefined, undefined, { clientId: data.updated.id })
                }
            }
        }
    }

    const setWaiting = async (body: any) => {
        body.isWaiting = body.isWaiting ? false : true;
        const { data } = await dataProvider.update('clients', {
            id: body.id,
            data: body,
            previousData: {}
        });
        if (data) {
            refresh();
            showNotification(`Շտապ այցը ${data.updated.isWaiting ? 'գրանցված է' : 'չեղարկված է'}`, '', 'success', 2000)
        }
    }

    const PostBulkActionButtons = (props: any) => {
        return <BulkDeleteButton {...props} label='Ջնջել' />
    };

    if (isLoading) {
        return <Loading />
    }

    return (
        <Datagrid bulkActionButtons={permissions != 'doctor' ? <PostBulkActionButtons /> : false} rowStyle={postRowStyle}>
            <TextField emptyText='-' source='name' label='Անուն Հայրանուն Ազգանուն' />
            <FunctionField
                source='extraInfo'
                label="Հիշեցում"
                sortable={false}
                render={(record: any) => record.extraInfo && record.extraInfo.length !== 0 ?
                    record.extraInfo.map((item: any) => {
                        const currentDate = moment(new Date()).format("YYYY-MM-DD");
                        const nextDay = moment(currentDate).add(1, 'days').format("YYYY-MM-DD");
                        const alertDate = moment(item.date).isSame(nextDay, 'day');
                        return (
                            <div style={{ cursor:'pointer', borderBottom: '2px solid'}}>
                                <p className={alertDate ? 'alert' : ''} style={{margin: '0', textAlign: 'center'}} title={item.info}>{item.date}</p>
                            </div>
                        )
                    }) : '-'
                }
            />
            <DateField emptyText='-' label='Ծննդ․ տարեթիվ' source='birthDate' />
            {permissions == 'doctor' ? null :
                <TextField emptyText='-' source='number' label='Հեռ․' />
            }
            {permissions == 'doctor' ? null :
                <FunctionField
                    source='isFinished'
                    label="Կարգավիճակ"
                    render={(record: any) => record && <Button className={record.isFinished == 'finished' ? 'button-green' : record.isFinished == 'notFinished' ? 'button-orange' : 'button-error'} onClick={() => setFinished(record)} variant='contained'>
                        {record.isFinished == 'finished' ? 'Գրանցում' : record.isFinished == 'notFinished' ? 'Ավարտել' : 'Շարունակել'}
                    </Button>}
                />}
            {permissions == 'doctor' ? null :
                <FunctionField
                    source='isWaiting'
                    label="Շտապ այց"
                    render={(record: any) => record && <Button className={record.isWaiting ? 'button-orange' : 'button-green'} onClick={() => setWaiting(record)} variant='contained'>
                        {record.isWaiting ? <CancelIcon /> : <WaitingIcon />}
                    </Button>}
                />
            }
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
            className='guide-clients-create'
            variant='contained' />
    </Box>
);

const ClientsActions = () => {
    return (
        <TopToolbar>
            <FilterButton />
            <CreateButton
                className='guide-clients-create'
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

const postFilters = [
    <TextInput label='Փնտրել (Անուն, Աղբյուր, Հեռ․)' source='name' alwaysOn />,
    <NullableBooleanInput label='Օրթոդոնտիա' source='orthodontia' />,
    <NullableBooleanInput label='Օրթոպեդիա' source='orthopedia' />,
    <NullableBooleanInput label='Իմպլանտ' source='implant' />,
    <NullableBooleanInput label='Առկա է պլանայի աշխատանք' source='future' />,
    <NullableBooleanInput label='Առկա է ախտորոշում' source='diagnosis' />,
    <NullableBooleanInput label='Դժգոհություն' source='complaint' />,
    <ReferenceInput label="Աղբյուր" source="clientsTemplates" reference="clientsTemplates">
        <AutocompleteInput optionText='name' label="Աղբյուր" source='name' />
    </ReferenceInput>,
    <NullableBooleanInput label='Հիշեցում' source='rememberNotes' />,
    <ReferenceInput label="Ապպա" source="insurance" reference="insurance" >
        <SelectInput label="Ապպա" optionText='name' />
    </ReferenceInput>,
    <RadioButtonGroupInput label='Անկետայի կարգավիճակ' source="isFinished" choices={[
        { id: 'finished', name: 'Ավարտված է' },
        { id: 'notFinished', name: 'Չի ավարտվել' },
        { id: 'needToCall', name: 'Շարունակել' },
    ]} />,
    <NullableBooleanInput label='Գումարի մուտք կլինիկայի կոմից' source='fromClinic' />,
    <NullableBooleanInput label='Շտապ այց' source='isWaiting' />,
    <NullableBooleanInput label='Կանխավճար' source='deposit' />,
    <NullableBooleanInput label='Մնացորդ' source='balance' />,
    <TextInput label='Փնտրել ըստ բառի ' source='searchInFutureDiagnosis' />,
];

const MobileList = ({ permissions }: any) => {
    const { data } = useListContext();
    const redirect = useRedirect();

    return (
        <div>
            {data.length !== 0 ? data.map((item: any, key: number) => (
                <Card key={key} onClick={() => redirect('edit', 'clients', item.id)} className='mobile-list-card' sx={{ minWidth: 275 }}>
                    <CardContent>
                        <div className='card-item'>
                            <p className='tite'>Անուն</p><p>{item.name}</p>
                        </div>
                        <div className='card-item'>
                            <p className='tite'>Ծննդ․ թիվ</p><p>{item.birthDate || '-'}</p>
                        </div>
                        {permissions == 'doctor' ? null :
                            <div className='card-item'>
                                <p className='tite'>Համար</p><p>{item.number}</p>
                            </div>
                        }
                    </CardContent>
                </Card>
            )) : 'Արդյունք չի գտնվել'}
            <CreateButton
                style={{
                    padding: '10px',
                    fontWeight: 'bolder'
                }}
                variant='contained'
            />
        </div>
    );
}

export const ClientsList = () => {
    const { isLoading, permissions } = usePermissions();
    const isSmall = useMediaQuery('(max-width:600px)');
    const location = useLocation();
    const history = useNavigate();
    const matchCreate = matchPath('/clients/create', location.pathname);
    const matchEdit = matchPath('/clients/:id', location.pathname);
    const socket = useSocket();

    const onMessage = useCallback(async () => {
        history('/clients');
    }, []);

    useEffect(() => {
        socket.addEventListener('msgToClientCloseModalsWhenUpdate', onMessage);
        return () => {
            socket.removeEventListener('msgToClientCloseModalsWhenUpdate', onMessage);
        };
    }, [socket, onMessage])

    if (isLoading) return <Loading />
    return (
        <>
            {isSmall ?
                <>
                    <List filters={postFilters} exporter={false} emptyWhileLoading>
                        <MobileList permissions={permissions} />
                    </List>
                    {matchCreate &&
                        <ClientsCreate open={!!matchCreate} />
                    }
                    {matchEdit && matchCreate == null ?
                        <ClientsEdit open={!!matchEdit} id={matchEdit?.params.id} /> : null
                    }
                </>
                :
                <>
                    <List
                        pagination={<PostPagination />}
                        actions={permissions !== 'doctor' ? <ClientsActions /> : false}
                        exporter={false}
                        filters={postFilters}
                        perPage={25}
                        empty={<Empty />}
                        component='div'
                        sort={{ field: 'id', order: 'DESC' }}
                    >
                        <LoadedGridList permissions={permissions} />
                    </List>
                    {matchCreate &&
                        <ClientsCreate open={!!matchCreate} />
                    }
                    {matchEdit && matchCreate == null ?
                        <ClientsEdit open={!!matchEdit} id={matchEdit?.params.id} /> : null
                    }
                </>
            }
        </>
    );
};
