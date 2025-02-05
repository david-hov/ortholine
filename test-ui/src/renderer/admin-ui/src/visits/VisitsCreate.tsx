import {
    useRedirect,
    useRefresh,
    required,
    ReferenceInput,
    SelectInput,
    DateTimeInput,
    AutocompleteInput,
    TextInput,
    Create,
    SimpleForm,
    FormDataConsumer,
} from 'react-admin';
import { Button, Dialog } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { useController } from 'react-hook-form';
import moment from 'moment';

import { CreateModal } from '../utils/createModal';
import { useEffect, useRef, useState } from 'react';
import { dataProvider } from '../dataProvider';
import { CustomModal } from '../utils/customModal';
import Logo from '../../../../../assets/images/back.png'

export const VisitsCreate = ({ open, id, permissions }: { open: boolean, id?: string, permissions: string }) => {
    const location = useLocation();
    const redirect = useRedirect();
    const refresh = useRefresh();
    const [client, createClient] = useState(false)
    const [modal, setModal] = useState(false)
    const inputRefStart = useRef<any>(null);
    const inputRefEnd = useRef<any>(null);
    const [image, setImage] = useState<any>(null);

    const handleClick = (type: any) => {
        if (type == 'start') {
            if (inputRefStart.current === null) return;
            inputRefStart.current.showPicker();
        } else {
            if (inputRefEnd.current === null) return;
            inputRefEnd.current.showPicker();
        }
    };

    const handleClose = () => {
        redirect(`/visits`);
    };

    useEffect(() => {
        const imageData = localStorage.getItem('image');
        if (imageData != 'null') {
            setImage(imageData);
        }
    }, [])

    const onSuccess = (body: any) => {
        if (body.number) {
            createClient(false);
        } else if (location.state.hasOwnProperty('startDate')) {
            redirect(`/calendar`);
        } else {
            redirect(`/visits`);
        }
        refresh();
    };

    const changeDoctor = async (event: any, startDate: any) => {
        if (event && (startDate != null && startDate.length != 0)) {
            const { data } = await dataProvider.getList('doctors/available', {
                pagination: { page: 1, perPage: 2 },
                sort: { field: 'id', order: 'DESC' },
                filter: { id: event.target.value, startDate: startDate }
            })
            if (data) {
                setModal(true);
            } else {
                setModal(false);
            }
        }
    }

    const changeEndDate = (formData: any, endDate: any, startDateInput: any) => {
        if (moment(endDate).isBefore(moment(formData.startDate))) {
            startDateInput.onChange(null);
            alert('Մեկնարկը առաջ է ավարտից')
        }
    }

    const change = async (formData: any, startDate: any, endDateInput: any) => {
        if (formData && (startDate != null && startDate.length != 0)) {
            if (moment(startDate).isAfter(moment(formData.endDate)) && formData.endDate) {
                endDateInput.onChange(null);
                alert('Մեկնարկը առաջ է ավարտից')
            }
            const { data } = await dataProvider.getList('doctors/available', {
                pagination: { page: 1, perPage: 2 },
                sort: { field: 'id', order: 'DESC' },
                filter: { id: formData.doctors, startDate: startDate }
            })
            if (data) {
                setModal(true);
            } else {
                setModal(false);
            }
        }
    }

    const optionRenderer = (choice: any) => `${choice.name}`;
    return (
        <Dialog className='create-edit guide-visits-create-modal' open={open}>
            {client &&
                <Create
                    resource='clients'
                    mutationOptions={{ onSuccess }}
                    sx={{ width: 500, '& .RaCreate-main': { mt: 0 } }}
                >
                    <CustomModal open={client} handleClose={() => createClient(false)} >
                        <div style={{
                            width: '600px',
                            backgroundColor: 'white',
                            padding: '10px',
                            height: 'auto',
                        }}>
                            <SimpleForm>
                                <TextInput validate={required('Պարտադիր դաշտ')} fullWidth source='name' label='Անուն Հայրանուն Ազգանուն' />
                                <TextInput validate={required('Պարտադիր դաշտ')} fullWidth source='nameForClientView' label='Անուն (Հաճախորդի էկրանում)' />
                                <TextInput validate={required('Պարտադիր դաշտ')} fullWidth source="number" label='Հեռ․' />
                            </SimpleForm>
                        </div>
                    </CustomModal>
                </Create>
            }
            <CreateModal resource='visits' validation={undefined} onSuccess={onSuccess} handleClose={handleClose}>
                <div style={{
                    display: 'flex',
                    width: '100%',
                    height: '100%',
                    alignItems: 'center',
                }}>
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
                    <div style={{ flex: '1' }}>
                        <FormDataConsumer>
                            {({ formData }: any) =>
                                <ReferenceInput fullWidth label="Բժիշկ" source="doctors" reference="doctors">
                                    <SelectInput onChange={(e: any) => changeDoctor(e, formData.startDate)} validate={required('Պարտադիր դաշտ')} fullWidth label="Բժիշկ" optionText={optionRenderer} />
                                </ReferenceInput>}
                        </FormDataConsumer>
                        <ReferenceInput source="clients" reference="clients">
                            <AutocompleteInput noOptionsText={<Button variant='contained' onClick={() => createClient(true)}>Ավելացնել ցանկում</Button>} validate={required('Պարտադիր դաշտ')} fullWidth label="Պացիենտ" optionText={optionRenderer} />
                        </ReferenceInput>
                        <FormDataConsumer>
                            {({ formData }: any) => {
                                const startDateInput = useController({ name: 'startDate' });
                                const endDateInput = useController({ name: 'endDate' });
                                return <>
                                    <DateTimeInput onChange={(e: any) => change(formData, e.target.value, endDateInput.field)} onClick={() => handleClick('start')} inputProps={{ ref: inputRefStart }} validate={required('Պարտադիր դաշտ')} fullWidth label='Մեկնարկ' defaultValue={location.state.startDate} source='startDate' />
                                    <DateTimeInput onClick={() => handleClick('end')} inputProps={{ ref: inputRefEnd }} onChange={(e) => changeEndDate(formData, e.target.value, startDateInput.field)} validate={required('Պարտադիր դաշտ')} fullWidth label='Ավարտ' defaultValue={location.state.endDate} source='endDate' />
                                </>
                            }}
                        </FormDataConsumer>
                        <ReferenceInput fullWidth label="Ապահովագրություն" source="insurance" reference="insurance">
                            <SelectInput fullWidth label="Ապահովագրություն" optionText="name" />
                        </ReferenceInput>
                        <TextInput source='info' fullWidth label='Նշումներ' />
                    </div>
                    <div style={{ display: 'flex', flex: '1', justifyContent: 'center', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                            <img style={{
                                objectFit: 'contain',
                                width: '50%',
                                height: '50%',
                            }} src={image ? image : Logo} />
                        </div>
                    </div>
                </div>
            </CreateModal>
        </Dialog>
    );
}