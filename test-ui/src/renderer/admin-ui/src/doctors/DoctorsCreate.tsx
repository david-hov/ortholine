import {
    useRedirect,
    useRefresh,
    TextInput,
    required,
    NumberInput,
} from 'react-admin';
import { Dialog } from '@mui/material';
import { useWatch, useController } from 'react-hook-form';

// @ts-ignore
import { SketchPicker } from 'react-color'
import { useState } from 'react';
import { CreateModal } from '../utils/createModal';

export const DoctorsCreate = ({ open }: { open: boolean }) => {
    const redirect = useRedirect();
    const refresh = useRefresh();

    const handleClose = () => {
        redirect('/doctors');
    };

    const onSuccess = () => {
        redirect('/doctors');
        refresh();
    };

    const PercentageInput = (props: any) => {
        const sumTotal = useWatch({ name: 'sumTotal' });
        const sum = useController({ name: 'sum' });
        const change = (e: any) => {
            let value;
            if (e.target.value > 0) {
                value = sumTotal - (sumTotal - Math.round((sumTotal * e.target.value) / 100));
            } else {
                value = sumTotal;
            }
            sum.field.onChange(value);
        }
        return (
            <NumberInput fullWidth type='tel' defaultValue={0} validate={required('Պարտադիր դաշտ')} onChange={(e: any) => change(e)} label='Բժշկի Տոկոս' source='percentage' />
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
            color={sketchPickerColor}
        />
    }

    return (
        <Dialog className='create-edit guide-doctors-create-modal' open={open}>
            <CreateModal resource='doctors' validation={undefined} onSuccess={onSuccess} handleClose={handleClose}>
                <div style={{
                    width: '100%',
                    height: '100%',
                }}>
                    <TextInput validate={required('Պարտադիր դաշտ')} fullWidth source='name' label='Անուն Ազգանուն Հայրանուն' />
                    <TextInput validate={required('Պարտադիր դաշտ')} fullWidth source='shortName' label='Կարճ անուն' />
                    <PercentageInput />
                <ColorPicker />
                <TextInput disabled validate={required('Պարտադիր դաշտ')} label='Գույն' source='color' />
                </div>
            </CreateModal>
        </Dialog>
    );
}
