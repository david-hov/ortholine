export const doctorBody = {
    name: 'John',
    visits: null,
    percentage: 10,
    sum: 0,
    color: 'red',
    shortName: 'JN',
    sumTotal: [
        { insurance: null, price: 0 }
    ]
}

export const clientBody = {
    name: 'Hasmik',
    number: '091111111',
    isFinished: true,
    notes: null,
    isWaiting: false,
    deposit: 0,
    orthodontia: false,
    diagnosis: false,
    future: [],
    healthStatus: '',
    orthopedia: false,
    implant: false,
    extraInfo: '',
}

export const visitBody = {
    clients: 1,
    doctors: 1,
    endDate: "2023-04-21T09:30:00.000Z",
    showInCalendar: true,
    startDate: "2023-04-21T07:30:00.000Z",
}

export const visitBody2 = {
    clients: 1,
    doctors: 1,
    endDate: "2023-04-25T09:30:00.000Z",
    showInCalendar: true,
    startDate: "2023-04-25T07:30:00.000Z",
}

export const visitBodyWithInsurance = {
    clients: 1,
    doctors: 1,
    insurance: 2,
    endDate: "2023-04-27T09:30:00.000Z",
    showInCalendar: true,
    startDate: "2023-04-27T07:30:00.000Z",
}

export const updatingVisit = {
    id: 1,
    clients: 1,
    lastVisitChecked: "came",
    insurance: null,
    xRayPrice: 0,
    doctors: 1,
    previousFee: 0,
    fee: 25000,
    balance: 0,
    price: 25000,
}

export const updatingVisit2 = {
    id: 2,
    clients: 1,
    lastVisitChecked: "came",
    insurance: null,
    xRayPrice: 0,
    doctors: 1,
    previousFee: 0,
    fee: 45000,
    balance: 0,
    price: 45000,
}
