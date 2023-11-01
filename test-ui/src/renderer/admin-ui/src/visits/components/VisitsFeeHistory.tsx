import {
    required,
    NumberInput,
    SimpleFormIterator,
    ArrayInput,
    FormDataConsumer,
    useSimpleFormIteratorItem,
} from 'react-admin';
import RemoveIcon from '@mui/icons-material/RemoveCircle';
import { useFieldArray } from 'react-hook-form';
import moment from 'moment';
import CashIcon from '@mui/icons-material/LocalAtm';
import CardIcon from '@mui/icons-material/CreditCard';

import { CustomDateInput } from '../../utils/dateInput';
import { BooleanInput } from 'react-admin';

const CustomRemoveButton = ({ onClick }: any) => {
    const { index } = useSimpleFormIteratorItem();
    const { fields }: any = useFieldArray({ name: 'feeHistory' });
    return (
        <RemoveIcon
            titleAccess={fields[index].fromClinic ? 'Կլինիկայի կողմից վճարված' : fields[index].feeSentToSalary ? 'Հնարավոր չէ հեռացնել, արդեն հաշվարկված է աշխատավարձում' : fields[index].feeSentToDoctor ? 'Հնարավոր չէ հեռացնել, պետք է հետ կանչել, հեռացնելու համար' : ''}
            style={{
                cursor: 'pointer',
                color: fields[index] ? fields[index].feeSentToDoctor ? 'grey' : fields[index].fromClinic ? 'grey' : 'red' : 'red'
            }}
            onClick={fields[index] ? fields[index].feeSentToDoctor ? null : fields[index].fromClinic ? null : onClick : onClick}
        />
    )
};

export const VisitsFeeHistory = () => {
    return (
        <ArrayInput source='feeHistory' label='Վճար'>
            <SimpleFormIterator disableClear disableReordering removeButton={<CustomRemoveButton />}>
                <FormDataConsumer>
                    {({ scopedFormData, getSource }: any) => {
                        if (getSource) {
                            return (
                                getSource != null &&
                                    scopedFormData.feeSentToDoctor ?
                                    <div
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            fontSize: '20px',
                                        }}>
                                        {!scopedFormData.fromClinic &&
                                            <p title={scopedFormData.isCash ? 'Կանխիկ' : 'Անկանխիկ'} style={{ display: 'flex', alignItems: 'center' }}>{scopedFormData.isCash ? <CashIcon style={{ fill: "#1976d2" }} /> : <CardIcon />}</p>
                                        }
                                        <p>{scopedFormData.feeValue.toLocaleString()} Դր․</p>
                                        <p>{moment(scopedFormData.date).format('YYYY-MM-DD')}</p>
                                        <p style={{ color: scopedFormData.feeSentToSalary ? 'orange' : 'green', fontWeight: 'bolder' }}>
                                            {scopedFormData.feeSentToSalary ? 'Հաշվարկված է' : scopedFormData.fromClinic ? 'Կլինիկայի կողմից' : scopedFormData.feeSentToDoctor ? 'Փոխանցված է' : ''}
                                        </p>
                                    </div>
                                    :
                                    <>
                                        <NumberInput className='feeValue' defaultValue={0} type='tel' min={0} validate={required('Պարտադիր դաշտ')} fullWidth source={getSource('feeValue')} label='Վճար Դր․' />
                                        <CustomDateInput defaultValue={moment()} label='Ամսաթիվ' source={getSource('date')} />
                                        <BooleanInput title={scopedFormData.isCash ? 'Կանխիկ' : 'Անկանխիկ'} label={false} defaultValue={true} icon={<CardIcon style={{ fill: "#1976d2" }} />} checkedIcon={<CashIcon titleAccess='Կանխիկ' />} source={getSource('isCash')} />
                                    </>
                            )
                        }
                    }}
                </FormDataConsumer>
            </SimpleFormIterator>
        </ArrayInput>
    )
}