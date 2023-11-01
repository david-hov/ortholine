import { useEffect, useState } from 'react'
import { dataProvider } from '../dataProvider';
import { Box } from '@mui/material'
import { Edit, Loading, SaveButton, SimpleForm, TextInput, Toolbar, usePermissions, useRefresh } from 'react-admin';
import jwt_decode from 'jwt-decode';

import { showNotification } from '../utils/utils';

export const DoctorPage = () => {
    const { permissions, isLoading } = usePermissions();
    const [doctor, setDoctor] = useState<any>(null);
    const refresh = useRefresh();
    // const [doctorSalary, setDoctorSalary] = useState<any>(null);
    // const [companyName, setCompanyName] = useState<any>('');

    const onSuccess = () => {
        showNotification('Պահպանված է', '', 'success', 2000)
        refresh();
    };

    useEffect(() => {
        // const companyNameFromStorage = localStorage.getItem('companyName');
        // if (companyNameFromStorage) {
        //     setCompanyName(companyNameFromStorage);
        // }
        if (permissions == 'doctor') {
            const doctorToken = localStorage.getItem('token');
            if (doctorToken) {
                const decodedToken: any = jwt_decode(doctorToken);
                dataProvider.getOne('users', {
                    id: decodedToken.sub
                }).then(({ data }: any) => {
                    if (data) {
                        setDoctor(data);
                        // dataProvider.getOne('doctors', {
                        //     id: data.doctors
                        // }).then(({ data }) => {
                        //     setDoctorSalary(data.sumTotal)
                        // })
                    }
                });
            }
        }
    }, [isLoading])

    if (isLoading) return <Loading />

    return (
        <Box>
            {/* <div style={{margin: '15px 0'}}>
                {doctorSalary &&
                    doctorSalary.map((item: any, key: number) => {
                        return <div key={key} className='doctor-page-salaries'>
                            <ReferenceField emptyText={companyName} source='item.insurance' reference='insurance'>
                                <TextField source='name' />
                            </ReferenceField>
                            <span> - {item.price} Դր․</span>
                        </div>
                    })
                }
            </div> */}
            {doctor &&
                <Edit resource='users' id={doctor.id} mutationMode='optimistic'
                    mutationOptions={{ onSuccess }}
                >
                    <SimpleForm toolbar={<Toolbar><SaveButton /></Toolbar>}>
                        <TextInput fullWidth source='newPassword' label='Փոխել գաղտնաբառ' />
                    </SimpleForm>
                </Edit>
            }
        </Box>
    )
}
