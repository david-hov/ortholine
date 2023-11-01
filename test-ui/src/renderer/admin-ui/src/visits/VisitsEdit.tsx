import {
    useRedirect,
    TextInput,
    required,
    NumberInput,
    ReferenceInput,
    SelectInput,
    AutocompleteInput,
    DateTimeInput,
    RadioButtonGroupInput,
    usePermissions,
    Loading,
    useRecordContext,
    FunctionField,
    FormDataConsumer,
    ReferenceField,
    TextField,
    SaveButton,
    Edit,
    SimpleForm,
    NullableBooleanInput,
    useRefresh,
    BooleanInput,
} from 'react-admin';
import { Dialog, Button, useMediaQuery } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useWatch, useController } from 'react-hook-form';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import { showNotification } from '../utils/utils';
import { TabPanel } from '../utils/tabPanel';
import { validateVisitsCreation } from './validation';
import { EditModal } from '../utils/editModal';
import { CustomModal } from '../utils/customModal';
import { ImageInputField } from '../utils/imageInput';
import { VisitsTreatments } from './components/VisitsTreatments';
import { VisitsSendSalary } from './components/VisitsSendSalary';
import { dataProvider } from '../dataProvider';
import { VisitsFeeHistory } from './components/VisitsFeeHistory';

export const VisitsEdit = ({ open, id, clientId }: { open: boolean; id?: string; clientId?: string }) => {
    const { isLoading, permissions } = usePermissions();
    const redirect = useRedirect();
    const refresh = useRefresh();
    const [value, setValue] = useState(0);
    const [xrayPrice, setXrayPrice] = useState(1000);
    const [toDeposit, setToDeposit] = useState(false);
    const [clientsBalance, setClientsBalance] = useState<any>(null);
    const isSmall = useMediaQuery('(max-width:600px)');
    const inputRefStart = useRef<any>(null);
    const inputRefEnd = useRef<any>(null);
    const [modal, setModal] = useState(false);

    const handleClick = (type: any) => {
        if (type == 'start') {
            if (inputRefStart.current === null) return;
            inputRefStart.current.showPicker();
        } else {
            if (inputRefEnd.current === null) return;
            inputRefEnd.current.showPicker();
        }
    };

    const change = async (doctorId: any, startDate: any) => {
        if (startDate !== null || startDate !== '') {
            const { data } = await dataProvider.getList('doctors/available', {
                pagination: { page: 1, perPage: 2 },
                sort: { field: 'id', order: 'DESC' },
                filter: { id: doctorId, startDate: startDate }
            })
            if (data) {
                setModal(true);
            } else {
                setModal(false);
            }
        }
    }

    useEffect(() => {
        const getSettings = async () => {
            const { data } = await dataProvider.getList('settings', {
                pagination: { page: 1, perPage: 1000 },
                sort: { field: 'id', order: 'DESC' },
                filter: {}
            })
            if (data.length !== 0) {
                setXrayPrice(data[0].xRayPrice);
            }
        }
        getSettings();
    }, [])

    const getClientBalance = async (clientsId: any) => {
        const { data } = await dataProvider.getOne('clients', {
            id: clientsId
        })
        if (data) {
            setClientsBalance(data.balance)
        }
    }

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    const handleClose = () => {
        redirect(`list`, '/visits');
    };

    const onSuccess = (body: any) => {
        if (body.deposit) {
            setToDeposit(false);
        } else {
            showNotification('Պահպանված է', '', 'success', 2000);
        }
        refresh();
    };

    const XrayInput = () => {
        const oldValue = useWatch({ name: 'price' });
        const xRayCount = useWatch({ name: 'xRayCount' });
        const priceInput = useController({ name: 'price' });
        const xRayPriceInput = useController({ name: 'xRayPrice' });
        const balance = useController({ name: 'balance', defaultValue: 0 });
        const feeHistoryValue = useWatch({ name: 'feeHistory' });
        const existSentSalary = feeHistoryValue.findIndex((el: any) => el.feeSentToDoctor);
        const change = (e: any) => {
            const allValue = parseInt(feeHistoryValue.reduce((a: any, b: any) => a + b.feeValue, 0))
            let xRayPrice;
            let price;
            let balanceValue;
            if (e.target.value == '') {
                xRayPrice = xRayCount * xrayPrice;
                price = oldValue - xRayPrice;
                xRayPrice = 0;
            } else if (e.target.value > xRayCount) {
                price = oldValue - (xRayCount * xrayPrice);
                xRayPrice = e.target.value * xrayPrice;
                price = price + xRayPrice;
            } else {
                xRayPrice = (xRayCount - e.target.value) * xrayPrice;
                price = oldValue - xRayPrice;
                xRayPrice = e.target.value * xrayPrice;
            }
            balanceValue = price - allValue;
            xRayPriceInput.field.onChange(Number(xRayPrice) ? xRayPrice : 0)
            priceInput.field.onChange(price)
            balance.field.onChange(balanceValue < 0 ? 0 : balanceValue);
        }
        if (existSentSalary > -1) {
            return (
                <div style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'left',
                    columnGap: '20px',
                    fontSize: '20px',
                }}>
                    <p style={{ margin: 0 }}>Ռենտգեն քանակ - </p>
                    <p style={{ margin: 0 }}>{xRayCount}</p>
                </div>
            )
        }
        return (
            <div>
                <NumberInput type='tel' onChange={(e: any) => change(e)} validate={required('Պարտադիր դաշտ')} fullWidth source='xRayCount' label='Ռենտգենների քանակ' />
                {/* {insuranceValue &&
                    <NumberInput defaultValue={0} type='tel' validate={required('Պարտադիր դաշտ')} fullWidth source='xRayCountInsurance' label='Ռենտգենների քանակ ԱՊՊԱ' />
                } */}
                <p style={{ margin: '0' }}>Ռենտգենների արժեք <span style={{ fontWeight: 'bolder' }}>{xRayPriceInput.field.value}</span></p>
            </div>
        );
    };

    const CalculateFee = () => {
        const price = useWatch({ name: 'price' });
        const feeHistoryValue = useWatch({ name: 'feeHistory' });
        const feeValue = useController({ name: 'fee' });
        const balance = useController({ name: 'balance', defaultValue: 0 });
        useEffect(() => {
            const allValue = parseInt(feeHistoryValue.reduce((a: any, b: any) => a + b.feeValue, 0))
            feeValue.field.onChange(allValue);
            let value = price - allValue;
            balance.field.onChange(value < 0 ? 0 : value);
        }, [JSON.stringify(feeHistoryValue) || price])
        return (
            <NumberInput style={{ display: 'none' }} source='fee' />
        )
    }

    const MinusFromDepositInput = () => {
        const deposit = useController({ name: 'deposit' });
        const depositOld = useWatch({ name: 'deposit', disabled: true });
        const change = (e: any) => {
            let value = 0;
            if (e.target.value) {
                if (isNaN(e.target.value)) {
                    value = parseInt(depositOld);
                } else {
                    value = parseInt(depositOld) - parseInt(e.target.value);
                }
            } else {
                value = parseInt(depositOld);
            }
            deposit.field.onChange(value < 0 ? 0 : value)
        }
        return (
            <NumberInput validate={required('Պարտադիր դաշտ')} type='tel' min={0} onChange={(e: any) => change(e)} fullWidth source='minus' label={'Դուրս բերել կանպավճարից'} />
        );
    };

    const optionRenderer = (choice: any) => {
        return `${choice.name}`
    };

    const TabsNavigation = () => {
        const record = useRecordContext();
        return (
            <Tabs className='edit-navigation' value={value} onChange={handleChange} aria-label="basic tabs example">
                <Tab label="Գլխավոր" />
                {permissions == 'doctor' ? record.lastVisitChecked != 'late' &&
                    <Tab label="Կատարված աշխատանք" /> :
                    <Tab label="Կատարված աշխատանք" />
                }
                {permissions !== 'doctor' &&
                    <Tab label="Ադմինիստրացիա" />
                }
                <div className='client-name-tabs'>
                    <ReferenceField link={(record: any) => `/clients/${record.id}`} source="clients" reference="clients">
                        <TextField style={{
                            fontSize: '18px',
                            fontWeight: 'bolder',
                        }} source="name" />
                        <p style={{ color: 'black', margin: 0, fontSize: 'smaller' }}>Մուտք գործել անկետա</p>
                    </ReferenceField>
                </div>
            </Tabs>
        )
    }

    if (isLoading) return <Loading />

    return (
        <Dialog className='create-edit' open={open}>
            {modal &&
                <CustomModal open={modal} handleClose={() => setModal(false)} >
                    <div style={{
                        width: 'fit-content',
                        padding: '10px',
                        backgroundColor: 'white',
                        height: 'auto',
                        overflowY: 'auto',
                    }}>
                        <h3 style={{ color: 'red' }}>Ընտրված ժամանակ բժիշկը արձակուրդում է։</h3>
                    </div>
                </CustomModal>
            }
            <EditModal resource='Այցելություն' id={id} validate={(values: any) => validateVisitsCreation({ values, permissions })} onSuccess={onSuccess} handleClose={handleClose}>
                {permissions !== 'doctor' &&
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        width: '100%',
                        alignItems: 'center',
                    }}>
                        <>
                            <RadioButtonGroupInput label='Մոտեցել է նշված օրը' source="lastVisitChecked" choices={[
                                { id: 'notCame', name: 'Չի մոտեցել' },
                                { id: 'came', name: 'Մոտեցել է' },
                            ]} />
                        </>
                    </div>
                }
                <TabsNavigation />
                <TabPanel value={value} index={0} className='not-grid'>
                    <div style={{ display: 'flex', flexDirection: isSmall ? 'column' : 'row' }}>
                        <div style={{ flex: '1' }}>
                            <FormDataConsumer>
                                {({ formData }: any) => {
                                    let alreadySentAndToDisable = false;
                                    const feeHistoryValue = useWatch({ name: 'feeHistory' });
                                    const existSentSalary = feeHistoryValue && feeHistoryValue.findIndex((el: any) => el.feeSentToDoctor);
                                    if (existSentSalary > -1) {
                                        alreadySentAndToDisable = true;
                                    } else {
                                        alreadySentAndToDisable = false;
                                    }
                                    return (
                                        <div>
                                            <ReferenceInput fullWidth label="Բժիշկ" source="doctors" reference="doctors">
                                                {alreadySentAndToDisable ?
                                                    <SelectInput fullWidth disabled={true} label='Բժիշկ' optionText='name' />
                                                    :
                                                    <SelectInput disabled={permissions == 'doctor' ? true : false} onChange={(e: any) => change(e.target.value, formData.startDate)} fullWidth validate={required('Պարտադիր դաշտ')} label='Բժիշկ' optionText='name' />
                                                }
                                            </ReferenceInput>
                                            {clientId ?
                                                <ReferenceInput defaultValue={clientId} source="clients" reference="clients">
                                                    {alreadySentAndToDisable ?
                                                        <SelectInput fullWidth disabled={true} label='Պացիենտ' optionText={optionRenderer} />
                                                        :
                                                        <AutocompleteInput disabled={permissions == 'doctor' ? true : false} fullWidth validate={required('Պարտադիր դաշտ')} label='Պացիենտ' optionText={optionRenderer} />
                                                    }
                                                </ReferenceInput> :
                                                <ReferenceInput source="clients" reference="clients">
                                                    {alreadySentAndToDisable || permissions == 'doctor' ?
                                                        <SelectInput fullWidth disabled={true} label='Պացիենտ' optionText={optionRenderer} />
                                                        :
                                                        <AutocompleteInput fullWidth validate={required('Պարտադիր դաշտ')} label='Պացիենտ' optionText={optionRenderer} />
                                                    }
                                                </ReferenceInput>
                                            }
                                            <DateTimeInput disabled={alreadySentAndToDisable || permissions == 'doctor' ? true : false} onChange={(e: any) => change(formData.doctors, e.target.value)} onClick={() => alreadySentAndToDisable ? null : handleClick('start')} inputProps={{ ref: inputRefStart }} validate={required('Պարտադիր դաշտ')} fullWidth label='Մեկնարկ' source='startDate' />
                                            <DateTimeInput disabled={alreadySentAndToDisable || permissions == 'doctor' ? true : false} onClick={() => alreadySentAndToDisable ? null : handleClick('end')} inputProps={{ ref: inputRefEnd }} validate={required('Պարտադիր դաշտ')} fullWidth label='Ավարտ' source='endDate' />
                                            <ReferenceInput label="Ապահովագրություն" source="insurance" reference="insurance">
                                                <SelectInput disabled={alreadySentAndToDisable || permissions == 'doctor' ? true : false} fullWidth label="Ապահովագրություն" optionText="name" />
                                            </ReferenceInput>
                                        </div>
                                    )
                                }}
                            </FormDataConsumer>
                            <TextInput fullWidth source='info' label='Նշումներ' />
                        </div>
                        <div style={{ flex: '1' }}>
                            <ImageInputField create={false} fieldName='visitAttachment' perPage={5} />
                        </div>
                    </div>
                </TabPanel>
                <TabPanel value={value} index={1} className='not-grid'>
                    <FormDataConsumer>
                        {({ formData }: any) => {
                            return (
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #e06d18' }}>
                                    <div style={{ marginBottom: '10px' }}>
                                        <p style={{ margin: '0', fontWeight: 'bolder' }}>Բուժման արժեք ըստ ադմինիստրացիայի - {formData.price !== null && formData.price - formData.xRayPrice}Դր․</p>
                                        <p style={{ margin: '0', fontWeight: 'bolder' }}>Ռենտգեն քանակ/արժեք ըստ ադմինիստրացիայի - {formData.xRayCount !== null ? `${formData.xRayCount} / ${formData.xRayPrice}Դր․` : 0}</p>
                                        {/* {formData.insurance !== null &&
                                            <p style={{ margin: '0', fontWeight: 'bolder' }}>ԱՊՊԱ - Ռենտգեն քանակ ըստ ադմինիստրացիայի - {formData.xRayCount !== null ? `${formData.xRayCountInsurance}` : 0}</p>
                                        } */}
                                    </div>
                                    <div style={{ display: 'flex' }}>
                                        {formData.insurance !== null && <p style={{ margin: '0', fontWeight: 'bolder' }}><span>Առկա է ապահովագրական աշխատանք </span>
                                            <ReferenceField label="User" source='insurance' reference="insurance">
                                                <TextField style={{ fontSize: '18px', fontWeight: 'bolder', color: '#df6f18' }} source="name" />
                                            </ReferenceField>
                                        </p>}
                                    </div>
                                </div>
                            )
                        }}
                    </FormDataConsumer>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <NumberInput type='tel' validate={required('Պարտադիր դաշտ')} source='xRayCountByDoctor' label='Ռենտգենների քանակ' />
                        <FormDataConsumer>
                            {({ formData }: any) => formData.insurance !== null &&
                                <div className='xRayCountInsurance'>
                                    <NumberInput type='tel' defaultValue={0} validate={required('Պարտադիր դաշտ')} source='xRayCountInsuranceByDoctor' label='ԱՊՊԱ ռենտգենների քանակ' />
                                    {permissions !== 'doctor' && formData.xRayCountInsuranceByDoctor > 0 &&
                                        <BooleanInput defaultValue={false} source='closeXRayCountInsurance' label='Դուրս գրված' />
                                    }
                                </div>
                            }
                        </FormDataConsumer>
                        <div>
                            <NullableBooleanInput style={{ marginRight: '10px' }} label='Զանգ պացիենտին' source='callClient' />
                            <NullableBooleanInput label='Զանգ լաբ․' source='callLab' />
                        </div>
                    </div>
                    <VisitsTreatments permissions={permissions} />
                    <FormDataConsumer>
                        {({ formData }: any) => {
                            const doctorPrice = formData.priceByDoctor;
                            const doctorXrayCount = formData.xRayCountByDoctor;
                            const adminPrice = formData.price - formData.xRayPrice;
                            const adminXrayCount = formData.xRayCount;
                            return (
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <p>Ընդհանուր վճարման ենթակա գումար - {formData.priceByDoctor || 0} Դր․</p>
                                    {((doctorPrice != 0 && adminPrice != doctorPrice) || (doctorXrayCount != adminXrayCount)) ? <p style={{ color: 'red', fontWeight: 'bolder' }}>Առկա է անհամապատասխանություն արժեքում</p> : null}
                                    {/* {formData.insurance && formData.xRayCountInsuranceByDoctor != formData.xRayCountInsurance && <p style={{ color: 'red', fontWeight: 'bolder' }}>Առկա է անհամապատասխանություն ԱՊՊԱ արժեքում</p>} */}
                                </div>
                            )
                        }}
                    </FormDataConsumer>
                </TabPanel>
                <TabPanel value={value} index={2} className='not-grid'>
                    <VisitsSendSalary />
                    <div style={{ display: 'flex', justifyContent: 'space-between', columnGap: '20px' }}>
                        <div className='administration-panel'>
                            <h3 style={{ borderBottom: '5px solid #e06c01' }}>Ադմինիստրացիայի բաժին</h3>
                            <FormDataConsumer>
                                {({ formData }: any) => {
                                    const xRayCountInput = useController({ name: 'xRayCount' });
                                    const xRayPriceInput = useController({ name: 'xRayPrice' });
                                    const balanceInput = useController({ name: 'balance' });
                                    const feeHistoryValue = useWatch({ name: 'feeHistory' });
                                    const fee = useWatch({ name: 'fee' });
                                    const existSentSalary = feeHistoryValue.findIndex((el: any) => el.feeSentToDoctor);
                                    const change = (e: any) => {
                                        xRayCountInput.field.onChange(null);
                                        xRayPriceInput.field.onChange(0);
                                        if (fee != 0) {
                                            let value = e.target.value - fee;
                                            balanceInput.field.onChange(value < 0 ? 0 : value);
                                        }
                                    }
                                    if (existSentSalary > -1) {
                                        return <div style={{
                                            width: '100%',
                                            display: 'flex',
                                            justifyContent: 'left',
                                            columnGap: '20px',
                                            fontSize: '20px',
                                        }}>
                                            <p style={{ margin: 0 }}>Արժեք - </p>
                                            <p style={{ margin: 0 }}>{formData.price.toLocaleString()} Դր․</p>
                                        </div>
                                    }
                                    return (
                                        <NumberInput type='tel' min={0} onChange={(e: any) => change(e)} validate={required('Պարտադիր դաշտ')} fullWidth source='price' label='Արժեք Դր․' />
                                    )
                                }}
                            </FormDataConsumer>
                            <XrayInput />
                            <VisitsFeeHistory />
                            <CalculateFee />
                            <NumberInput type='tel' min={0} disabled={true} defaultValue={0} fullWidth source='balance' label='Մնացորդ Դր․' />
                            <FunctionField
                                render={(record: any) => record && record.fromDeposit && <h2>Գումարը դուրս է բերված կանխավճարից</h2>}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Button variant='contained' color='success' onClick={() => setToDeposit(true)}>Գումարի Ելք կանխավճարից</Button>
                                <FunctionField
                                    render={(record: any) => record &&
                                        <Button variant='contained' color='success' onClick={() => getClientBalance(record.clients)}>Ամբողջ մնացորդը</Button>
                                    } />
                            </div>
                            {clientsBalance != null &&
                                <CustomModal open={true} handleClose={() => setClientsBalance(null)} >
                                    <div style={{
                                        width: 'auto',
                                        backgroundColor: 'white',
                                        padding: '10px',
                                        height: 'fit-content',
                                    }}>
                                        <h3 style={{ textAlign: 'center' }}>Պացիենտի ամբողջ մնացորդը</h3>
                                        <h2 style={{ textAlign: 'center' }}>{clientsBalance.toLocaleString()} դր․</h2>
                                    </div>
                                </CustomModal>
                            }
                            {toDeposit &&
                                <FunctionField
                                    render={(record: { clients: any; }) => record &&
                                        <Edit
                                            resource='clients'
                                            mutationMode='optimistic'
                                            id={record.clients}
                                            mutationOptions={{ onSuccess }}
                                        >
                                            <CustomModal open={toDeposit} handleClose={() => setToDeposit(false)} >
                                                <div style={{
                                                    width: 'auto',
                                                    backgroundColor: 'white',
                                                    padding: '10px',
                                                    height: 'auto',
                                                }}>
                                                    <SimpleForm toolbar={<SaveButton className='button-save' />}>
                                                        <NumberInput disabled={true} type='tel' min={0} source='deposit' label='Հաճախորդի կանխավճար (Դր․)' />
                                                        <MinusFromDepositInput />
                                                    </SimpleForm>
                                                </div>
                                            </CustomModal>
                                        </Edit>
                                    }
                                />
                            }
                        </div>
                        <div style={{ border: '2px solid #4d7e86' }}></div>
                        <div className='doctor-panel'>
                            <h3 style={{ borderBottom: '5px solid #e06c01' }}>Բժշկի բաժին</h3>
                            <NumberInput disabled={true} type='tel' min={0} fullWidth source='priceByDoctor' label='Բժշկի մուտքագրած գումար' />
                            <FormDataConsumer>
                                {({ formData }: any) => formData.insurance != null &&
                                    <>
                                        <NumberInput disabled={true} type='tel' min={0} defaultValue={0} fullWidth source='insurancePriceByDoctor' label='ԱՊՊԱ բժշկի մուտքագրած արժեք դր․' />
                                    </>
                                }
                            </FormDataConsumer>
                            <FormDataConsumer>
                                {({ formData }: any) =>
                                    <>
                                        <NumberInput disabled={true} helperText={formData.xRayCountByDoctor != formData.xRayCount && 'Անահամապատասխանություն'} type='tel' min={0} fullWidth source='xRayCountByDoctor' label='Բժշկի մուտքագրած ռենտգենների քանակ' />
                                    </>
                                }
                            </FormDataConsumer>
                        </div>
                    </div>
                </TabPanel>
            </EditModal>
        </Dialog>
    );
}
