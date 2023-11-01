import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { dataProvider } from '../dataProvider';
import { Button } from '@mui/material';
import { CustomModal } from '../utils/customModal';

export const ClientsStatistics = ({ selectedYear }: any) => {
    const [clientsData, setClientsData] = useState<any>([]);
    const [clientsTotalData, setClientsTotalData] = useState<any>(0);
    const [clientsBalanceCount, setClientsBalanceCount] = useState<any>([]);
    const [clientsCategoryCount, setClientsCategory] = useState<any>([]);
    const [openedReports, openModalReports] = useState(false);

    const COLORS = ['red', 'green'];
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
        const getClients = async () => {
            const { data, total } = await dataProvider.getList('statistics/clients', {
                pagination: { page: 1, perPage: 10000 },
                sort: { field: 'id', order: 'DESC' },
                filter: { 'period': selectedYear }
            })
            setClientsData(data);
            setClientsTotalData(total);
        }
        getClients();
    }, [selectedYear]);

    const openModalStatistics = async () => {
        openModalReports(true)
        const { data } = await dataProvider.getList('statistics/clients/balance', {
            pagination: { page: 1, perPage: 10000 },
            sort: { field: 'id', order: 'DESC' },
            filter: { 'period': selectedYear }
        })
        setClientsBalanceCount(data[0].balance);
        setClientsCategory(data[0].clientCategory);
    }

    return (
        <div style={{ borderBottom: '3px solid grey' }}>
            <h3>Հաճախորդներ - {clientsTotalData} <Button onClick={() => openModalStatistics()} color='success' variant='contained'>Մանրամասն</Button></h3>
            <div style={{ display: 'flex' }}>
                {openedReports &&
                    <CustomModal open={openedReports} handleClose={() => openModalReports(false)} >
                        <div style={{
                            width: '90%',
                            display: 'flex',
                            justifyContent: 'space-between',
                            backgroundColor: 'white',
                            padding: '10px',
                            height: '90%',
                            overflowY: 'auto',
                        }}>
                            <ResponsiveContainer width='100%' aspect={1}>
                                <PieChart width={600} height={400}>
                                    <Pie
                                        data={clientsBalanceCount}
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
                                        data={clientsCategoryCount}
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
                        </div>
                    </CustomModal>
                }
                <ResponsiveContainer width='100%' aspect={1 / 0.3}>
                    <AreaChart
                        width={500}
                        height={400}
                        data={clientsData}
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
