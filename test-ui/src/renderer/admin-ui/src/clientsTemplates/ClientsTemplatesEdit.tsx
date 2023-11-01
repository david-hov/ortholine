import {
    useRedirect,
    TextInput,
    required,
    ReferenceInput,
    NumberInput,
    SelectInput,
    BooleanInput,
    usePermissions,
    Loading,
    useRefresh,
} from 'react-admin';
import { Dialog } from '@mui/material';

import { showNotification } from '../utils/utils';
import { EditModal } from '../utils/editModal';

export const ClientsTemplatesEdit = ({ open, id }: { open: boolean; id?: string }) => {
    const { isLoading, permissions } = usePermissions();
    const redirect = useRedirect();
    const refresh = useRefresh();

    const handleClose = () => {
        redirect('/clientsTemplates');
    };

    const onSuccess = () => {
        showNotification('Պահպանված է', '', 'success', 2000);
        refresh();
    };

    if (isLoading) return <Loading />

    return (
        <Dialog className='create-edit' open={open}>
            <EditModal resource='Աղբյուր' id={id} validate={undefined} onSuccess={onSuccess} handleClose={handleClose}>
                <TextInput validate={required('Պարտադիր դաշտ')} fullWidth source='name' label='Անուն' />
                <ReferenceInput source="doctors" reference="doctors">
                    <SelectInput label="Բժիշկ" fullWidth optionText='name' />
                </ReferenceInput>
                {permissions == 'super' &&
                    <NumberInput fullWidth type='tel' label='Տոկոս' source="percentage" />
                }
                {permissions == 'super' &&
                    <BooleanInput label='Հաստատել' source='confirmed' />
                }
            </EditModal>
        </Dialog >
    );
}
