import { useEffect, useState } from 'react';

import { dataProvider } from '../dataProvider';
import Logo from '../../../../../assets/images/back.png'

export const Dashboard = () => {
    const [image, setImage] = useState(null);
    useEffect(() => {
        const getImage = async () => {
            const { data } = await dataProvider.getList('settings', {
                filter: {},
                pagination: { page: 1, perPage: 10000 },
                sort: { field: 'id', order: 'DESC' },
            })
            if (data.length !== 0) {
                localStorage.setItem('image', data[0].companyImage);
                localStorage.setItem('companyName', data[0].companyName);
                setImage(data[0].companyImage)
            }
        }
        getImage();
    }, []);

    return (
        <div className='dashboard' style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: 'calc(100vh - 72px)',
            width: 'fit-content',
            margin: '0 auto',
            padding: '20px'
        }}>
            <img style={{
                objectFit: 'contain',
                width: '90%',
                height: '90%',
            }} src={image ? image : Logo} />
        </div>
    );
};
