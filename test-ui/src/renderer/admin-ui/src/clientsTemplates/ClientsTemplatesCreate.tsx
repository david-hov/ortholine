import {
    useRedirect,
    useRefresh,
    TextInput,
    required,
    NumberInput,
    ReferenceInput,
    SelectInput,
    BooleanInput,
    usePermissions,
    Loading,
    FormDataConsumer,
} from 'react-admin';
import { Dialog } from '@mui/material';

import { CreateModal } from '../utils/createModal';

export const ClientsTemplatesCreate = ({ open }: { open: boolean }) => {
    const { isLoading, permissions } = usePermissions();
    const redirect = useRedirect();
    const refresh = useRefresh();

    const handleClose = () => {
        redirect('/clientsTemplates');
    };

    const onSuccess = () => {
        redirect('/clientsTemplates');
        refresh();
    };

    if (isLoading) return <Loading />

    return (
        <Dialog className='create-edit guide-clientsTemplates-create-modal' open={open}>
            <CreateModal resource='clientsTemplates' validation={undefined} onSuccess={onSuccess} handleClose={handleClose}>
                <div style={{ width: '100%', height: '100%' }}>
                    <TextInput validate={required('Պարտադիր դաշտ')} fullWidth source='name' label='Անուն' />
                    <ReferenceInput source="doctors" reference="doctors">
                        <SelectInput label="Բժիշկ" fullWidth optionText='name' />
                    </ReferenceInput>
                    <FormDataConsumer>
                        {({ formData, ...rest }) => formData.doctors &&
                            <>
                                {permissions == 'super' &&
                                    <NumberInput validate={required('Պարտադիր դաշտ')} fullWidth type='tel' label='Տոկոս' source="percentage" />
                                }
                                {permissions == 'super' &&
                                    <BooleanInput label='Հաստատել' source='confirmed' />
                                }
                            </>
                        }
                    </FormDataConsumer>
                </div>
            </CreateModal>
        </Dialog>
    );
}
