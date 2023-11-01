import {
    useRedirect,
    useRefresh,
    TextInput,
    required,
    Loading,
    usePermissions,
    ArrayInput,
    SimpleFormIterator,
    ReferenceInput,
    SelectInput,
    NumberInput,
} from 'react-admin';
import { Dialog } from '@mui/material';

import { CreateModal } from '../utils/createModal';
import { CustomDateInput } from '../utils/dateInput';
import { useEffect, useState } from 'react';

export const SalariesCreate = ({ open }: { open: boolean }) => {
    const redirect = useRedirect();
    const refresh = useRefresh();
    const { isLoading, permissions } = usePermissions();
    const [companyName, setCompanyName] = useState<any>('');

    useEffect(() => {
        const companyNameFromStorage = localStorage.getItem('companyName');
        if (companyNameFromStorage) {
            setCompanyName(companyNameFromStorage);
        }
    }, [isLoading])

    const handleClose = () => {
        redirect('/salaries');
    };

    const onSuccess = () => {
        redirect('/salaries');
        refresh();
    };

    const optionRenderer = (choice: any) => {
        return choice.name;
    }

    if (isLoading) return <Loading />

    return (
        <Dialog className='create-edit' open={open}>
            <CreateModal resource='salaries' validation={undefined} onSuccess={onSuccess} handleClose={handleClose}>
                <ReferenceInput label="Բժիշկ" source="id" reference="doctors">
                    <SelectInput fullWidth validate={required('Պարտադիր դաշտ')} label="Բժիշկ" optionText="name" />
                </ReferenceInput>
                <ArrayInput disabled={permissions !== 'super' ? true : false} label='Գումարներ' source="sumTotal">
                    <SimpleFormIterator>
                        <ReferenceInput emptyText={companyName} source="insurance" reference="insurance">
                            <SelectInput fullWidth label="Աղբյուր" optionText={optionRenderer} source="name" />
                        </ReferenceInput>
                        <TextInput fullWidth label='Արժեք Դր․' source="price" />
                    </SimpleFormIterator>
                </ArrayInput>
                <NumberInput fullWidth label='Տոկոս' source="percentage" />
                <NumberInput fullWidth label='Վերջնական աշխատավարձ' source="sum" />
                <CustomDateInput label='Ամսաթիվ' source="finishedMonth" />
            </CreateModal>
        </Dialog>
    );
}
