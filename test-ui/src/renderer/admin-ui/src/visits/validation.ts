export const validateVisitsCreation = ({ values, permissions }: any) => {
    const errors: any = {};
    if (values.doctors == null) {
        errors.doctors = 'ra.validation.required';
    }
    if (values.clients == null) {
        errors.clients = 'ra.validation.required';
    }
    if (values.startDate == null) {
        errors.startDate = 'ra.validation.required';
    }
    if (values.endDate == null) {
        errors.endDate = 'ra.validation.required';
    }
    if (values.treatments) {
    }
    if (!values.treatments || !values.treatments.length) {
        errors.treatments = 'ra.validation.required';
    } else {
        if (values.treatments.length === 0) {
            errors.treatments = 'ra.validation.required';
        }
        errors.treatments = values.treatments.map((child: any) => {
            const childErrors: any = {};
            if (child.treatmentName == null || child.treatmentName == '') {
                childErrors.treatmentName = 'ra.validation.required';
            }
            if ((child.realPriceForTreatment == null || child.realPriceForTreatment == '') && child.realPriceForTreatment !== 0) {
                childErrors.realPriceForTreatment = 'ra.validation.required';
            }
            if (child.realPriceForTreatment == null) {
                childErrors.realPriceForTreatment = 'ra.validation.required';
            }
            if ((child.payingPriceForTreatment == null || child.payingPriceForTreatment == '') && child.payingPriceForTreatment !== 0) {
                childErrors.payingPriceForTreatment = 'ra.validation.required';
            }
            if (child.insuranceForTreatment) {
                if ((child.priceListsForOneTreatment == null || child.priceListsForOneTreatment == '') && child.priceListsForOneTreatment && child.priceListsForOneTreatment.length == 0) {
                    childErrors.priceListsForOneTreatment = 'ra.validation.required';
                }
            }
            if ((child.payingPriceForTreatment == null || child.payingPriceForTreatment == '') && child.payingPriceForTreatment !== 0) {
                childErrors.payingPriceForTreatment = 'ra.validation.required';
            }
            if (typeof child.insuranceForTreatment != 'number' && ((child.discountForTreatment == null || child.discountForTreatment == '') && child.discountForTreatment !== 0)) {
                childErrors.discountForTreatment = 'ra.validation.required';
            }
            return childErrors;
        });
    }
    if (values.price == null && values.lastVisitChecked == 'came') {
        errors.price = 'ra.validation.required';
    }
    if (values.xRayCount == null && values.lastVisitChecked == 'came') {
        errors.xRayCount = 'ra.validation.required';
    }
    if (values.feeHistory && values.feeHistory.length !== 0) {
        const allFee = values.feeHistory.reduce((a: any, b: any) => a + b.feeValue, 0)
        errors.feeHistory = values.feeHistory.map((child: any) => {
            const childErrors: any = {};
            if (child.feeValue == null) {
                childErrors.feeValue = 'ra.validation.required';
            }
            if (allFee > values.price) {
                childErrors.feeHistory = 'ra.validation.required';
            }
            return childErrors;
        });
    }
    if (permissions == 'administration' || permissions == 'super') {
        delete errors.treatments
    }
    if (permissions == 'doctor') {
        delete errors.xRayCount;
        delete errors.price;
    }
    if (permissions == 'doctor' && values.xRayCountByDoctor == null && values.lastVisitChecked == 'came') {
        errors.xRayCountByDoctor = 'ra.validation.required';
    }
    return errors;
};