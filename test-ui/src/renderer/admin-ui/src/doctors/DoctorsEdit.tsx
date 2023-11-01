import {
    useRedirect,
    TextInput,
    required,
    NumberInput,
    ArrayInput,
    SimpleFormIterator,
    FormDataConsumer,
    CheckboxGroupInput,
    usePermissions,
    Loading,
    ReferenceInput,
    SelectInput,
    DateInput,
    useRefresh,
    DeleteWithConfirmButton,
} from 'react-admin';
import { Button, Dialog, Tab, Tabs } from '@mui/material';
import { useController } from 'react-hook-form';
import PrintIcon from '@mui/icons-material/Print';
import RemoveIcon from '@mui/icons-material/HighlightOff';

// @ts-ignore
import { SketchPicker } from 'react-color'
import { useEffect, useRef, useState } from 'react';
import { showNotification } from '../utils/utils';
import { dataProvider } from '../dataProvider';
import { ComponentToPrint } from './ReportsData';
import { CustomModal } from '../utils/customModal';
import { useReactToPrint } from 'react-to-print';
import { EditModal } from '../utils/editModal';
import { CustomDateInput } from '../utils/dateInput';
import { TabPanel } from '../utils/tabPanel';
import { InsuranceComponentToPrint } from './InsuranceReport';

export const DoctorsEdit = ({ open, id }: { open: boolean; id?: string }) => {
    const redirect = useRedirect();
    const componentRef = useRef(null);
    const { isLoading, permissions } = usePermissions();
    const [openedReports, openModalReports] = useState(false);
    const [openInsuranceReports, openModalInsuranceReports] = useState(false);
    const [confirmModal, setConfirmModal] = useState<any>(false);
    const [reportData, setData] = useState<any>();
    const [value, setValue] = useState(0);
    const [companyName, setCompanyName] = useState<any>('Կլինիկա');
    const inputRefStart = useRef<any>(null);
    const inputRefEnd = useRef<any>(null);
    const refresh = useRefresh();

    const handleClick = (type: any) => {
        if (type == 'start') {
            if (inputRefStart.current === null) return;
            inputRefStart.current.showPicker();
        } else {
            if (inputRefEnd.current === null) return;
            inputRefEnd.current.showPicker();
        }
    };

    useEffect(() => {
        const companyNameFromStorage = localStorage.getItem('companyName');
        if (companyNameFromStorage != 'null') {
            setCompanyName(companyNameFromStorage);
        }
    }, [])

    const handleClose = () => {
        redirect('/doctors');
    };

    const onSuccess = () => {
        showNotification('Պահպանված է', '', 'success', 2000);
        refresh();
    };

    const handlePrint = useReactToPrint({
        content: () => componentRef?.current,
    });

    const PercentageInput = () => {
        const sum = useController({ name: 'sum' });
        const change = () => {
            sum.field.onChange(null);
        }
        return (
            <NumberInput fullWidth disabled={permissions !== 'super' ? true : false} type='tel' validate={required('Պարտադիր դաշտ')} onChange={() => change()} label='Բժշկի Տոկոս' source='percentage' />
        );
    };

    const ColorPicker = () => {
        const colorInput = useController({ name: 'color' });
        const [sketchPickerColor, setSketchPickerColor] = useState({
            r: "241",
            g: "112",
            b: "19",
            a: "1",
        });

        return <SketchPicker
            onChange={(color: any) => {
                setSketchPickerColor(color.rgb);
                colorInput.field.onChange(color.hex)
            }}
            color={colorInput.field.value || sketchPickerColor}
        />
    }

    const sendToSalaries = (body: any) => {
        dataProvider.create('salaries', {
            data: body
        }).then(() => {
            showNotification('Աշխատավարձը պահպանված է', '', 'success', 2000);
            redirect('/doctors');
        }).catch(() => {
            setConfirmModal(true);
        })
    }

    const CalculateInput = () => {
        const sumInput = useController({ 'name': 'sum' })
        const calculatePrice = (record: any) => {
            let price = 0;
            let specialPrices: { value: number; clientTemplatePercentage: any; }[] = []
            if (record.checked == undefined || record.checked.length == 0) {
                showNotification('Ընտրեք Գումարներից որևէ մեկը', '', 'warning', 2000)
            } else {
                record.checked.forEach((el: any) => {
                    const found = record.doctorSalaries.find((item: any) => {
                        if (item.insurance) {
                            return item.insurance.name == el
                        }
                        if (el == companyName && !item.special) {
                            return item.insurance == null
                        }
                        if (item.clientsTemplates && el == item.clientsTemplates.name) {
                            return item.insurance == null
                        }
                    })
                    if (found) {
                        if (found.insurance) {
                            price = price + (parseInt(found.price) - (found.price * found.insurance.percentage / 100));
                        } else {
                            if (found.special) {
                                specialPrices.push({
                                    value: parseInt(found.price),
                                    clientTemplatePercentage: found.clientsTemplates.percentage
                                })
                            }
                            else {
                                price = price + parseInt(found.price)
                            }
                        }
                    }
                });
                const labPrices = record.laboratories.filter((el: any) => el.price > 0).reduce((a: any, b: any) => a + b.price, 0);
                const priceWithoutLab = price - labPrices;
                const finalPrice = (priceWithoutLab * record.percentage) / 100;
                const finalSpecialPrice = specialPrices.reduce((a: any, b: any) => a + (b.value * b.clientTemplatePercentage / 100), 0)
                sumInput.field.onChange(finalPrice + finalSpecialPrice)
            }
        }
        return (
            <>
                <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                    <FormDataConsumer>
                        {({
                            formData
                        }: any) => {
                            return <Button color='success' onClick={() => calculatePrice(formData)} style={{ margin: '10px 0' }} variant='contained'>Հաշվարկել գումարը</Button>
                        }}
                    </FormDataConsumer>
                    <FormDataConsumer>
                        {({
                            formData
                        }: any) => {
                            return <div style={{ fontSize: '20px' }}>
                                <span style={{ marginRight: '10px' }}>Բժշկի գումար</span>
                                <span>{formData.sum ? formData.sum.toLocaleString() : 0}Դր․</span>
                            </div>
                        }}
                    </FormDataConsumer>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <CustomDateInput label='Ամփոփման ամսաթիվ' source="finishedMonth" />
                    <FormDataConsumer>
                        {({
                            formData
                        }: any) => {
                            formData.confirmToAddSameMonth = false;
                            return formData.finishedMonth && formData.sum ? <Button onClick={() => sendToSalaries(formData)} style={{ margin: '10px 0' }} variant='contained'>Ամսվա ավարտ</Button> : null
                        }}
                    </FormDataConsumer>
                </div>
            </>
        )
    }

    const getCurrentInsuranceReportsForDoctor = async (insurance: any, doctors: any) => {
        const currentReportsData = await dataProvider.getList('reports/currentInuranceReports', {
            pagination: { page: 1, perPage: 10000 },
            sort: { field: 'id', order: 'DESC' },
            filter: { doctors: doctors, insurance: insurance.id }
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

    const getCurrentReport = async (scopedFormData: any, formData: any) => {
        const foundSpecialClientTemplate = formData.clientsTemplates.length !== 0 &&
            scopedFormData.clientsTemplates &&
            formData.clientsTemplates.find((el: any) => el.id == scopedFormData.clientsTemplates.id);
        if (foundSpecialClientTemplate && scopedFormData.special) {
            scopedFormData.special = scopedFormData.special;
            scopedFormData.specialPercentage = foundSpecialClientTemplate.percentage;
        } else {
            scopedFormData.special = false;
            scopedFormData.specialPercentage = 0;
        }
        const currentReportsData = await dataProvider.getList('reports/currentReports', {
            pagination: { page: 1, perPage: 10000 },
            sort: { field: 'id', order: 'DESC' },
            filter: {
                doctors: formData.id,
                insurance: scopedFormData.insurance,
                special: scopedFormData.special,
                specialPercentage: scopedFormData.specialPercentage,
                specialClientsTemplates: scopedFormData.special ? scopedFormData.clientsTemplates.id : null
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

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    const TabsNavigation = () => {
        return (
            <Tabs className='edit-navigation' value={value} onChange={handleChange} aria-label="basic tabs example">
                <Tab label="Գլխավոր" />
                <Tab label="Գումար" />
            </Tabs>
        )
    }

    const removeFromList = async (body: any) => {
        const data = await dataProvider.delete('doctorSalaries', {
            id: body.id
        })
        if (data) {
            refresh();
        }
    }

    if (isLoading) return <Loading />

    return (
        <Dialog className='create-edit-doctors' open={open}>
            <EditModal resource='Բժիշկ' id={id} validate={undefined} onSuccess={onSuccess} handleClose={handleClose}>
                <div style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center' }}>
                    <h3 style={{ margin: '5px 0 0 0' }}>Արձակուրդ</h3>
                    <div style={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        columnGap: '20px',
                    }}>
                        <DateInput onClick={() => handleClick('start')} inputProps={{ ref: inputRefStart }} disabled={permissions == 'doctor' ? true : false} label='Մեկնարկ' source='startVacation' />
                        <FormDataConsumer>
                            {({ formData }: any) => formData.startVacation &&
                                <DateInput validate={required('Պարտադիր դաշտ')} onClick={() => handleClick('end')} inputProps={{ ref: inputRefEnd }} disabled={permissions == 'doctor' ? true : false} label='Ավարտ' source='endVacation' />
                            }
                        </FormDataConsumer>
                    </div>
                </div>
                <TabsNavigation />
                <TabPanel value={value} index={0} className='not-grid'>
                    <TextInput validate={required('Պարտադիր դաշտ')} fullWidth source='name' label='Անուն' />
                    <TextInput validate={required('Պարտադիր դաշտ')} fullWidth source='shortName' label='Կարճ անուն' />
                    <PercentageInput />
                    <ColorPicker />
                    <TextInput style={{ width: 'fit-content' }} disabled validate={required('Պարտադիր դաշտ')} label='Գույն' source='color' />
                </TabPanel>
                <TabPanel value={value} index={1} className='not-grid'>
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
                        </CustomModal>}
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
                    {confirmModal &&
                        <CustomModal open={confirmModal} handleClose={() => setConfirmModal(false)} >
                            <div style={{
                                width: 'fit-content',
                                padding: '10px',
                                backgroundColor: 'white',
                                height: 'auto',
                                overflowY: 'auto',
                            }}>
                                <h3>Տվյալ ամիսը արդեն առկա է։</h3>
                                <h3>Ամփոփե՞լ նշված ամսով/օրով</h3>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <FormDataConsumer>
                                        {({
                                            formData
                                        }: any) => {
                                            formData.confirmToAddSameMonth = true;
                                            return <Button className='button-green' onClick={() => sendToSalaries(formData)} variant='contained'>Այո</Button>
                                        }}
                                    </FormDataConsumer>
                                    <Button variant='contained' className='button-red-back' onClick={() => setConfirmModal(false)}>Ոչ</Button>
                                </div>
                            </div>
                        </CustomModal>
                    }
                    <div style={{
                        width: '100%',
                        height: '100%',
                    }}>
                        <ArrayInput disabled={permissions !== 'super' ? true : false} className='doctorsEdit' label='Գումարներ' source="doctorSalaries">
                            <SimpleFormIterator disableClear disableRemove={true} disableAdd={true} disableReordering={true}>
                                <FormDataConsumer>
                                    {({ scopedFormData }: any) => {
                                        return (
                                            <div style={{
                                                display: 'flex',
                                                width: '55%',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}>
                                                {/* {permissions == 'super' ? <DeleteWithConfirmButton label='' confirmTitle='Ջնջե՞լ' confirmContent='' record={scopedFormData} className='deleteButton' resource='doctorSalaries' style={{color: 'red !important', cursor: 'pointer'}} /> : null} */}
                                                {/* {permissions == 'super' ? <RemoveIcon style={{color: 'red', cursor: 'pointer'}} onClick={() => removeFromList(scopedFormData)} /> : null} */}
                                                {scopedFormData.insurance == null ?
                                                    <p style={{ fontSize: '20px', margin: '0' }} title={scopedFormData.special ? scopedFormData.clientsTemplates.name : companyName}>{scopedFormData.special ? scopedFormData.clientsTemplates.name : companyName}</p> :
                                                    <p style={{ fontSize: '20px', margin: '0' }} title={scopedFormData.insurance.name}>{scopedFormData.insurance.name}</p>
                                                }
                                                <p style={{ fontSize: '20px', margin: '0' }}>{scopedFormData.price.toLocaleString()} դր․</p>
                                            </div>
                                        )
                                    }}
                                </FormDataConsumer>
                                <FormDataConsumer>
                                    {({
                                        scopedFormData
                                    }: any) => {
                                        let name;
                                        if (scopedFormData.insurance == null) {
                                            if (scopedFormData.special) {
                                                name = scopedFormData.clientsTemplates.name;
                                            } else {
                                                name = companyName;
                                            }
                                        }
                                        if (scopedFormData.insurance != null) {
                                            name = scopedFormData.insurance.name;
                                        }
                                        return (
                                            <CheckboxGroupInput optionText="name" style={{ width: 'fit-content' }} label='' source="checked" choices={[
                                                { id: name, name: '' },
                                            ]} />
                                        )
                                    }}
                                </FormDataConsumer>
                                <FormDataConsumer>
                                    {({
                                        scopedFormData, formData
                                    }: any) => {
                                        return <Button variant='contained' onClick={() => scopedFormData.insurance ? getCurrentInsuranceReportsForDoctor(scopedFormData.insurance, formData.id) : getCurrentReport(scopedFormData, formData)}>Տեսնել քաղվածքը</Button>
                                    }}
                                </FormDataConsumer>
                            </SimpleFormIterator>
                        </ArrayInput>
                        <p style={{ fontSize: '20px', fontWeight: 'bolder ' }}>Լաբորատորիայի արժեք</p>
                        <ArrayInput className='doctorsEdit' label='Լաբորատորիաներ' source="laboratories">
                            <SimpleFormIterator disableClear disableReordering>
                                <ReferenceInput source="laboratories" reference="laboratories">
                                    <SelectInput fullWidth style={{ width: '30%' }} label="Լաբ․" optionText="name" />
                                </ReferenceInput>
                                <NumberInput fullWidth style={{ width: '30%' }} type='tel' min={0} defaultValue={0} label='Արժեք' source="price" />
                                <TextInput validate={required('Պարտադիր դաշտ')} fullWidth multiline style={{ width: '30%' }} label='Անվանում' source="name" />
                            </SimpleFormIterator>
                        </ArrayInput>
                        <CalculateInput />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                        <FormDataConsumer>
                            {({
                                formData
                            }: any) => {
                                return <Button onClick={() => redirect('list', 'salaries', undefined, undefined, { doctorId: formData.id })} style={{ margin: '10px 0' }} variant='contained'>Աշխատավարձերի պատմություն</Button>
                            }}
                        </FormDataConsumer>
                    </div>
                </TabPanel>
                {/* {reportDates &&
                        <>
                            <FormDataConsumer>
                                {({
                                    formData
                                }) => {
                                    return (
                                        <>
                                            <CustomDateInput label='Սկիզբ' source="start" />
                                            <CustomDateInput label='Ավարտ' source="end" />
                                            {formData.start && formData.end &&
                                                <Button variant='contained' onClick={() => getReport(formData)}>Ստանալ քաղվածքը</Button>
                                            }
                                        </>
                                    )
                                }}
                            </FormDataConsumer>
                        </>
                    } */}
            </EditModal>
        </Dialog>
    );
}
