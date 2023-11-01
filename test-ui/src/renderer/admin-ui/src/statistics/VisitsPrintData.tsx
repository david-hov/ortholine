import { forwardRef, useEffect, useState } from "react";
import moment from 'moment'

import { dataProvider } from "../dataProvider";

export const ComponentToPrint = forwardRef((props: any, ref: any) => {
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
                    {printImage &&
                        <img src={printImage} />
                    }
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
                        <th className="treatment">Այցելու</th>
                        <th className="price">Գումար (Դր․)</th>
                        <th className="price">Ամսաթիվ</th>
                    </tr>
                </thead>
                <tbody>
                    {props.printDetails.data.length !== 0 &&
                        props.printDetails.data.map((item: any, key: number) => {
                            if (item.price != null) {
                                return (
                                    <tr key={key}>
                                        <td className="empty-row">{key + 1}</td>
                                        <td contentEditable='true' className="treatment-row">{item.clients.name}</td>
                                        <td contentEditable='true' className="price-row"><p style={{ margin: '0' }}>{item.fee}</p></td>
                                        <td contentEditable='true' className="price-row"><p key={key} style={{ margin: '0' }}>{moment(item.startDate).format("YYYY-MM-DD HH:mm")}</p></td>
                                    </tr>
                                )
                            }
                        })}
                    <tr>
                        <td style={{ borderBottom: '1px solid' }} className="price-empty-row"></td>
                        <td style={{ borderBottom: '1px solid' }} className="treatment-row bold first-treatment">Ընդամենը՝</td>
                        <td style={{ borderBottom: '1px solid' }} contentEditable='true' className="price-row first-treatment">{parseInt(props.printDetails.data.reduce((a: any, b: any) => a + b.fee, 0)).toLocaleString()}</td>
                    </tr>
                </tbody>
            </table>
            <p>Տնօրեն՝ {printDirector}</p>
        </div>
    )
});