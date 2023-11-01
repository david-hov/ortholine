import { forwardRef, useEffect, useState } from "react";

import { dataProvider } from "../dataProvider";
import Logo from '../../../../../assets/images/back.png'

export const ComponentToPrintLabs = forwardRef((props: any, ref: any) => {
    let totalPrice = 0;
    const [printInfoDetails, setPrintInfoDetails] = useState<any>(null);
    const [printImage, setPrintImage] = useState<any>(null);
    const [printDirector, setPrintDirector] = useState<any>(null);
    const [companyName, setCompanyName] = useState<any>(null);

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
            <table>
                <thead>
                    <tr>
                        <th className="empty-col"></th>
                        <th className="treatment">Լաբորատորիա</th>
                        <th className="treatment">Անվանում</th>
                        <th className="price">Գումար (Դր․)</th>
                    </tr>
                </thead>
                <tbody>
                    {props.reportData.length !== 0 && props.reportData.map((el: any, key: number) => {
                        totalPrice = totalPrice + el.price;
                        return (
                            <tr key={key}>
                                <td className="empty-row">{key + 1}</td>
                                <td className="treatment-row">{el.laboratories}</td>
                                <td className="treatment-row">{el.name}</td>
                                <td className="price-row">{el.price.toLocaleString()} Դր․</td>
                            </tr>
                        )
                    })}
                    <tr className="footer">
                        <td className="first-row"></td>
                        <td className="row">Ընդամենը՝</td>
                        <td className="row"></td>
                        <td className="row" >{totalPrice.toLocaleString()}</td>
                    </tr>
                </tbody>
            </table>
            <p>Տնօրեն՝ {printDirector}</p>
        </div>
    )
});