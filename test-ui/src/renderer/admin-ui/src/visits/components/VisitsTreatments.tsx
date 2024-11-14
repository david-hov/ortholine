import {
    TextInput,
    required,
    NumberInput,
    ReferenceInput,
    SelectInput,
    BooleanInput,
    ReferenceArrayInput,
    AutocompleteArrayInput,
    SimpleFormIterator,
    ArrayInput,
    FormDataConsumer,
    useSimpleFormIteratorItem,
} from 'react-admin';
import { useEffect } from 'react';
import { useWatch, useController, useFieldArray } from 'react-hook-form';
import RemoveIcon from '@mui/icons-material/RemoveCircle';

import { dataProvider } from '../../dataProvider';

const CustomRemoveButton = ({ onClick }: any) => {
    const { index } = useSimpleFormIteratorItem();
    const { fields }: any = useFieldArray({ name: 'treatments' });
    return (
        <RemoveIcon
            style={{
                cursor: 'pointer',
                color: fields[index] ? fields[index].insuranceSalarySentToDoctor ? 'grey' : 'red' : 'red'
            }}
            onClick={fields[index] ? fields[index].insuranceSalarySentToDoctor ? null : onClick : onClick}
        />
    )
};

export const VisitsTreatments = ({ permissions }: any) => {
    const treatmentInputValue = useWatch({ name: 'treatments' });
    const insuranceValue = useWatch({ name: 'insurance' });
    const treatmentAllPriceInputValue = useController({ name: 'treatmentAllPrice', defaultValue: 0 });
    const insuranceTotalPriceByDoctor = useController({ name: 'insurancePriceByDoctor' });
    const insuranceAllInputValue = useController({ name: 'insuranceAllPrice', defaultValue: 0 });
    const priceByDoctor = useController({ name: 'priceByDoctor', defaultValue: null });

    useEffect(() => {
        if (treatmentInputValue.length !== 0) {
            const insuranceAllValue = treatmentInputValue.filter((el: any) => el.insuranceForTreatment != null && el.insuranceForTreatment != '').reduce((a: any, b: any) => a + parseInt(b.insurancePriceForTreatment), 0)
            const treatmentAllValue = treatmentInputValue.filter((el: any) => el.insuranceForTreatment == null || el.insuranceForTreatment == '').reduce((a: any, b: any) => a + (b.payingPriceForTreatment !== '' ? parseInt(b.payingPriceForTreatment) : 0), 0)
            insuranceTotalPriceByDoctor.field.onChange(insuranceAllValue);
            insuranceAllInputValue.field.onChange(insuranceAllValue)
            priceByDoctor.field.onChange(treatmentAllValue);
            treatmentAllPriceInputValue.field.onChange(treatmentAllValue);
        } else {
            insuranceTotalPriceByDoctor.field.onChange(0);
            priceByDoctor.field.onChange(null);
        }
    }, [JSON.stringify(treatmentInputValue)]);

    return (
        <ArrayInput className='treatment-list' source='treatments' label='Կատարված աշխատանք'>
            <SimpleFormIterator disableClear inline disableReordering removeButton={<CustomRemoveButton />}>
                <TextInput multiline validate={required('Պարտադիր դաշտ')} source='treatmentName' label='Կատարված աշխ.' />
                <FormDataConsumer>
                    {({ formData, scopedFormData, getSource, ...rest }: any) => {
                        if (getSource) {
                            const discountForTreatmentInput = useController({ name: getSource('discountForTreatment') });
                            const insuranceAllPriceInput = useController({ name: 'insuranceAllPrice', defaultValue: 0 });
                            const insuranceAllPriceInputInputValue = useWatch({ name: 'insuranceAllPrice' });
                            const insurancePriceForTreatment = useController({ name: getSource('insurancePriceForTreatment'), defaultValue: 0 });
                            const insuranceInputValue = useWatch({ name: getSource('insuranceForTreatment'), defaultValue: null });
                            const treatmentPriceForInputValue = useWatch({ name: getSource('realPriceForTreatment'), defaultValue: 0 });
                            const treatmentPriceInput = useController({ name: getSource('payingPriceForTreatment') });
                            const change = (data: any) => {
                                let value = 0;
                                if (data == '' || data == 0) {
                                    treatmentPriceInput.field.onChange(parseInt(treatmentPriceForInputValue))
                                } else {
                                    value = parseInt(data);
                                }
                                treatmentPriceInput.field.onChange(parseInt(treatmentPriceForInputValue) - (parseInt(treatmentPriceForInputValue) * value / 100))
                            }
                            const changePrice = (e: any) => {
                                if (e.target.value == '' || e.target.value == 0) {
                                    treatmentPriceInput.field.onChange(parseInt(treatmentPriceForInputValue));
                                } else {
                                    treatmentPriceInput.field.onChange(parseInt(e.target.value));
                                }
                                discountForTreatmentInput.field.onChange(0)
                            }
                            const changeInsurancePrice = (values: any) => {
                                if (values !== null && values.length !== 0) {
                                    dataProvider.getMany('priceLists', { ids: values }).then(({ data }: any) => {
                                        const price = data.reduce((a: any, b: any) => a + b.price, 0);
                                        insuranceAllPriceInput.field.onChange(insuranceAllPriceInputInputValue + price);
                                        insurancePriceForTreatment.field.onChange(price)
                                    });
                                } else {
                                    insuranceAllPriceInput.field.onChange(insuranceAllPriceInput.field.value - insurancePriceForTreatment.field.value);
                                    insurancePriceForTreatment.field.onChange(0)
                                }
                            }

                            return (
                                <>
                                    <NumberInput  source={getSource('realPriceForTreatment')} onChange={(e: any) => changePrice(e)} type='tel' min={0} validate={required('Պարտադիր դաշտ')} label='Կատարված աշխ. արժեք' />
                                    <NumberInput  source={getSource('payingPriceForTreatment')} type='tel' min={0} {...rest} validate={required('Պարտադիր դաշտ')} label='Վճարման ենթակա գումար' />
                                    {typeof insuranceInputValue == 'string' || insuranceInputValue == null ?
                                        <NumberInput source={getSource('discountForTreatment')} onChange={(e: any) => change(e.target.value)} type='tel' min={0} max={100} validate={required('Պարտադիր դաշտ')} label='Զեղչ' /> :
                                        <>
                                            <ReferenceArrayInput validate={required('Պարտադիր դաշտ')} source={getSource('priceListsForOneTreatment')} filter={{ insurance: insuranceInputValue !== null ? insuranceInputValue.hasOwnProperty('id') ? insuranceInputValue.id : insuranceInputValue : null }} reference="priceLists">
                                                <AutocompleteArrayInput validate={required('Պարտադիր դաշտ')} clearOnBlur={false} onChange={(e: any) => changeInsurancePrice(e)} label='Աշխատանք' optionText="name" />
                                            </ReferenceArrayInput>
                                            {permissions !== 'doctor' &&
                                                <BooleanInput defaultValue={false} source={getSource('closedInsuranceStatus')} label='Դուրս գրված' />
                                            }
                                            <NumberInput style={{ display: 'none' }} source={getSource('insurancePriceForTreatment')} defaultValue={0} type='tel' />
                                        </>
                                    }
                                    {formData.insurance !== null &&
                                        <ReferenceInput defaultValue={null} filter={{ id: insuranceValue != null ? insuranceValue : null }} source={getSource('insuranceForTreatment')} label="Ապահովագրություն" reference="insurance">
                                            <SelectInput label="Ապահովագրություն" optionText="name" />
                                        </ReferenceInput>
                                    }
                                </>
                            )
                        }
                    }}
                </FormDataConsumer>
            </SimpleFormIterator>
        </ArrayInput>
    )
}