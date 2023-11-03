import {
    FormDataConsumer,
    ReferenceField,
    useRefresh,
    TextField,
    useRecordContext,
} from 'react-admin';
import { Button, CircularProgress } from '@mui/material';
import { useState } from 'react';
import moment from 'moment';

import { showNotification } from '../../utils/utils';
import { dataProvider } from '../../dataProvider';
import { CustomModal } from '../../utils/customModal';

export const VisitsSendSalary = () => {
    const record = useRecordContext();
    const refresh = useRefresh();
    const [sendSalary, setSendSalary] = useState(false);
    const [loading, setLoading] = useState(false);
    const [sendInsuranceSalary, setSendInsuranceSalary] = useState(false);

    const sendSalaryToDoctor = async (formData: any, feeBody: any, salary: any) => {
        setLoading(true);
        if (formData.clientsTemplates !== null && formData.clientsTemplatesConfirmed) {
            const { data } = await dataProvider.getOne('clientsTemplates', { id: formData.clientsTemplates.id })
            if (data.doctors) {
                if (data.doctors == formData.doctors) {
                    salary.special = formData.clientsTemplatesConfirmed;
                    salary.specialPercentage = data.percentage;
                    salary.clientsTemplates = data.id;
                }
            }
        }
        dataProvider.update('doctors/salary', {
            id: formData.doctors,
            data: {
                sentToDoctor: !feeBody.feeSentToDoctor,
                fee: feeBody.id,
                salary
            },
            previousData: {}
        }).then(() => {
            showNotification(!feeBody.feeSentToDoctor ? 'Փոխանցված է' : 'Հետ կանչված է', '', 'success', 2000);
            setLoading(false);
            refresh();
        }).catch(() => {
            setLoading(false);
        })
    }

    const sendInsuranceSalaryToDoctor = async (body: any, salary: any, treatment: any) => {
        await dataProvider.update('doctors/salary', {
            id: body.doctors,
            data: {
                sentToDoctor: !treatment.insuranceSalarySentToDoctor,
                treatment: treatment.id,
                salary
            },
            previousData: {}
        })
        setSendInsuranceSalary(false);
        showNotification('Փոխանցված է', '', 'success', 2000);
        refresh();
    }
    return (
        <div style={{ display: 'flex', justifyContent: 'center', columnGap: '50px', marginBottom: '10px' }}>
            <Button onClick={() => setSendSalary(true)} variant='contained'>Փոխանցել աշխ․</Button>
            {record.insurance !== null &&
                <Button onClick={() => setSendInsuranceSalary(true)} variant='contained'>Փոխանցել ԱՊՊԱ</Button>
            }
            <CustomModal open={sendSalary} handleClose={() => setSendSalary(false)} >
                <div style={{
                    width: '420px',
                    backgroundColor: 'white',
                    borderRadius: '10px',
                    padding: '10px',
                    height: 'auto',
                }}>
                    <div>
                        <div style={{ display: 'flex', borderBottom: '1px solid', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h4 style={{ margin: '0' }}>Կլինիկայի աշխատավարձ</h4>
                            <ReferenceField link={(record: any) => `/doctors/${record.id}`} fullWidth source='doctors' reference='doctors'>
                                <TextField style={{ fontSize: '1rem', fontWeight: 'bolder', color: '#e06d18' }} source='name' />
                            </ReferenceField>
                        </div>
                        {loading ?
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px 0' }}>
                                <CircularProgress />
                            </div>
                            : record.price != null && record.price > 0 && record.feeHistory.length != 0 ?
                                record.feeHistory.map((el: any, key: any) => {
                                    if (el.feeValue > 0) {
                                        const finalSalary = {
                                            insurance: null,
                                            price: key == 0 ? el.feeValue - record.xRayPrice : el.feeValue,
                                            special: false
                                        }
                                        return (
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'end', width: '100%' }}>
                                                <p style={{ fontSize: '18px', fontWeight: 'bolder', flex: '5' }}>{moment(el.date).format('YYYY-MM-DD')}</p>
                                                <p style={{ fontSize: '18px', fontWeight: 'bolder', flex: '5' }}>{el.feeValue.toLocaleString()} դր․</p>
                                                {el.feeSentToSalary ? <span style={{ color: 'red' }}>Հաշվարկված է</span> :
                                                    el.fromClinic ? <span style={{ color: 'red' }}>Կլինիկայի կողմից</span> :
                                                        <Button
                                                            disabled={record.doctors ? false : true}
                                                            style={{ minWidth: 'fit-content' }}
                                                            variant='contained'
                                                            className={el.feeSentToDoctor ? 'button-error ' : 'button-save'}
                                                            onClick={() => sendSalaryToDoctor(record, el, finalSalary)}>
                                                            {el.feeSentToDoctor ? 'Հետ կանչել' : 'Փոխանցել'}
                                                        </Button>
                                                }
                                            </div>
                                        )
                                    } else {
                                        return <p style={{ textAlign: 'center' }}>Փոխանցվող գումար առկա չէ</p>
                                    }
                                }) : <p style={{ textAlign: 'center' }}>Փոխանցվող գումար առկա չէ</p>
                        }
                    </div>
                </div>
            </CustomModal>
            <CustomModal open={sendInsuranceSalary} handleClose={() => setSendInsuranceSalary(false)} >
                <div style={{
                    width: '420px',
                    backgroundColor: 'white',
                    borderRadius: '10px',
                    padding: '10px',
                    height: 'auto',
                }}>
                    <FormDataConsumer>
                        {({ formData }: any) => {
                            const insuranceTreatment = formData.treatments.filter((el: any) => el.insuranceForTreatment !== null && el.closedInsuranceStatus == true);
                            return (
                                <div>
                                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h4 style={{ margin: '0' }}>ԱՊՊԱ աշխատավարձ</h4>
                                        <ReferenceField link={(record: any) => `/doctors/${record.id}`} fullWidth source='doctors' reference='doctors'><TextField style={{ fontSize: '1rem', fontWeight: 'bolder' }} source='name' /></ReferenceField>
                                    </div>
                                    {insuranceTreatment.length != 0 ?
                                        insuranceTreatment.map((el: any) => {
                                            const finalSalary = {
                                                insurance: formData.insurance,
                                                price: el.insurancePriceForTreatment
                                            }
                                            return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', columnGap: '25px' }}>
                                                <p>{el.treatmentName}</p>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'end' }}>
                                                    <p style={{ fontWeight: 'bolder' }}>{el.insurancePriceForTreatment} դր․</p>
                                                    {el.insuranceSentForSalary ? null :
                                                        <Button disabled={formData.doctors ? false : true} style={{ minWidth: 'fit-content' }} variant='contained' className={el.insuranceSalarySentToDoctor ? 'button-error ' : 'button-save'} onClick={() => sendInsuranceSalaryToDoctor(formData, finalSalary, el)}>{el.insuranceSalarySentToDoctor ? 'Հետ կանչել' : 'Փոխանցել'}</Button>
                                                    }
                                                </div>
                                            </div>
                                        }) : <p style={{textAlign: 'center'}}>Հայտերը դուրս գրված չեն</p>
                                    }
                                </div>
                            )
                        }}
                    </FormDataConsumer>
                </div>
            </CustomModal>
        </div>
    )
}