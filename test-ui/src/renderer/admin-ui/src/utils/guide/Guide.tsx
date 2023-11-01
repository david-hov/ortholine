import { useContext } from 'react'
import GuideIcon from '@mui/icons-material/MenuBook';
import { ShepherdTour, ShepherdTourContext } from 'react-shepherd'
import "shepherd.js/dist/css/shepherd.css";
import { useRedirect } from 'ra-core';

import { steps } from './steps'

const tourOptions = {
    defaultStepOptions: {
        cancelIcon: {
            enabled: true
        }
    },
    useModalOverlay: true
};



export const StartTour = () => {
    const redirect = useRedirect();
    const Button = () => {
        const tour = useContext(ShepherdTourContext);
        return (
            <GuideIcon fontSize='large' style={{ cursor: 'pointer', color: '#ee5e00' }} onClick={tour?.start} />
        );
    }
    return (
        <div>
            <p style={{
                position: 'absolute',
                bottom: '0',
                width: '100%',
                right: '0',
                textAlign: 'right',
            }}>
                {/* @ts-ignore */}
                <ShepherdTour steps={steps(redirect)} tourOptions={tourOptions}>
                    <Button />
                </ShepherdTour>
            </p>
        </div>
    )
}