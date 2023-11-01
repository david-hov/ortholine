import { forwardRef, useEffect, useState } from "react";
import { useRedirect } from "ra-core";

import { dataProvider } from "../dataProvider";
import Logo from '../../../../../assets/images/back.png'

export const InsuranceComponentToPrint = forwardRef((props: any, ref: any) => {
    const [printInfoDetails, setPrintInfoDetails] = useState<any>(null);
    const [printImage, setPrintImage] = useState<any>(null);
    const [printDirector, setPrintDirector] = useState<any>(null);
    const [companyName, setCompanyName] = useState<any>(null);
    const redirect = useRedirect();
    let totalPaidPrice = 0;

    useEffect(() => {
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
    }, [companyName]);
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
                        <th className="treatment">Վճ. գումար (Դր․)</th>
                        <th className="treatment">ԱՊՊԱ</th>
                        {/* <th className="treatment">Ամս.</th> */}
                    </tr>
                </thead>
                <tbody>
                    {props.reportData.data.length !== 0 && props.reportData.data.map((el: any, key: number) => {
                        // let servicePrice = 0;
                        let paidPrice = 0;
                        // servicePrice = el.price - el.xRayPrice
                        if (el.insurance !== null) {
                            paidPrice = el.treatments.reduce((a: any, b: any) => a + b.insurancePriceForTreatment, 0);
                        } else {
                            paidPrice = el.feeHistory.reduce((a: any, b: any) => a + b.feeValue, 0);
                        }
                        totalPaidPrice = totalPaidPrice + paidPrice - el.xRayPrice;
                        return (
                            <tr key={key} style={{ cursor: 'pointer' }} onClick={() => {
                                !el.isDeleted && redirect(`/visits/${el.id}`)
                            }}>
                                <td className="empty-row">{key + 1}</td>
                                <td className="price-row">{el.clients !== null ? el.clients.name : ''}</td>
                                <td className="price-row">{el.treatments.map((item: any) => <p className="report-per-fee">{item.insurancePriceForTreatment - (parseInt(item.insurancePriceForTreatment) * el.insurance.percentage) / 100}</p>)}</td>
                                <td className="price-row">{el.insurance !== null ? el.insurance.name : ''}</td>
                            </tr>
                        )
                    })}
                    <tr className="footer">
                        <td className="first-row"></td>
                        <td className="row">Ընդամենը՝</td>
                        <td className="row" >{props.reportData.realTotalInsuranceValue}</td>
                        <td className="row" ></td>
                    </tr>
                </tbody>
            </table>
            <h3>Ստացված աշխատավարձ ` {props.reportData.totalInsuranceValue.toLocaleString()} Դր․</h3>
            <p>Տնօրեն՝ {printDirector}</p>
        </div>
    )
});