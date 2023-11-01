import {
    useRedirect,
    TextInput,
    required,
    NumberInput,
    ReferenceInput,
    AutocompleteInput,
    useRefresh,
} from 'react-admin';
import { Dialog } from '@mui/material';
import { showNotification } from '../utils/utils';
import { EditModal } from '../utils/editModal';

export const PriceListsEdit = ({ open, id }: { open: boolean; id?: string }) => {
    const redirect = useRedirect();
    const refresh = useRefresh();

    const handleClose = () => {
        redirect('/priceLists');
    };

    const onSuccess = () => {
        showNotification('Պահպանված է', '', 'success', 2000);
        refresh();
    };

    return (
        <Dialog className='create-edit' open={open}>
            <EditModal resource='Գնացուցակ' id={id} validate={undefined} onSuccess={onSuccess} handleClose={handleClose}>
                <TextInput validate={required('Պարտադիր դաշտ')} fullWidth source='name' label='Անուն' />
                <NumberInput type='tel' validate={required('Պարտադիր դաշտ')} fullWidth source='price' label='Արժեք' />
                <ReferenceInput label="Post" source="insurance" reference="insurance">
                    <AutocompleteInput fullWidth label='Ապահովագրական' optionText="name" />
                </ReferenceInput>
            </EditModal>
        </Dialog >
    );
}
