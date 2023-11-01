import { useCallback, useEffect, useState } from 'react';
import {
    List,
    TextField,
    CreateButton,
    Datagrid,
    TopToolbar,
    EditButton,
    Pagination,
    DateField,
    NullableBooleanInput,
    ReferenceInput,
    AutocompleteInput,
    ReferenceField,
    SelectInput,
    usePermissions,
    Loading,
    FilterButton,
    BulkDeleteButton,
    useListContext,
    useRedirect,
    useGetOne,
    TextInput,
    FunctionField,
    BulkDeleteWithConfirmButton,
} from 'react-admin';
import { Box, Card, CardContent, Typography, useMediaQuery } from '@mui/material';
import { matchPath, useLocation } from 'react-router-dom';
import moment from 'moment';

import { VisitsCreate } from './VisitsCreate';
import { VisitsEdit } from './VisitsEdit';
import { CustomDateInput } from '../utils/dateInput';
import { useSocket } from '../utils/socketHook';
import { useNavigate } from 'react-router';

const LoadedGridList = ({ permissions }: any) => {
    const PostBulkActionButtons = (props: any) => {
        return <BulkDeleteWithConfirmButton
            confirmTitle='Զգուշացում'
            {...props}
            label='Ջնջել'
            confirmContent='Եթե առկա լինի բժշկին ՓՈԽԱՆՑՎԱԾ գումար,
            ջնջելու դեպքում գումարը մնալու է բժշկի հաշվին:'
        />
    };
    return <Datagrid bulkActionButtons={permissions != 'doctor' ? <PostBulkActionButtons /> : false} empty={<p>Այցելություն գրանցված չէ</p>}>
        <ReferenceField emptyText='-' label="Անուն" source="clients" reference="clients">
            <TextField source="name" />
        </ReferenceField>
        <ReferenceField emptyText='-' label="Ապահովագրություն" source="insurance" reference="insurance">
            <TextField source='name' />
        </ReferenceField>
        <DateField locales="fr-FR" showTime source='startDate' label='Այց․ տարեթիվ' />
        <ReferenceField link={permissions !== 'doctor' ? (record: any, reference: any) => `/${reference}/${record.id}` : false} emptyText='-' label="Բժիշկ" source="doctors" reference="doctors">
            <TextField source='name' />
        </ReferenceField>
        <FunctionField
            render={(record: any) => record && <EditButton className={record.lastVisitChecked == 'came' && record.treatments.length == 0 ? 'button-error' : ''} variant='contained' />}
        />
    </Datagrid>
}

const VisitsActions = ({permissions} : any) => {
    return (
        <TopToolbar>
            <FilterButton />
            {permissions !== 'doctor' &&
                <CreateButton
                    label='Գրանցել այց'
                    style={{
                        padding: '10px',
                        fontWeight: 'bolder'
                    }}
                    variant='contained'
                    sx={{ marginLeft: 2 }}
                />
            }
        </TopToolbar>
    );
};

const Empty = ({permissions} : any) => (
    <Box textAlign='center'>
        <Typography variant='h4' paragraph>
            Ցանկը դատարկ է
        </Typography>
        {permissions !== 'doctor' &&
            <CreateButton
                label='Գրանցել այց'
                variant='contained' />
        }
    </Box>
);

const ClientField = ({ id }: any) => {
    const client = useGetOne('clients', { id: id });
    return <>
        <p className='tite'>Հաճախորդ</p>
        <p>{client.isLoading ? '-' : client.data.name}</p>
    </>
}

const DoctorField = ({ id }: any) => {
    const doctor = useGetOne('doctors', { id: id });
    return <>
        <p className='tite'>Բժիշկ</p>
        <p>{doctor.isLoading ? '-' : doctor.data.name}</p>
    </>
}

const MobileList = () => {
    const { data } = useListContext();
    const redirect = useRedirect();

    return (
        <div>
            {data.length !== 0 ? data.map((item: any, key: number) => {
                return (
                    <Card key={key} onClick={() => redirect('edit', 'visits', item.id)} className='mobile-list-card' sx={{ minWidth: 275 }}>
                        <CardContent>
                            <div className='card-item'>
                                <ClientField id={item.clients} />
                            </div>
                            <div className='card-item'>
                                <DoctorField id={item.doctors} />
                            </div>
                            <div className='card-item'>
                                <p className='tite'>Այցի տարեթիվ</p><p>{moment(item.startDate).format("YYYY-MM-DD HH:mm:ss")}</p>
                            </div>
                        </CardContent>
                    </Card>
                )
            }) : 'Արդյունք չի գտնվել'}
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

const PostPagination = (props: any) => <Pagination rowsPerPageOptions={[10, 25, 50, 100]} {...props} />;

export const VisitsList = () => {
    const isSmall = useMediaQuery('(max-width:600px)');
    const { permissions, isLoading } = usePermissions();
    const [clientId, setClientId] = useState<any>(null);
    const location = useLocation();
    const history = useNavigate();
    const matchCreate = matchPath('/visits/create', location.pathname);
    const matchEdit = matchPath('/visits/:id', location.pathname);
    const socket = useSocket();

    useEffect(() => {
        setClientId(location.state ? location.state.clientId : null);
    }, [])

    const onMessage = useCallback(async () => {
        history('/visits');
    }, []);

    useEffect(() => {
        socket.addEventListener('msgToClientCloseModalsWhenUpdate', onMessage);
        return () => {
            socket.removeEventListener('msgToClientCloseModalsWhenUpdate', onMessage);
        };
    }, [socket, onMessage])

    const postFilters = [
        <TextInput label='Փնտրել (Անուն, Հեռ․)' source='name' alwaysOn />,
        <TextInput label='Փնտրել ըստ բառի' source='treatmentWord' alwaysOn />,
        <CustomDateInput source='startDate' label='Սկիզբ' alwaysOn />,
        <CustomDateInput source='endDate' label='Ավարտ' alwaysOn />,
        <SelectInput source="lastVisitChecked" choices={[
            { id: 'NOTCAME', name: 'Չի մոտեցել' },
            { id: 'CAME', name: 'Մոտեցել է' },
        ]} label='Մոտեցել է/Չի մոտեցել' />,
        <NullableBooleanInput label='Կատարված աշխատանքները լրացված են/լրացված չեն' source='treatmentsFilled' />,
        <NullableBooleanInput label='ԱՊՊԱ հաշիվը դուրս գրված է/դուրս գրված չէ' source='closedInsuranceStatus' />,
        <NullableBooleanInput label='ԱՊՊԱ ռենտգեն դուրս գրված է/դուրս գրված չէ' source='closedInsuranceXrayStatus' />,
        <NullableBooleanInput label='Այցեր որի ընթացքում կատարվել է ռենտգեն ' source='xRayCount' />,
        <ReferenceInput label="Այցեր ապահովագրությամբ" source="insurance" reference="insurance" >
            <SelectInput label="Ապպա" optionText='name' />
        </ReferenceInput>,
        <NullableBooleanInput label='Անկանխիկ գործարքներ' source='isCash' />,
        <NullableBooleanInput label='Զեղչված աշխատանքներ' source='discountForTreatment' />,
        <NullableBooleanInput label='Ձևավորված մնացորդ' source='balance' />,
        <NullableBooleanInput label='Անհամապատասխանություն արժեքի մեջ' source='notifyAdminAboutPrice' />,
        <NullableBooleanInput label='Փոխանցված աշխատավարձ' source='feeSentToDoctor' />,
        <NullableBooleanInput label='Հաշվարկված աշխատավարձ' source='feeSentToSalary' />,
        <NullableBooleanInput label='Փոխանցված ԱՊՊԱ աշխատավարձ' source='insuranceSalarySentToDoctor' />,
        <NullableBooleanInput label='Հաշվարկված ԱՊՊԱ աշխատավարձ' source='insuranceSentForSalary' />,
        <ReferenceInput label="Նշված բժ.-ի մոտ գրանցված այց" source="doctors" reference="doctors" >
            <AutocompleteInput label="Բժիշկ" optionText='name' />
        </ReferenceInput>,
        <ReferenceInput label="Նշված պացիենտ-ի այցեր" source="clients" reference="clients" >
            <AutocompleteInput label="Պացիենտ" optionText='name' />
        </ReferenceInput>,
        <NullableBooleanInput label='Զանգ պացիենտին' source='callClient' />,
        <NullableBooleanInput label='Զանգ լաբ․' source='callLab' />,
    ];

    const doctorFilters = [
        <TextInput label='Փնտրել (Անուն, Հեռ․)' source='name' alwaysOn />,
        <TextInput label='Փնտրել ըստ բառի' source='treatmentWord' alwaysOn />,
        <CustomDateInput source='startDate' label='Սկիզբ' alwaysOn />,
        <CustomDateInput source='endDate' label='Ավարտ' alwaysOn />,
        <NullableBooleanInput label='Կատարված աշխատանքները լրացված են/լրացված չեն' source='treatmentsFilled' />,
        <NullableBooleanInput label='Զանգ պացիենտին' source='callClient' />,
        <NullableBooleanInput label='Զանգ լաբ․' source='callLab' />,
    ];

    if (isLoading) return <Loading />
    return (
        <>
            {isSmall ?
                <>
                    <List filters={postFilters} exporter={false} emptyWhileLoading>
                        <MobileList />
                    </List>
                    {matchCreate &&
                        <VisitsCreate open={!!matchCreate} id={clientId} permissions={permissions} />
                    }
                    {matchEdit && matchCreate == null ?
                        <VisitsEdit open={!!matchEdit} id={matchEdit?.params.id} clientId={clientId} /> : null
                    }
                </>
                :
                <>
                    <List
                        pagination={<PostPagination />}
                        actions={<VisitsActions permissions={permissions}/>}
                        exporter={false}
                        disableSyncWithLocation={true}
                        filter={clientId ? { clients: `${clientId}` } : undefined}
                        filters={permissions == 'doctor' ? doctorFilters : postFilters}
                        perPage={25}
                        empty={<Empty permissions={permissions}/>}
                        component='div'
                        sort={{ field: 'id', order: 'DESC' }}
                    >
                        <LoadedGridList permissions={permissions} />
                    </List>
                    {matchCreate &&
                        <VisitsCreate open={!!matchCreate} id={clientId} permissions={permissions} />
                    }
                    {matchEdit && matchCreate == null ?
                        <VisitsEdit open={!!matchEdit} id={matchEdit?.params.id} clientId={clientId} /> : null
                    }
                </>
            }
        </>
    );
};
