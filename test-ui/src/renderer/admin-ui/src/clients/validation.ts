export const validateClient = (values: any) => {
    const errors: any = {};
    if (!values.name) {
        errors.name = 'ra.validation.required';
    }
    if (!values.nameForClientView) {
        errors.nameForClientView = 'ra.validation.required';
    }
    if (!values.number) {
        errors.number = 'ra.validation.required';
    }
    if (values.balanceStatus == 'dec') {
        if (values.deposit < 0) {
            errors.minus = 'Մուտքագրած գումարը մեծ է';
        }
    }
    if (values.extraInfo) {
        errors.extraInfo = values.extraInfo.map((child: any) => {
            const childErrors: any = {};
            if (child.date == null) {
                childErrors.date = 'ra.validation.required';
            }
            if (child.date == null) {
                childErrors.info = 'ra.validation.required';
            }
            return childErrors;
        });
    }
    if (values.diagnosis) {
        errors.diagnosis = values.diagnosis.map((child: any) => {
            const childErrors: any = {};
            if (child.diagnose == null) {
                childErrors.diagnose = 'ra.validation.required';
            }
            return childErrors;
        });
    }
    if (values.future) {
        errors.future = values.future.map((child: any) => {
            const childErrors: any = {};
            if (!child || !child.text) {
                childErrors.text = 'ra.validation.required';
            }
            return childErrors;
        });
    }
    return errors;
};