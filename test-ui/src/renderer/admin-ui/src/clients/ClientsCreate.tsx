import {
    Create,
    SimpleForm,
    useRedirect,
    useRefresh,
    TextInput,
    required,
    NumberInput,
    BooleanInput,
    ArrayInput,
    SimpleFormIterator,
    ReferenceInput,
    AutocompleteInput,
} from 'react-admin';
import { Dialog, Button } from '@mui/material';

import { useState } from 'react';
import { CustomModal } from '../utils/customModal';
import { CreateModal } from '../utils/createModal';
import { CustomDateInput } from '../utils/dateInput';

export const ClientsCreate = ({ open }: { open: boolean }) => {
    const redirect = useRedirect();
    const refresh = useRefresh();
    const [template, createTemplate] = useState(false)

    const handleClose = () => {
        redirect('/clients');
    };

    const onSuccess = (body: any) => {
        if (body.number) {
            redirect('/clients');
            refresh();
        } else {
            createTemplate(false);
            refresh();
        }
    };

    return (
        <Dialog className='create-edit guide-clients-create-modal' open={open}>
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
            <CreateModal resource='clients' onSuccess={onSuccess} handleClose={handleClose}>
                <TextInput validate={required('Պարտադիր դաշտ')} fullWidth source='name' label='Անուն Հայրանուն Ազգանուն' />
                <TextInput validate={required('Պարտադիր դաշտ')} fullWidth source='nameForClientView' label='Անուն Հայրանուն Ազգանուն (Հաճախորդի էկրանում)' />
                <TextInput validate={required('Պարտադիր դաշտ')} fullWidth source="number" label='Հեռ․' />
                <ReferenceInput source="clientsTemplates" reference="clientsTemplates">
                    <AutocompleteInput noOptionsText={<Button variant='contained' onClick={() => createTemplate(true)}>Ավելացնել ցանկում</Button>} fullWidth label='Աղբյուր' optionText='name' />
                </ReferenceInput>
                <CustomDateInput source='birthDate' label='Ծննդյան տարեթիվ' />
                <TextInput multiline fullWidth source="healthStatus" label='Առողջական վիճակ' />
                <NumberInput fullWidth type='tel' defaultValue={0} source='deposit' label='Կանխավճար' />
                <div style={{ display: 'flex' }}>
                    <BooleanInput defaultValue={false} source='orthodontia' label='Օրթոդոնտիա' />
                    <BooleanInput defaultValue={false} source='orthopedia' label='Օրթոպեդիա' />
                    <BooleanInput defaultValue={false} source='implant' label='Իմպլանտ' />
                </div>
                <ArrayInput source='extraInfo' label='Հիշեցում'>
                    <SimpleFormIterator disableReordering>
                        <TextInput validate={required('Պարտադիր դաշտ')} fullWidth multiline source='info' label='Հիշեցումներ' />
                        <CustomDateInput source='date' label='Ամսաթիվ' />
                    </SimpleFormIterator>
                </ArrayInput>
            </CreateModal>
        </Dialog>
    );
}
