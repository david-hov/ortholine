import {
    useRedirect,
    TextInput,
    required,
    Datagrid,
    TextField,
    ReferenceArrayField,
    Pagination,
    FunctionField,
    ImageInput,
    ImageField,
    useListContext,
    DeleteButton,
    Loading,
    BooleanInput,
    ReferenceInput,
    AutocompleteInput,
    SimpleFormIterator,
    ArrayInput,
    SelectInput,
    FormDataConsumer,
    EditButton,
    DateField,
    usePermissions,
    useRecordContext,
    Form,
    ReferenceField,
    useUnselect,
    RadioButtonGroupInput,
    Create,
    SimpleForm,
    useRefresh,
    NumberField,
    BulkDeleteButton,
    NumberInput,
    DateInput,
    BooleanField,
} from 'react-admin';
import { Box, Button, Dialog, Stack } from '@mui/material';
import VisitsIcon from '@mui/icons-material/Assignment';
import { Fragment, useEffect, useRef, useState } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { useController, useWatch } from 'react-hook-form';
import PrintIcon from '@mui/icons-material/Print';

import { TabPanel } from '../utils/tabPanel';
import { dataProvider } from '../dataProvider';
import { showNotification } from '../utils/utils';
import { validateClient } from './validation';
import { useReactToPrint } from 'react-to-print';
import { ComponentToPrint } from './PrintClientData';
import { CustomModal } from '../utils/customModal';
import { EditModal } from '../utils/editModal';
import { CustomDateInput } from '../utils/dateInput';
import moment from 'moment';

const optionRenderer = (choice: any) => {
    return `${choice.name}${choice.doctors && choice.doctors.name ? ` - ${choice.doctors.name}` : ''}`;
}

const PlusMinusFromDepositInput = ({ balanceStatus }: any) => {
    const deposit = useController({ name: 'deposit' });
    const minus = useController({ name: 'minus' });
    const depositOld = useWatch({ name: 'deposit', disabled: true });
    const balanceValue = useWatch({ name: 'balance' });
    useEffect(() => {
        minus.field.onChange(null)
    }, [balanceStatus])
    const change = (e: any) => {
        let value = 0;
        if (e.target.value) {
            if (isNaN(e.target.value)) {
                value = parseInt(depositOld);
            } else {
                value = balanceStatus == 'inc' ? parseInt(depositOld) + parseInt(e.target.value) :
                    parseInt(depositOld) - parseInt(e.target.value);
            }
        } else {
            value = parseInt(depositOld);
        }
        deposit.field.onChange(value)
    }
    return (
        <NumberInput helperText={balanceValue > 0 && balanceStatus == 'inc' &&
            <p style={{ color: 'green', fontSize: '18px' }}>Մուտքագրված գումարից կատարվելու է պարտքի մարում</p>}
            validate={required('Պարտադիր դաշտ')} type='tel' min={0} onChange={(e: any) => change(e)} fullWidth source='minus' label={balanceStatus == 'inc' ? 'Ավելացնել կանպավճարին' : 'Դուրս բերել կանպավճարից'} />
    );
};

export const ClientsEdit = ({ open, id }: { open: boolean; id?: string }) => {
    const { isLoading, permissions } = usePermissions();
    const unselect = useUnselect('clients');
    const componentRef = useRef<any>(null);
    const redirect = useRedirect();
    const [value, setValue] = useState(0);
    const [opened, openModalFile] = useState(false);
    const [template, createTemplate] = useState(false)
    const [modalExtraInfo, setModalForExtraInfo] = useState(false);
    const [modalOpenPrintPage, setModalOpenPrintPage] = useState(false);
    const [loading, setLoading] = useState(false);
    const [clientFees, setClientFees] = useState<any>(null);
    const [clientInsuranceFees, setClientInsuranceFees] = useState(null);
    const [file, setFile] = useState<any>(null);
    const [printDetails, setPrintDetails] = useState<any>(null);
    const [companyName, setCompanyName] = useState<any>('Կլինիկա');
    const [selectedIds, setSelectedIds] = useState<any>([]);
    const refresh = useRefresh();

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    const handleClose = () => {
        redirect('/clients');
    };

    const handlePrint = useReactToPrint({
        content: () => componentRef?.current,
    });

    const onSuccess = (body: any) => {
        if (body.number) {
            showNotification('Պահպանված է', '', 'success', 2000)
            refresh();
        } else {
            createTemplate(false);
            refresh();
        }
    };

    useEffect(() => {
        const name = localStorage.getItem('companyName');
        if (name != 'null') {
            setCompanyName(name);
        }
        const getClientFeeInfo = async () => {
            const { data } = await dataProvider.getOne('clients/fee', {
                id: id
            })
            if (data) {
                setClientFees(data.clinic);
                setClientInsuranceFees(data.insurance);
            }
        }
        getClientFeeInfo();
    }, [])

    const openModal = async (imageId: any) => {
        openModalFile(true);
        setLoading(true)
        const { data } = await dataProvider.getOne('attachments', {
            id: imageId
        })
        setFile(data.src);
        setLoading(false)
    }

    const AttachmentField = (props: any) => {
        if (props.record.hasOwnProperty('rawFile')) {
            return <p>{props.record.title}</p>
        } else {
            if (props.record !== null) {
                return <div style={{ display: 'flex', flexDirection: 'column', margin: '0' }}>
                    <img style={{ margin: '0 5px', objectFit: 'contain' }} src={`${props.record.thumbnail}`} onClick={() => openModal(props.record.id)} width='100px' height='100px' />
                    <DeleteButton confirmTitle='Ջնջել տվյալ նկարը'
                        confirmContent='Դուք համոզվա՞ծ եք ջնջել այս նկարը' record={props.record} mutationOptions={{ onSuccess }} />
                </div>
            } else {
                return <span>-</span>;
            }
        }
    };

    const InsuranceInput = (props: any) => {
        return (
            <>
                <ArrayInput source='diagnosis' label=''>
                    <SimpleFormIterator>
                        <FormDataConsumer>
                            {({ getSource }: any) => {
                                const insurance = useController({ name: getSource('insurance') });
                                const closedOrNot = useController({ name: getSource('closedOrNot') });
                                const payingOff = useController({ name: getSource('payingOff') });
                                const change = (e: any) => {
                                    if (e.target.value == '') {
                                        closedOrNot.field.onChange(null);
                                        payingOff.field.onChange(null);
                                        insurance.field.onChange(undefined)
                                    }
                                    insurance.field.onChange(e.target.value)
                                }
                                return (
                                    <>
                                        <TextInput fullWidth source={getSource('diagnose')} multiline validate={required('Պարտադիր դաշտ')} label='Հայտնաբերվել է' />
                                        {insurance.field.value == null || insurance.field.value == undefined ? null :
                                            <>
                                                <TextInput fullWidth source={getSource('payingOff')} multiline label='Հատուցվում է' />
                                                <BooleanInput source={getSource('closedOrNot')} label='Փակված հայտ' />
                                            </>
                                        }
                                        <ReferenceInput fullWidth source={getSource('insurance')} reference='insurance'>
                                            <SelectInput onChange={(e: any) => change(e)} fullWidth label='Ապահովագրություն' optionText='name' />
                                        </ReferenceInput>
                                        <CustomDateInput source={getSource('date')} label='Ամսաթիվ' />
                                    </>
                                );
                            }}
                        </FormDataConsumer>
                    </SimpleFormIterator>
                </ArrayInput>
            </>
        );
    };

    const ImageList = () => {
        const { data } = useListContext();
        return (
            <div>
                <h2 style={{ marginTop: '10' }}>Նկարներ</h2>
                <Stack style={{ padding: '0', display: 'flex', alignItems: 'center', flexDirection: 'row' }} spacing={2} sx={{ padding: 2 }}>
                    {data.map((item: any, key: number) => (
                        <AttachmentField key={key} label='Նկար' record={item} />
                    ))}
                </Stack>
            </div>
        );
    }

    const getPrintData = async (ids: any, name: string) => {
        const result = await dataProvider.getMany('visits', {
            ids: ids
        })
        if (result.data.length !== 0) {
            setPrintDetails({ data: result, name });
            setModalForExtraInfo(true);
        }
    }

    const PostBulkActionButtons = (props: any) => {
        const data = useRecordContext();
        setSelectedIds(props.selectedIds);

        const sendVisitRequest = async (ids: any, status: boolean) => {
            await dataProvider.sendVisitRequest({ids, status});
            unselect(props.selectedIds);
            refresh();
        }
        return (
            <Fragment>
                <Button style={{marginRight: '15px', fontWeight: 'bolder'}} onClick={() => sendVisitRequest(props.selectedIds, false)}>
                    Բացել
                </Button>
                <Button style={{marginRight: '35px', fontWeight: 'bolder'}} onClick={() => sendVisitRequest(props.selectedIds, true)}>
                    Փակել
                </Button>
                <Button onClick={() => getPrintData(props.selectedIds, data.name)}>
                    Տպել
                </Button>
            </Fragment>
        )
    };

    const handleSubmitPrintData = (data: any) => {
        localStorage.setItem('printInfo', JSON.stringify(data.printInfo));
        if (data.date) {
            localStorage.setItem('printInfoDate', JSON.stringify(data.date));
        }
        setModalForExtraInfo(false);
        setModalOpenPrintPage(true);
    };

    const TabsNavigation = () => {
        const record = useRecordContext();
        return (
            <Tabs className='edit-navigation' value={value} onChange={handleChange} aria-label='basic tabs example'>
                <Tab label='Անձ. տվյալներ' />
                <Tab label='Կատարված աշխատանքներ' />
                <Tab style={{ minHeight: 'auto' }} icon={record.diagnosis.length !== 0 ? <span className='notify-count'>{record.diagnosis.length}</span> : <></>} label='Ախտորոշումներ' />
                <Tab style={{ minHeight: 'auto' }} icon={record.future.length !== 0 ? <span className='notify-count'>{record.future.length}</span> : <></>} label='Պլանային աշխատանքներ' />
                <Tab style={{ minHeight: 'auto' }} label='Նկարներ' icon={record.clientAttachment && record.clientAttachment.length !== 0 ? <span className='notify-count'>{record.clientAttachment.length}</span> : <></>} />
                <div className='client-name-tabs'>
                    <span style={{ color: '#e06c01' }}>{record.nameForClientView}</span>
                    <VisitsIcon titleAccess='Այցելություններ' color='action' style={{ marginLeft: '10px', cursor: 'pointer' }} onClick={() => redirect('list', 'visits', undefined, undefined, { clientId: record.id })} />
                </div>
            </Tabs>
        )
    }

    const HeaderOfTreatment = () => {
        return (
            <div className='head-of-treatment' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ margin: '0' }}>Կատարված աշխ.</p>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <p className='real-price'>Արժեք</p>
                    <p className='pay-price'>Ենթ․ վճ․ գումար</p>
                    <p className='price-discount'>%</p>
                    <p className='price-insurance'>ԱՊՊԱ</p>
                </div>
            </div>
        )
    }

    const postRowSx = (record: any) => {
        return ({
            backgroundColor: record.insuranceForTreatment && !record.closedInsuranceStatus ? '#d3929270' : 'white',
        })
    };


    const closePrintModal = () => {
        const printInfo = localStorage.getItem('printInfo');
        if (printInfo) {
            localStorage.removeItem('printInfo')
        }
        const printInfoDate = localStorage.getItem('printInfoDate');
        if (printInfoDate) {
            localStorage.removeItem('printInfoDate')
        }
        if (selectedIds.length !== 0) {
            unselect(selectedIds);
        }
        setPrintDetails(null);
        setModalOpenPrintPage(false);
    }

    const PostBulkActionButtonsToDelete = (props: any) => {
        return <BulkDeleteButton {...props} label='Ջնջել' />
    };

    const restart = async () => {
        await dataProvider.update('clients/restart', {
            id: id,
            data: {
                deposit: 0,
            },
            previousData: {}
        })
        showNotification('Պահպանված է', '', 'success', 2000)
        refresh();
    }

    if (isLoading) return <Loading />

    return (
        <Dialog className='create-edit-client create-edit' open={open}>
            {template &&
                <Create
                    resource='clientsTemplates'
                    mutationOptions={{ onSuccess }}
                    sx={{ width: 500, '& .RaCreate-main': { mt: 0 } }}
                >
                    <CustomModal open={template} handleClose={() => createTemplate(false)} >
                        <div style={{
                            width: 'auto',
                            backgroundColor: 'white',
                            padding: '10px',
                            height: 'auto',
                        }}>
                            <SimpleForm>
                                <TextInput validate={required('Պարտադիր դաշտ')} fullWidth source='name' label='Անուն' />
                            </SimpleForm>
                        </div>
                    </CustomModal>
                </Create>
            }
            {modalExtraInfo &&
                <CustomModal open={modalExtraInfo} handleClose={() => setModalForExtraInfo(false)} >
                    <div style={{
                        width: '50%',
                        backgroundColor: 'white',
                        padding: '10px',
                    }}>
                        <Form onSubmit={handleSubmitPrintData}>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                            }}>
                                <DateInput source='date' />
                                <ArrayInput defaultValue={[]} label='Հավելյալ ինֆո' source='printInfo'>
                                    <SimpleFormIterator>
                                        <TextInput fullWidth label='Տեքստ' source='text' />
                                    </SimpleFormIterator>
                                </ArrayInput>
                                <Button type='submit'>Պահպանել</Button>
                            </div>
                        </Form>
                    </div>
                </CustomModal>
            }
            {printDetails && modalOpenPrintPage &&
                <CustomModal open={printDetails} handleClose={() => closePrintModal()} >
                    <div style={{
                        width: '90%',
                        backgroundColor: 'white',
                        padding: '10px',
                        height: '90%',
                        overflowY: 'auto',
                    }}>
                        <Button variant='contained' onClick={() => handlePrint()}><PrintIcon /></Button>
                        <ComponentToPrint printDetails={printDetails} ref={componentRef} />
                    </div>
                </CustomModal>
            }
            <EditModal resource='Անկետա' id={id} validate={validateClient} onSuccess={onSuccess} handleClose={handleClose}>
                <Box width='100%' sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <TabsNavigation />
                    <TabPanel value={value} index={0} className={'not-grid'}>
                        <div className='clients-edit-pairs'>
                            <TextInput disabled={permissions == 'doctor' ? true : false} validate={required('Պարտադիր դաշտ')} fullWidth source='name' label='Անուն Հայրանուն Ազգանուն' />
                            <BooleanInput className='client-boolean' defaultValue={false} source='orthodontia' label='Օրթոդոնտիա' />
                        </div>
                        <div className='clients-edit-pairs'>
                            <TextInput disabled={permissions == 'doctor' ? true : false} validate={required('Պարտադիր դաշտ')} fullWidth source='nameForClientView' label='Անուն Հայրանուն Ազգանուն (Հաճախորդի էկրանում)' />
                            <BooleanInput className='client-boolean' defaultValue={false} source='orthopedia' label='Օրթոպեդիա' />
                        </div>
                        <div className='clients-edit-pairs'>
                            <CustomDateInput disabled={permissions == 'doctor' ? true : false} source='birthDate' label='Ծննդյան տարեթիվ' />
                            <BooleanInput className='client-boolean' defaultValue={false} source='implant' label='Իմպլանտ' />
                        </div>
                        {permissions != 'doctor' &&
                            <div className='clients-edit-pairs'>
                                <TextInput validate={required('Պարտադիր դաշտ')} fullWidth source='number' label='Հեռ․' />
                                <BooleanInput className='client-boolean' label='Շտապ այց' source='isWaiting' />
                            </div>
                        }
                        <div className='clients-edit-pairs'>
                            {permissions != 'doctor' &&
                                <ReferenceInput source='clientsTemplates' reference='clientsTemplates'>
                                    <AutocompleteInput noOptionsText={<Button variant='contained' onClick={() => createTemplate(true)}>Ավելացնել ցանկում</Button>} fullWidth label='Աղբյուր' optionText={optionRenderer} />
                                </ReferenceInput>
                            }
                            {permissions != 'doctor' &&
                                <RadioButtonGroupInput label='Ավարտված է' source='isFinished' choices={[
                                    { id: 'finished', name: 'Ավարտել' },
                                    { id: 'notFinished', name: 'Ավարտված չէ' },
                                ]} />
                            }
                        </div>
                        <div className='clients-edit-pairs'>
                            <TextInput multiline fullWidth source='healthStatus' label='Առողջական վիճակ' />
                            <TextInput multiline fullWidth source='notes' label='Նշումներ' />
                        </div>
                        <div className='clients-edit-pairs'>
                            <TextInput multiline fullWidth source='complaint' label='Դժգոհություն' />
                            <ArrayInput source='extraInfo' label='Հիշեցում'>
                                <SimpleFormIterator disableReordering inline={true}>
                                    <TextInput validate={required('Պարտադիր դաշտ')} multiline fullWidth source='info' label='Հիշեցումներ' />
                                    <CustomDateInput validate={required('Պարտադիր դաշտ')} label='Ամսաթիվ' source='date' />
                                </SimpleFormIterator>
                            </ArrayInput>
                        </div>
                        <div className='clients-edit-pairs'>
                            {permissions == 'doctor' ? null :
                                <div>
                                    <SelectInput
                                        source='balanceStatus' label='Կանխավճար մուտք/ելք' validate={required('Պարտադիր դաշտ')} fullWidth
                                        choices={[
                                            { id: 'inc', name: 'Մուտք' },
                                            { id: 'dec', name: 'Ելք' },
                                        ]}
                                    />
                                    <FormDataConsumer>
                                        {({ formData }: any) => formData.balanceStatus &&
                                            <>
                                                <PlusMinusFromDepositInput balanceStatus={formData.balanceStatus} />
                                                {permissions == 'super' && formData.balanceStatus == 'inc' &&
                                                    <BooleanInput label='Կլինիկայի կողմից' defaultValue={false} source='fromClinic' />
                                                }
                                            </>
                                        }
                                    </FormDataConsumer>
                                </div>
                            }
                            {permissions !== 'doctor' &&
                                <FunctionField
                                    render={(record: any) => record &&
                                        <div>
                                            <h2 style={{ display: 'flex', justifyContent: 'space-between' }}>Կանխավճար - {record.deposit || 0} Դր․ {permissions == 'super' && <Button variant='contained' onClick={() => restart()}>Զրոյացնել</Button>}</h2>
                                            <h2 style={{ display: 'flex', justifyContent: 'space-between' }}>Մնացորդ - {record.balance > 0 && record.balance || 0} Դր․</h2>
                                        </div>
                                    }
                                />
                            }
                        </div>
                        {permissions != 'doctor' &&
                            <ReferenceArrayField pagination={<Pagination />} perPage={5} label='Մուտք/Ելք' reference='deposits' source='clientsDeposits'>
                                <Datagrid bulkActionButtons={permissions == 'super' ? <PostBulkActionButtonsToDelete /> : false}>
                                    <NumberField label='Գումար' source='value' />
                                    <TextField label='Կարգ․' source='balanceMessage' />
                                    <DateField label='Ամսաթիվ' source='inputDate' />
                                </Datagrid>
                            </ReferenceArrayField>
                        }
                    </TabPanel>
                    <TabPanel value={value} index={1} className='not-grid'>
                        <ReferenceArrayField filter={{ isDeleted: false, lastVisitChecked: 'came' }} pagination={<Pagination />} perPage={10} label='Visits' reference='visits' source='visits'>
                            <Datagrid className='clients-visits-table' bulkActionButtons={<PostBulkActionButtons />} optimized>
                                <FunctionField
                                    source='treatments'
                                    sortable={false}
                                    label={<HeaderOfTreatment />}
                                    render={(record: any) => {
                                        // let xRayPrice = 0;
                                        // xRayPrice = record.xRayPrice
                                        return (
                                            record && record.treatment !== null &&
                                            <Datagrid rowStyle={postRowSx} className='clients-treatments' header={<></>} bulkActionButtons={false} data={record.treatments}>
                                                <TextField style={{ textAlign: 'right' }} label={false} source='treatmentName' />
                                                <FunctionField
                                                    source='realPriceForTreatment'
                                                    render={(record: any) => record && <span style={{ textAlign: 'right' }}>{record.realPriceForTreatment ? record.realPriceForTreatment : null}</span>}
                                                />
                                                <FunctionField
                                                    source='payingPriceForTreatment'
                                                    render={(record: any) => record && <span style={{ textAlign: 'right' }}>{record.payingPriceForTreatment ? record.payingPriceForTreatment : null}</span>}
                                                />
                                                <NumberField style={{ textAlign: 'right' }} label={false} source='discountForTreatment' />
                                                <FunctionField
                                                    source='insuranceForTreatment.name'
                                                    render={(record: any) => record && <span style={{ textAlign: 'right' }} title={record.insuranceForTreatment ? record.insuranceForTreatment.name : ''}>{record.insuranceForTreatment ? record.insuranceForTreatment.name : null}</span>}
                                                />
                                            </Datagrid>
                                        )
                                    }
                                    }
                                />
                                <FunctionField
                                    label='Փակ.'
                                    render={() => <BooleanField source='isClosedRequest' />}
                                />
                                <FunctionField
                                    label='Ռեն.'
                                    render={(record: any) => record && record.xRayCount !== null ? record.xRayCount : 0}
                                />
                                <FunctionField
                                    label='Վճար.'
                                    render={(record: any) => record && record.insurance !== null ? <p style={{ margin: '0' }}>{record.fee !== null ? record.fee.toLocaleString() : 0}</p> : <p style={{ margin: '0' }}>{record.fee || '-'}</p>}
                                />
                                <FunctionField
                                    label='Մնաց.'
                                    render={(record: any) => record && record.balance !== null ? <p style={{ margin: '0', color: record.balance <= 0 ? 'green' : 'red', fontWeight: 'bolder' }}>{Math.abs(record.balance)}</p> : '-'}
                                />
                                <ReferenceField emptyText='-' sortable={false} label='Բժիշկ' source='doctors' reference='doctors'>
                                    <TextField source='shortName' />
                                </ReferenceField>
                                <FunctionField
                                    label='Ամս.'
                                    render={(record: any) => {
                                        return record && moment(record.startDate).format("YYYY") == '2010' ? '-' : <DateField emptyText='-' sortable={false} source='startDate' label='Ամս.' />
                                    }
                                    } />
                                <EditButton label='' />
                            </Datagrid>
                        </ReferenceArrayField>
                        <div style={{
                            display: 'flex',
                        }}>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignSelf: 'flex-start',
                            }}>
                                <p style={{ margin: '0', fontSize: '18px', fontWeight: 'bolder' }}>{companyName}</p>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    {clientFees !== null && Object.keys(clientFees).map((el: any, key: number) => {
                                        return <p key={key} style={{
                                            margin: '0',
                                            fontSize: '16px',
                                            color: 'green',
                                            fontWeight: 'bolder',
                                        }}>{el} - {clientFees[el] === null ? 0 : clientFees[el].toLocaleString()}դր․, </p>
                                    })}
                                    <FunctionField
                                        render={(record: any) => record && <p style={{
                                            margin: '0',
                                            fontSize: '16px',
                                            color: 'green',
                                            fontWeight: 'bolder',
                                        }}>Մնացորդ - {record.balance.toLocaleString()} դր․</p>}
                                    />
                                    <FunctionField
                                        render={(record: any) => record && <p style={{
                                            margin: '0',
                                            fontSize: '16px',
                                            color: 'green',
                                            fontWeight: 'bolder',
                                        }}>Կանխավճար - {record.deposit.toLocaleString()} դր․</p>}
                                    />
                                </div>
                            </div>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignSelf: 'flex-start',
                                marginLeft: '50px'
                            }}>
                                <p style={{ margin: '0', fontSize: '18px', fontWeight: 'bolder' }}>Ապահովագրություն</p>
                                {clientInsuranceFees !== null && Object.keys(clientInsuranceFees).map((el: any, key: number) => {
                                    return <p key={key} style={{
                                        margin: '0',
                                        fontSize: '16px',
                                        color: 'green',
                                        fontWeight: 'bolder',
                                    }}>{el} - {clientInsuranceFees[el] === null ? 0 : clientInsuranceFees[el]}դր․, </p>
                                })}
                            </div>
                        </div>
                    </TabPanel>
                    <TabPanel value={value} index={2} className='not-grid'>
                        <InsuranceInput />
                    </TabPanel>
                    <TabPanel value={value} index={3} className='not-grid'>
                        <ArrayInput source='future' label=''>
                            <SimpleFormIterator inline={false}>
                                <TextInput fullWidth multiline validate={required('Պարտադիր դաշտ')} source='text' label='Աշխատանք' />
                                <CustomDateInput label='Ամսաթիվ' source='date' />
                            </SimpleFormIterator>
                        </ArrayInput>
                    </TabPanel>
                    <TabPanel value={value} index={4} className='not-grid'>
                        <ReferenceArrayField pagination={<Pagination />} perPage={25} source='clientAttachment' reference='attachments'>
                            <ImageList />
                        </ReferenceArrayField>
                        <ImageInput multiple accept='.png, .jpg, .jpeg' source='newClientAttachment' label=' '>
                            <ImageField source='src' />
                        </ImageInput>
                    </TabPanel>
                    <CustomModal open={opened} handleClose={() => openModalFile(false)} >
                        <Box style={{
                            display: 'flex',
                            justifyContent: 'center',
                            outline: 'none',
                            width: 'auto',
                            height: '80%',
                        }}>
                            {loading ? <Loading /> :
                                <img style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain',
                                }} src={file} />}
                        </Box>
                    </CustomModal>
                </Box>
            </EditModal>
        </Dialog >
    );
}
