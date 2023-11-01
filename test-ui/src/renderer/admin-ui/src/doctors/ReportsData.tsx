import { forwardRef, useEffect, useState } from "react";
import moment from 'moment';
import { useRedirect } from "ra-core";

import { dataProvider } from "../dataProvider";
import Logo from '../../../../../assets/images/back.png'

export const ComponentToPrint = forwardRef((props: any, ref: any) => {
    const [printInfoDetails, setPrintInfoDetails] = useState<any>(null);
    const [printImage, setPrintImage] = useState<any>(null);
    const [printDirector, setPrintDirector] = useState<any>(null);
    const [companyName, setCompanyName] = useState<any>(null);
    const [totalBalance, setTotalBalance] = useState<any>(0);
    const redirect = useRedirect();
    let totalPaidPrice = 0;

    useEffect(() => {
        var table: any = document.getElementById("table");
        if (table) {
            let total = 0;
            Array.from(table.rows).slice(1).forEach((row: any) => {
                if (row.cells[4].lastChild.innerHTML) {
                    total = total + parseInt(row.cells[4].lastChild.innerHTML)
                } else {
                    total - 0
                }
            });
            setTotalBalance(total);
        }
        const getSettings = async () => {
            const { data } = await dataProvider.getList('settings', {
                pagination: { page: 1, perPage: 1000 },
                sort: { field: 'id', order: 'DESC' },
                filter: {}
            })
            if (data.length !== 0) {
                setPrintInfoDetails(data[0].printDetailsInfo);
                setPrintImage(data[0].companyImage);
                setPrintDirector(data[0].companyDirector);
                setCompanyName(data[0].companyName);
            }
        }
        getSettings();
    }, [companyName])
    return (
        <div className="print-body" ref={ref}>
            <div className="header">
                <div>
                    <img src={printImage ? printImage : Logo} />
                </div>
                <div>
                    {printInfoDetails !== null ? <div style={{ textAlign: 'right' }} dangerouslySetInnerHTML={{ __html: printInfoDetails }} /> :
                        <>
                            <p>կլինիկա</p>
                        </>
                    }
                </div>
            </div>
            <p style={{ fontWeight: 'bolder' }}>Բժիշկ՝ {props.reportData.data[0].doctors.name}</p>
            <table id="table">
                <thead>
                    <tr>
                        <th className="empty-col"></th>
                        <th className="treatment">Պացիենտ</th>
                        <th className="treatment">Ծառ. արժեք (Դր․)</th>
                        <th className="treatment">Վճ. գումար (Դր․)</th>
                        <th className="treatment">Պարտք (Դր․)</th>
                        <th className="treatment" style={{ width: '85px' }}>Ռենտգեն</th>
                        <th className="treatment">Ամս.</th>
                    </tr>
                </thead>
                <tbody>
                    {props.reportData.data.length !== 0 && props.reportData.data.map((el: any, key: number) => {
                        let paidPrice = 0;
                        paidPrice = el.feeHistory.reduce((a: any, b: any) => a + b.feeValue, 0);
                        totalPaidPrice = totalPaidPrice + paidPrice - el.xRayPrice;
                        return (
                            <tr className={el.isDeleted ? 'isDeleted' : ''} title={el.isDeleted ? 'Հեռացված է' : ''} key={key} style={{ cursor: 'pointer' }} onClick={() => {
                                !el.isDeleted && redirect(`/visits/${el.id}`)
                            }}>
                                <td className="empty-row">{key + 1}</td>
                                <td className="price-row">{el.clients !== null ? el.clients.name : ''}</td>
                                <td className="price-row">{el.price}</td>
                                <td className="price-row">{el.feeHistory.map((item: any) => <p className="report-per-fee">{item.feeValue}</p>)}</td>
                                <td className="price-row">{el.feeHistory.map((item: any) => <p className="report-per-fee">{item.currentBalance}</p>)}</td>
                                <td className="price-row">{el.xRayCount}</td>
                                <td className="price-row">{el.feeHistory.map((item: any) => <p className="report-per-fee">{moment(item.date).format("YYYY-MM-DD")}</p>)}</td>
                            </tr>
                        )
                    })}
                    <tr className="footer">
                        <td className="first-row"></td>
                        <td className="row">Ընդամենը՝</td>
                        {/* <td className="price-row first-treatment" >{props.reportData.totalVisitPriceValue}</td> */}
                        <td className="row" >{props.reportData.data.reduce((a: any, b: any) => a + b.price, 0)}</td>
                        <td className="row" >{props.reportData.totalFeeValue}</td>
                        <td className="row" >{totalBalance}</td>
                        <td className="row">{props.reportData.data.reduce((a: any, b: any) => a + b.xRayCount, 0)}</td>
                        <td className="row"></td>
                    </tr>
                </tbody>
            </table>
            <h3>Ստացված աշխատավարձ ` {(((props.reportData.totalFeeValue - props.reportData.data.reduce((a: any, b: any) => a + b.xRayPrice, 0)) * (props.reportData.special ? props.reportData.specialPercentage : props.reportData.data[0].doctors.percentage) / 100)).toLocaleString()} Դր․</h3>
            <p>Տնօրեն՝ {printDirector}</p>
        </div>
    )
});