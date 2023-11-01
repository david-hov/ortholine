import {
    useRedirect,
    TextInput,
    required,
    ReferenceArrayInput,
    SelectArrayInput,
    useRefresh,
} from 'react-admin';
import { Dialog } from '@mui/material';
import { showNotification } from '../utils/utils';
import { EditModal } from '../utils/editModal';

export const RoomsEdit = ({ open, id }: { open: boolean; id?: string }) => {
    const redirect = useRedirect();
    const refresh = useRefresh();

    const handleClose = () => {
        redirect('/rooms');
    };

    const onSuccess = () => {
        showNotification('Պահպանված է', '', 'success', 2000);
        refresh();
    };

    return (
        <Dialog className='create-edit' open={open}>
            <EditModal resource='Սենյակ' id={id} validate={undefined} onSuccess={onSuccess} handleClose={handleClose}>
                <TextInput validate={required('Պարտադիր դաշտ')} fullWidth source='name' label='Անուն' />
                <ReferenceArrayInput source="doctors" reference="doctors">
                    <SelectArrayInput fullWidth label='Բժիշկներ' optionText="name" />
                </ReferenceArrayInput>
            </EditModal>
        </Dialog >
    );
}
