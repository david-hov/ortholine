import { forwardRef, useEffect, useState } from "react";

import { dataProvider } from "../dataProvider";
import Logo from '../../../../../assets/images/back.png'

export const ComponentToPrint = forwardRef((props: any, ref: any) => {
    const [printData, setPrintData] = useState<any>(null);
    const [printInfoDetails, setPrintInfoDetails] = useState<any>(null);
    const [printImage, setPrintImage] = useState<any>(null);
    const [printDirector, setPrintDirector] = useState<any>(null);
    const [clientBalance, setClientBalance] = useState<any>(0);
    const [clientDeposit, setClientDeposit] = useState<any>(0);

    useEffect(() => {
        const localData = localStorage.getItem('printInfo');
        if (localData) {
            setPrintData(JSON.parse(localData || '{}'));
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
            }
        }
        getSettings();
        const getClientsData = async () => {
            const { data } = await dataProvider.getOne('clients', {
                id: props.printDetails.data.data[0].clients
            })
            if (data) {
                setClientDeposit(data.deposit);
                setClientBalance(data.balance);
            }
        }
        getClientsData();
    }, [])

    return (
        <div className="print-body" ref={ref}>
            <div className="header">
                <div>
                    <img src={printImage ? printImage : Logo} />
                </div>
                <div>
                    {printInfoDetails !== null ? <div style={{textAlign: 'right'}} dangerouslySetInnerHTML={{__html: printInfoDetails}} />  :
                        <>
                            <p>կլինիկա</p>
                        </>
                    }
                </div>
            </div>
            <p style={{ fontWeight: 'bolder' }}>Պացիենտ՝ {props.printDetails.name !== null ? props.printDetails.name : ''}</p>
            <table>
                <thead>
                    <tr>
                        <th className="empty-col"></th>
                        <th className="treatment">Կատարված աշխատանքներ</th>
                        <th className="treatment">ԱՊՊԱ</th>
                        <th className="price">Արժեքներ (Դր․)</th>
                    </tr>
                </thead>
                <tbody>
                    {props.printDetails.data.data.length !== 0 &&
                        props.printDetails.data.data.map((item: any, key: number) => {
                            if (item.price != null) {
                                return (
                                    <tr key={key}>
                                        <td className="empty-row">{key + 1}</td>
                                        <td contentEditable='true' className="treatment-row">{item.treatments.length !== 0 ? item.treatments.map((el: any, key: number) => <p key={key} style={{ margin: '0' }}>{key + 1}. {el.treatmentName}</p>) : '-'}</td>
                                        <td contentEditable='true' className="price-row"><p style={{ margin: '0' }}>{item.insurance != null ? item.insurance.name : '-'}</p></td>
                                        <td contentEditable='true' className="price-row"><p key={key} style={{ margin: '0' }}>{item.treatments.length !== 0 ? item.treatments.map((el: any, key: number) => <p key={key} style={{ margin: '0' }}>{key + 1}. {el.insuranceForTreatment != null ? item.insurance.name + ' - ' + el.payingPriceForTreatment : el.payingPriceForTreatment}</p>) : '-'}</p></td>
                                    </tr>
                                )
                            }
                        })}
                    <tr>
                        <td className="price-empty-row"></td>
                        <td className="treatment-row bold first-treatment">Ռենտգեններ`</td>
                        <td contentEditable='true' className="price-row first-treatment">{props.printDetails.data.prices['Ռենտգեններ'].includes('null') ? '-' : props.printDetails.data.prices['Ռենտգեններ']}</td>
                    </tr>
                    <tr>
                        <td className="price-empty-row"></td>
                        <td className="treatment-row bold first-treatment">Ընդամենը՝</td>
                        <td contentEditable='true' className="price-row first-treatment">{parseInt(props.printDetails.data.prices['Ընդամենը']).toLocaleString()}</td>
                    </tr>
                    {printData && printData.length !== 0 && printData.map((item: any, key: any) =>
                        <tr key={key} className="add-text">
                            <td></td>
                            <td>{item.text}</td>
                            <td></td>
                        </tr>
                    )}
                    <tr>
                        <td className="price-empty-row"></td>
                        <td className="treatment-row bold">Վճարման ենթակա է՝</td>
                        <td contentEditable='true' className="price-row">{parseInt(props.printDetails.data.prices['Վճարման ենթ․']).toLocaleString()}</td>
                    </tr>
                    <tr>
                        <td className="price-empty-row"></td>
                        <td className="treatment-row bold">Վճարված է`</td>
                        <td contentEditable='true' className="price-row">{parseInt(props.printDetails.data.prices['Վճարված է']).toLocaleString()}</td>
                    </tr>
                    <tr>
                        <td className="price-empty-row"></td>
                        <td className="treatment-row bold">Ընդհանուր մնացորդ`</td>
                        <td contentEditable='true' className="price-row">{clientBalance && clientBalance.toLocaleString()}</td>
                    </tr>
                    <tr>
                        <td className="price-empty-row"></td>
                        <td className="treatment-row bold">Ընդհանուր կանխավճար`</td>
                        <td contentEditable='true' className="price-row">{clientDeposit && clientDeposit.toLocaleString()}</td>
                    </tr>
                </tbody>
            </table>
            <p>Տնօրեն՝ {printDirector}</p>
        </div>
    )
});