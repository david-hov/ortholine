import { useEffect, useRef, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Button, Table, TableBody, TableCell, TableHead, TableRow, useMediaQuery } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import { useReactToPrint } from 'react-to-print';
import moment from 'moment'

import { ComponentToPrint } from './VisitsPrintData';
import { dataProvider } from '../dataProvider';
import { CustomModal } from '../utils/customModal';

export const VisitsStatistics = ({ selectedYear }: any) => {
    const [visitsData, setVisitsData] = useState<any>([]);
    const [visitsTotalData, setVisitsTotalData] = useState<any>(0);
    const [visitsInsuranceCount, setVisitsInsuranceCount] = useState<any>([]);
    const [doctorsVisitsCount, setVisitsDoctorsCount] = useState<any>([]);
    const [cashNotCash, setCashNotCash] = useState<any>([]);
    const [visitsPrices, setVisitsPrices] = useState<any>([]);
    const [openedReports, openModalReports] = useState(false);
    const [printDetails, setPrintDetails] = useState<any>(null);
    const isSmall = useMediaQuery('(max-width:800px)');
    const componentRef = useRef<any>(null);

    const COLORS = ['orange', 'green'];
    const data = [
        { name: 'Group A', value: 2 },
        { name: 'Group B', value: 10 },
    ];
    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = (props: any) => {
        const radius = props.innerRadius + (props.outerRadius - props.innerRadius) * 0.5;
        const x = props.cx + radius * Math.cos(-props.midAngle * RADIAN);
        const y = props.cy + radius * Math.sin(-props.midAngle * RADIAN);
        return (
            <text x={x} y={y} fill="black" textAnchor={x > props.cx ? 'start' : 'end'} dominantBaseline="central">
                {`${(props.percent * 100).toFixed(0)}% ${props.name}`} - {props.value}
            </text>
        );
    };

    useEffect(() => {
        const getVisits = async () => {
            const { data, total } = await dataProvider.getList('statistics/visits', {
                pagination: { page: 1, perPage: 10000 },
                sort: { field: 'id', order: 'DESC' },
                filter: { 'period': selectedYear }
            })
            setVisitsData(data);
            setVisitsTotalData(total);
        }
        getVisits();
    }, [selectedYear]);

    const openModalStatistics = async () => {
        openModalReports(true)
        const { data } = await dataProvider.getList('statistics/visits/insurance', {
            pagination: { page: 1, perPage: 10000 },
            sort: { field: 'id', order: 'DESC' },
            filter: { 'period': selectedYear }
        })

        setVisitsInsuranceCount(data[0].insuranceOrNot)
        setCashNotCash(data[0].cashNotCash);
        setVisitsDoctorsCount(data[0].doctorsVisits);
        setVisitsPrices(data[0].prices);
    }

    const closePrintModal = () => {
        setPrintDetails(null)
    }


    const handlePrint = useReactToPrint({
        content: () => componentRef?.current,
    });

    const getPrintData = async () => {
        const { data } = await dataProvider.getList('visits/printStatistics', {
            pagination: { page: 1, perPage: 1000000 },
            sort: { field: 'id', order: 'DESC' },
            filter: { startDate: moment(selectedYear).startOf('month').format(), endDate: moment(selectedYear).endOf('month').format() }
        })
        if (data.length !== 0) {
            setPrintDetails({ data });
        }
    }
    return (
        <div style={{ borderBottom: '3px solid grey' }}>
            <h3>Այցելություններ - {visitsTotalData} <Button onClick={() => openModalStatistics()} color='success' variant='contained'>Մանրամասն</Button></h3>
            <div style={{ display: 'flex' }}>
                {openedReports &&
                    <CustomModal open={openedReports} handleClose={() => openModalReports(false)} >
                        <div style={{
                            width: '90%',
                            display: 'flex',
                            flexDirection: 'column',
                            backgroundColor: 'white',
                            padding: '10px',
                            height: '90%',
                            overflowY: 'auto',
                        }}>
                            <h1 style={{ margin: 0 }}>Այցելություններ/Բժիշկներ</h1>
                            <div style={{ width: '100%', display: 'flex', flexDirection: `${isSmall ? 'column' : 'row'}`, justifyContent: 'space-between' }}>
                                <ResponsiveContainer width='100%' aspect={1}>
                                    <PieChart width={600} height={400}>
                                        <Pie
                                            data={visitsInsuranceCount}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={renderCustomizedLabel}
                                            outerRadius={150}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {data.map((entry: any, index: any) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <ResponsiveContainer width='100%' aspect={1}>
                                    <PieChart width={600} height={400}>
                                        <Pie
                                            data={doctorsVisitsCount}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={renderCustomizedLabel}
                                            outerRadius={150}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {doctorsVisitsCount.map((entry: any, index: any) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <h1 style={{ margin: 0 }}>Գումարների մուտք</h1>
                            {cashNotCash.length !== 0 &&
                                <Table style={{
                                    border: '1px solid',
                                    width: 'fit-content',
                                    marginBottom: '15px'
                                }} sx={{ minWidth: 650 }} aria-label="simple table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Վճարման Տեսակ</TableCell>
                                            <TableCell align="right">Քանակ</TableCell>
                                            <TableCell align="right">Արժեք</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {cashNotCash.map((row: any, key: number) => (
                                            <TableRow
                                                key={key}
                                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                            >
                                                <TableCell component="th" scope="row">
                                                    {row.isCash ? 'Կանխիկ' : 'Անկանխիկ'}
                                                </TableCell>
                                                <TableCell align="right">{row.count}</TableCell>
                                                <TableCell align="right">{row.value && row.value.toLocaleString()}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            }
                            {printDetails &&
                                <CustomModal open={printDetails} handleClose={() => closePrintModal()} >
                                    <div style={{
                                        width: '90%',
                                        backgroundColor: 'white',
                                        padding: '10px',
                                        height: '90%',
                                        overflowY: 'auto',
                                    }}>
                                        <Button variant='contained' onClick={() => handlePrint()}><PrintIcon /></Button>
                                        <ComponentToPrint printDetails={printDetails} ref={componentRef} />
                                    </div>
                                </CustomModal>
                            }
                            <ResponsiveContainer width='100%' aspect={1 / 0.3}>
                                <AreaChart
                                    width={500}
                                    height={400}
                                    data={visitsPrices}
                                    margin={{
                                        top: 10,
                                        right: 30,
                                        left: 0,
                                        bottom: 0,
                                    }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="total" stroke="#8884d8" fill="#8884d8" />
                                </AreaChart>
                            </ResponsiveContainer>
                            {typeof selectedYear != 'number' &&
                                <Button onClick={() => getPrintData()} variant='contained'>Ստանալ քաղվածք</Button>
                            }
                        </div>
                    </CustomModal>
                }
                <ResponsiveContainer width='100%' aspect={1 / 0.3}>
                    <AreaChart
                        width={500}
                        height={400}
                        data={visitsData}
                        margin={{
                            top: 10,
                            right: 30,
                            left: 0,
                            bottom: 0,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="total" stroke="#8884d8" fill="#8884d8" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

    );
}
