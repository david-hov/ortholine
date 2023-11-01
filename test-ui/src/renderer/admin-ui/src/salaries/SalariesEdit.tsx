import {
    useRedirect,
    ArrayInput,
    TextField,
    SimpleFormIterator,
    usePermissions,
    Loading,
    NumberField,
    FormDataConsumer,
    FunctionField,
    ReferenceField,
    useRefresh,
} from 'react-admin';
import { Button, Dialog } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';

import { showNotification } from '../utils/utils';
import { EditModal } from '../utils/editModal';
import { useEffect, useRef, useState } from 'react';
import { CustomModal } from '../utils/customModal';
import { ComponentToPrint } from './ReportsData';
import { dataProvider } from '../dataProvider';
import { useReactToPrint } from 'react-to-print';
import { InsuranceComponentToPrint } from './InsuranceReport';
import { ComponentToPrintLabs } from './LabReports';

export const SalariesEdit = ({ open, id }: { open: boolean; id?: string }) => {
    const { isLoading, permissions } = usePermissions();
    const componentRef = useRef(null);
    const redirect = useRedirect();
    const [companyName, setCompanyName] = useState<any>('');
    const [openedReports, openModalReports] = useState(false);
    const [openInsuranceReports, openModalInsuranceReports] = useState(false);
    const [lababReports, openModalLabReports] = useState<any>(false);
    const [reportData, setData] = useState<any>();
    const refresh = useRefresh();

    useEffect(() => {
        const companyNameFromStorage = localStorage.getItem('companyName');
        if (companyNameFromStorage) {
            setCompanyName(companyNameFromStorage);
        }
    }, [isLoading])

    const handleClose = () => {
        redirect('/salaries');
    };

    const handlePrint = useReactToPrint({
        content: () => componentRef?.current,
    });

    const onSuccess = () => {
        showNotification('Պահպանված է', '', 'success', 2000);
        refresh();
    };

    const getCurrentReport = async (scopedFormData: any, formData: any) => {
        const foundSpecialClientTemplate = formData.doctors.clientsTemplates.length !== 0 &&
            scopedFormData.clientsTemplates &&
            formData.doctors.clientsTemplates.find((el: any) => el.id == scopedFormData.clientsTemplates.id);
        if (foundSpecialClientTemplate) {
            scopedFormData.special = scopedFormData.special;
            scopedFormData.specialPercentage = foundSpecialClientTemplate.percentage;
        } else {
            scopedFormData.special = false;
            scopedFormData.specialPercentage = 0;
        }
        const currentReportsData = await dataProvider.getList('reports/currentReportsForSalary', {
            pagination: { page: 1, perPage: 10000 },
            sort: { field: 'id', order: 'DESC' },
            filter: {
                doctors: formData.doctors.id,
                insurance: scopedFormData.insurance,
                date: formData.date,
                special: scopedFormData.special,
                specialPercentage: scopedFormData.specialPercentage,
                specialClientsTemplates: scopedFormData.special ? scopedFormData.clientsTemplates.id : null,
            }
        })
        if (currentReportsData.total !== 0) {
            setData({
                data: currentReportsData.data[0].listData,
                totalFeeValue: currentReportsData.data[0].totalFeeValue,
                totalVisitPriceValue: currentReportsData.data[0].totalVisitPriceValue,
                special: currentReportsData.data[0].special,
                specialPercentage: currentReportsData.data[0].specialPercentage,
            })
            openModalReports(true)
        }
    }

    const getCurrentInsuranceReportsForDoctor = async (scopedFormData: any, formData: any) => {
        const currentReportsData = await dataProvider.getList('reports/currentInuranceReportsForSalary', {
            pagination: { page: 1, perPage: 10000 },
            sort: { field: 'id', order: 'DESC' },
            filter: {
                doctors: formData.doctors.id,
                insurance: scopedFormData.insurance.id,
                date: formData.date
            }
        })
        if (currentReportsData.total !== 0) {
            setData({
                data: currentReportsData.data[0].listData,
                totalInsuranceValue: currentReportsData.data[0].totalInsuranceValue,
                realTotalInsuranceValue: currentReportsData.data[0].realTotalInsuranceValue
            })
            openModalInsuranceReports(true)
        }
    }

    const getLabReports = async (salaryId: any) => {
        const { data } = await dataProvider.getOne('reports/labReportsForSalary', {
            id: salaryId
        })
        if (data) {
            setData({
                data: data
            })
            openModalLabReports(true)
        }
    }

    if (isLoading) return <Loading />

    return (
        <Dialog className='create-edit-salary' open={open}>
            {openedReports && reportData.data.length !== 0 &&
                <CustomModal open={openedReports} handleClose={() => openModalReports(false)} >
                    <div style={{
                        width: '90%',
                        backgroundColor: 'white',
                        padding: '10px',
                        height: '90%',
                        overflowY: 'auto',
                    }}>
                        <Button variant='contained' onClick={() => handlePrint()}><PrintIcon /></Button>
                        <ComponentToPrint reportData={reportData} ref={componentRef} />
                    </div>
                </CustomModal>
            }
            {openInsuranceReports && reportData.data.length !== 0 &&
                <CustomModal open={openInsuranceReports} handleClose={() => openModalInsuranceReports(false)} >
                    <div style={{
                        width: '90%',
                        backgroundColor: 'white',
                        padding: '10px',
                        height: '90%',
                        overflowY: 'auto',
                    }}>
                        <Button variant='contained' onClick={() => handlePrint()}><PrintIcon /></Button>
                        <InsuranceComponentToPrint reportData={reportData} ref={componentRef} />
                    </div>
                </CustomModal>
            }
            {lababReports && reportData.data &&
                <CustomModal open={lababReports} handleClose={() => openModalLabReports(false)} >
                    <div style={{
                        width: '90%',
                        backgroundColor: 'white',
                        padding: '10px',
                        height: '90%',
                        overflowY: 'auto',
                    }}>
                        <Button variant='contained' onClick={() => handlePrint()}><PrintIcon /></Button>
                        <ComponentToPrintLabs reportData={reportData.data} ref={componentRef} />
                    </div>
                </CustomModal>
            }
            <EditModal resource='Աշխատավարձ' id={id} validate={undefined} onSuccess={onSuccess} handleClose={handleClose}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                    flexDirection: 'column'
                }}>
                    <TextField style={{ fontSize: '20px' }} fullWidth source="doctors.name" />
                </div>
                <div style={{
                    display: 'flex',
                    width: '100%',
                    justifyContent: 'center',
                    color: '#ed7c07',
                }}>
                    <FunctionField
                        render={(record: any) => record &&
                            <span style={{ fontSize: '20px', fontWeight: 'bolder', color: 'green' }}>Տվյալ ամիս - {record.sum.toLocaleString()} Դր․</span>
                        }
                    />
                </div>
                <ArrayInput disabled={permissions !== 'super' ? true : false} className='salariesEdit' label='Գումարներ' source="doctorSalaries">
                    <SimpleFormIterator disableClear disableRemove={true} disableAdd={true} disableReordering={true}>
                        <FormDataConsumer>
                            {({ scopedFormData, formData }: any) => {
                                if (scopedFormData) {
                                    return (
                                        scopedFormData.insurance == null ?
                                            <p>{scopedFormData.special ? scopedFormData.clientsTemplates.name : companyName}</p> :
                                            <p title={scopedFormData.insurance.name}>{scopedFormData.insurance.name}</p>
                                    )
                                }
                            }}
                        </FormDataConsumer>
                        <NumberField fullWidth label='Արժեք Դր․' source="price" />
                        <FormDataConsumer>
                            {({
                                scopedFormData, formData
                            }: any) => {
                                return <Button variant='contained' onClick={() => scopedFormData.insurance ? getCurrentInsuranceReportsForDoctor(scopedFormData, formData) : getCurrentReport(scopedFormData, formData)}>Տեսնել քաղվածքը</Button>
                            }}
                        </FormDataConsumer>
                    </SimpleFormIterator>
                </ArrayInput>
                <div style={{ width: '100%' }}>
                    <FunctionField
                        render={(record: any) => record &&
                            record.laboratories.length !== 0 &&
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                    <p style={{ fontSize: '20px', fontWeight: 'bolder', margin: '0' }}>Լաբորատորիայի արժեք</p>
                                    <Button variant='contained' onClick={() => getLabReports(record.id)}>Տեսնել լաբ․ քաղվածքը</Button>
                                </div>
                                <ArrayInput label='Լաբորատորիաներ' source="laboratories">
                                    <SimpleFormIterator disableAdd disableRemove disableClear disableReordering>
                                        <ReferenceField label="User" source="laboratories" reference="laboratories">
                                            <TextField style={{ fontSize: '20px' }} source="name" />
                                        </ReferenceField>
                                        <NumberField style={{ fontSize: '20px' }} source="price" />
                                        <TextField style={{ fontSize: '20px', width: '50%' }} source="name" />
                                    </SimpleFormIterator>
                                </ArrayInput>
                            </div>
                        }
                    />
                </div>
                {/* <FunctionField
                    render={(record: any) => record && <span style={{ fontSize: '20px', fontWeight: 'bolder' }}>Ընդհանուր - {parseInt(record.total).toLocaleString()}Դր․</span>}
                /> */}
            </EditModal>
        </Dialog>
    );
}
