import { useState } from 'react'
import { dataProvider } from '../dataProvider';
import { Box, Button, Modal } from '@mui/material'
import { ClientsStatistics } from './ClientsStatistics';
import { Form } from 'react-admin';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { VisitsStatistics } from './VisitsStatistics';
import XrayIcon from '@mui/icons-material/DocumentScanner';
import BalanceIcon from '@mui/icons-material/RequestQuote';
import moment from 'moment';
import { CustomDateInput } from '../utils/dateInput';

export const Statistics = () => {
    const [statisticsDate, setStatisticsDate] = useState<any>(new Date().getFullYear());
    const [totalBalance, setTotalBalance] = useState<any>(null);
    const [xrayCount, setXrayCount] = useState<any>(null);
    const [modal, showModal] = useState<any>(null);

    const fetchTotalBalance = async (e: any) => {
        const { data } = await dataProvider.getList('visits/balance/total', {
            pagination: { page: 1, perPage: 2 },
            sort: { field: 'id', order: 'DESC' },
            filter: { startDate: e.startDate ? moment(e.startDate).format("YYYY-MM-DD HH:mm:ss") : null, endDate: e.endDate ? moment(e.endDate).format("YYYY-MM-DD HH:mm:ss") : null }
        });
        setTotalBalance(data[0])
    };

    const fetchTotalXrayCount = async (e: any) => {
        const { data } = await dataProvider.getList('visits/xRay/total', {
            pagination: { page: 1, perPage: 2 },
            sort: { field: 'id', order: 'DESC' },
            filter: { startDate: e.startDate ? moment(e.startDate).format("YYYY-MM-DD HH:mm:ss") : null, endDate: e.endDate ? moment(e.endDate).format("YYYY-MM-DD HH:mm:ss") : null }
        });
        setXrayCount(data[0])
    };

    const openModalForVisit = (data: any) => {
        setTotalBalance(null);
        setXrayCount(null);
        if (data === 'balance') {
            showModal('balance');
        } else {
            showModal('xray');
        }
    }

    return (
        <Box>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker className='statistic-year' onChange={(e: any) => e && !Number.isNaN(e.$y) && setStatisticsDate(e.$y)} label='Տարի' views={['year']} openTo="year" />
                <DatePicker className='statistic-year' onChange={(e: any) => e && !isNaN(e.$d) && setStatisticsDate(e.$d)} label='Ամիս' views={['year', 'month']} openTo="month" />
            </LocalizationProvider>
            <Modal
                open={modal !== null ? true : false}
                onClose={() => {
                    showModal(null);
                }}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    outline: 'none',
                    width: 'auto',
                    height: 'auto',
                    padding: '10px',
                    backgroundColor: 'white'
                }}>
                    <Form onSubmit={modal === 'xray' ? fetchTotalXrayCount : fetchTotalBalance}>
                        <CustomDateInput label='Սկիզբ' source="startDate" />
                        <CustomDateInput label='Ավարտ' source="endDate" />
                        {totalBalance !== null && <p style={{ margin: '5px 0px' }}>Ընդհանուր մնացորդ - {totalBalance > 0 ? <span style={{ fontWeight: 'bolder', color: 'green' }}>{parseInt(totalBalance).toLocaleString()} Դր․</span> : 0}Դր․</p>}
                        {xrayCount !== null && <p style={{ margin: '5px 0px' }}>Ռենտգենների քանակ - {xrayCount > 0 ? <span style={{ fontWeight: 'bolder', color: 'green' }}>{parseInt(xrayCount)}</span> : 0}</p>}
                        <Button type='submit'>Ստանալ {modal === 'xray' ? 'ռենտգենների քանակը' : 'մնացորդը'} </Button>
                    </Form>
                </div>
            </Modal>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px' }}>
                <div>
                    <Button endIcon={<BalanceIcon />} variant='contained' style={{ marginTop: '5px' }} onClick={() => openModalForVisit('balance')}>Ամբողջ մնացորդը</Button>
                </div>
                <div>
                    <Button endIcon={<XrayIcon />} variant='contained' style={{ marginTop: '5px' }} onClick={() => openModalForVisit('xray')}>Ռենտգենների քանակը</Button>
                </div>
            </div>
            <ClientsStatistics selectedYear={statisticsDate} />
            <VisitsStatistics selectedYear={statisticsDate} />
        </Box>
    )
}
