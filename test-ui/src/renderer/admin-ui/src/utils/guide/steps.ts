
export const steps = (redirect: any) => {
    const infoForStep = (
        attachClass: any,
        attachPos: any,
        advanceOn: any = {},
        promiseFunc: any = function () { },
        text: any) => {
        return {
            id: 'intro',
            attachTo: { element: attachClass, on: attachPos },
            advanceOn: advanceOn,
            beforeShowPromise: promiseFunc,
            buttons: [
                {
                    classes: 'shepherd-button-secondary',
                    text: 'Փակել',
                    type: 'cancel'
                },
                {
                    classes: 'shepherd-button-primary',
                    text: 'Հետ',
                    type: 'back'
                }
                // {
                //     classes: 'shepherd-button-primary',
                //     text: 'Առաջ',
                //     type: 'next'
                // }
            ],
            classes: 'custom-class-name-1 custom-class-name-2',
            highlightClass: 'highlight',
            scrollTo: false,
            cancelIcon: {
                enabled: true,
            },
            text: [text],
            when: {
                show: () => { },
                hide: () => { }
            }
        }
    }
    return [
        {
            id: 'intro',
            attachTo: { element: '.dashboard', on: 'bottom' },
            beforeShowPromise: function () {
                return new Promise<void>(function (resolve) {
                    setTimeout(function () {
                        window.scrollTo(0, 0);
                        resolve();
                    }, 500);
                });
            },
            buttons: [
                {
                    classes: 'shepherd-button-secondary',
                    text: 'Փակել',
                    type: 'cancel'
                },
                {
                    classes: 'shepherd-button-primary',
                    text: 'Առաջ',
                    type: 'next'
                }
            ],
            classes: 'custom-class-name-1 custom-class-name-2',
            highlightClass: 'highlight',
            scrollTo: false,
            cancelIcon: {
                enabled: true,
            },
            text: ['Բարի գալուստ Dainty օգտվողի ձեռնարկ'],
            when: {
                show: () => { },
                hide: () => { }
            }
        },

        infoForStep(
            '.guide-doctors',
            'bottom',
            { selector: '.guide-doctors', event: 'click' },
            null,
            'Համակարգ բժիշկ ներմուծելու համար օգտվում ենք «Բժիշկներ» ներդիրից'
        ),
        infoForStep(
            '.guide-doctors-create',
            'bottom',
            { selector: '.guide-doctors-create', event: 'click' },
            function () {
                return new Promise<void>(function (resolve) {
                    redirect('/doctors')
                    setTimeout(function () {
                        resolve();
                    }, 200);
                });
            },
            'Սեղմում ենք «Ստեղծել»'
        ),
        infoForStep(
            '.guide-doctors-create-modal',
            'top',
            { selector: '.guide-create-modal-button', event: 'click' },
            function () {
                return new Promise<void>(function (resolve) {
                    redirect('/doctors/create')
                    setTimeout(function () {
                        resolve();
                    }, 200);
                });
            },
            'Լրացնում ենք բժշկի մասին տեղեկատվությունը և պահպանում։ Աստղանիշով նշված դաշտերը պարտադիր են լրացման համար։'
        ),
        infoForStep(
            '.guide-clients',
            'bottom',
            { selector: '.guide-clients', event: 'click' },
            null,
            'Պացիենտի անկետա ավելացնելու համար օգտվում ենք «Անկետաներ» ներդիրից'
        ),
        infoForStep(
            '.guide-clients-create',
            'bottom',
            { selector: '.guide-clients-create', event: 'click' },
            function () {
                return new Promise<void>(function (resolve) {
                    redirect('/clients')
                    setTimeout(function () {
                        resolve();
                    }, 200);
                });
            },
            'Սեղմում ենք «Ստեղծել»'
        ),
        infoForStep(
            '.guide-clients-create-modal',
            'top',
            { selector: '.guide-create-modal-button', event: 'click' },
            function () {
                redirect('/clients/create')
                return new Promise<void>(function (resolve) {
                    setTimeout(function () {
                        resolve();
                    }, 200);
                });
            },
            'Լրացնում ենք պացիենտի մասին տեղեկատվությունը և պահպանում։ Աստղանիշով նշված դաշտերը պարտադիր են լրացման համար։'
        ),
        infoForStep(
            '.guide-calendar',
            'bottom',
            { selector: '.guide-calendar', event: 'click' },
            null,
            'Այցելություն գրանցելու համար օգտվում ենք «Օրացույց» ներդիրից'
        ),
        {
            id: 'intro',
            attachTo: { element: 'rbc-toolbar-label', on: 'top' },
            advanceOn: { selector: '.rbc-time-slot', event: 'click' },
            beforeShowPromise: function () {
                return new Promise<void>(function (resolve) {
                    redirect('/calendar')
                    setTimeout(function () {
                        resolve();
                    }, 200);
                });
            },
            buttons: [
                {
                    classes: 'shepherd-button-secondary',
                    text: 'Փակել',
                    type: 'cancel'
                },
                {
                    classes: 'shepherd-button-primary',
                    text: 'Առաջ',
                    type: 'next'
                }
            ],
            classes: 'custom-class-name-1 custom-class-name-2',
            highlightClass: 'highlight',
            scrollTo: false,
            cancelIcon: {
                enabled: true,
            },
            text: ['Արդեն կարող եք ավելացնել օրացույում նոր այցելություն'],
            when: {
                show: () => { },
                hide: () => { }
            }
        },


        // insurance
        infoForStep(
            '.guide-other',
            'bottom',
            { selector: '.guide-other', event: 'click' },
            function () {
                return new Promise<void>(function (resolve) {
                    setTimeout(function () {
                        resolve();
                    }, 200);
                });
            },
            'Համակարգի հավելյալ կարգավորումներից օգտվելու համար օգտվում ենք «Այլ» ներդիրից'
        ),
        infoForStep(
            '.guide-insurance',
            'bottom',
            { selector: '.guide-insurance', event: 'click' },
            function () {
                return new Promise<void>(function (resolve) {
                    setTimeout(function () {
                        resolve();
                    }, 200);
                });
            },
            'Գործընկեր ապահովագրական ընկերությունները կարգաբերելու համար օգտվում ենք «Ապահովագրական» ներդիրից'
        ),
        infoForStep(
            '.guide-insurance-create',
            'bottom',
            { selector: '.guide-insurance-create', event: 'click' },
            function () {
                return new Promise<void>(function (resolve) {
                    setTimeout(function () {
                        resolve();
                    }, 200);
                });
            },
            'Սեղմում ենք «Ստեղծել»'
        ),
        infoForStep(
            '.guide-insurance-create-modal',
            'top',
            { selector: '.guide-create-modal-button', event: 'click' },
            function () {
                return new Promise<void>(function (resolve) {
                    setTimeout(function () {
                        resolve();
                    }, 200);
                });
            },
            'Լրացնում ենք անհրաժեշտ տեղեկատվությունը և պահպանում։ Աստղանիշով նշված դաշտերը պարտադիր են լրացման համար։'
        ),

        // rooms
        infoForStep(
            '.guide-other',
            'bottom',
            { selector: '.guide-other', event: 'click' },
            function () {
                return new Promise<void>(function (resolve) {
                    setTimeout(function () {
                        resolve();
                    }, 200);
                });
            },
            'Համակարգի հավելյալ կարգավորումներից օգտվելու համար օգտվում ենք «Այլ» ներդիրից'
        ),
        infoForStep(
            '.guide-rooms',
            'bottom',
            { selector: '.guide-rooms', event: 'click' },
            function () {
                return new Promise<void>(function (resolve) {
                    setTimeout(function () {
                        resolve();
                    }, 200);
                });
            },
            'Բժիշկների տեղակայումն ըստ սենյակների կարգաբերելու համար օգտվում ենք «Սենյակներ» ներդիրից'
        ),
        infoForStep(
            '.guide-rooms-create',
            'bottom',
            { selector: '.guide-rooms-create', event: 'click' },
            function () {
                return new Promise<void>(function (resolve) {
                    setTimeout(function () {
                        resolve();
                    }, 200);
                });
            },
            'Սեղմում ենք «Ստեղծել»'
        ),
        infoForStep(
            '.guide-rooms-create-modal',
            'top',
            { selector: '.guide-create-modal-button', event: 'click' },
            function () {
                return new Promise<void>(function (resolve) {
                    setTimeout(function () {
                        resolve();
                    }, 200);
                });
            },
            'Լրացնում ենք անհրաժեշտ տեղեկատվությունը և պահպանում։ Աստղանիշով նշված դաշտերը պարտադիր են լրացման համար։'
        ),

        // // clientTemplate
        infoForStep(
            '.guide-other',
            'bottom',
            { selector: '.guide-other', event: 'click' },
            function () {
                return new Promise<void>(function (resolve) {
                    setTimeout(function () {
                        resolve();
                    }, 200);
                });
            },
            'Համակարգի հավելյալ կարգավորումներից օգտվելու համար օգտվում ենք «Այլ» ներդիրից'
        ),
        infoForStep(
            '.guide-clientsTemplates',
            'bottom',
            { selector: '.guide-clientsTemplates', event: 'click' },
            function () {
                return new Promise<void>(function (resolve) {
                    setTimeout(function () {
                        resolve();
                    }, 200);
                });
            },
            'Պացիենտների ներգրավման աղբյուրները կարգաբերելու համար օգտվում ենք «Աղբյուր» ներդիրից'
        ),
        infoForStep(
            '.guide-clientsTemplates-create',
            'bottom',
            { selector: '.guide-clientsTemplates-create', event: 'click' },
            function () {
                return new Promise<void>(function (resolve) {
                    setTimeout(function () {
                        resolve();
                    }, 200);
                });
            },
            'Սեղմում ենք «Ստեղծել»'
        ),
        infoForStep(
            '.guide-clientsTemplates-create-modal',
            'top',
            { selector: '.guide-create-modal-button', event: 'click' },
            function () {
                return new Promise<void>(function (resolve) {
                    setTimeout(function () {
                        resolve();
                    }, 200);
                });
            },
            'Լրացնում ենք անհրաժեշտ տեղեկատվությունը և պահպանում։ Աստղանիշով նշված դաշտերը պարտադիր են լրացման համար։'
        ),

        // // priceList
        infoForStep(
            '.guide-other',
            'bottom',
            { selector: '.guide-other', event: 'click' },
            function () {
                return new Promise<void>(function (resolve) {
                    setTimeout(function () {
                        resolve();
                    }, 200);
                });
            },
            'Համակարգի հավելյալ կարգավորումներից օգտվելու համար օգտվում ենք «Այլ» ներդիրից'
        ),
        infoForStep(
            '.guide-priceLists',
            'bottom',
            { selector: '.guide-priceLists', event: 'click' },
            function () {
                return new Promise<void>(function (resolve) {
                    setTimeout(function () {
                        resolve();
                    }, 200);
                });
            },
            'Ապահովագրական ընկերությունների գնացուցակները կարգաբերելու համար օգտվում ենք «Գնացուցակ» ներդիրից'
        ),
        infoForStep(
            '.guide-priceList-create',
            'bottom',
            { selector: '.guide-priceList-create', event: 'click' },
            function () {
                return new Promise<void>(function (resolve) {
                    setTimeout(function () {
                        resolve();
                    }, 200);
                });
            },
            'Սեղմում ենք «Ստեղծել»'
        ),
        infoForStep(
            '.guide-priceList-create-modal',
            'top',
            { selector: '.guide-create-modal-button', event: 'click' },
            function () {
                return new Promise<void>(function (resolve) {
                    setTimeout(function () {
                        resolve();
                    }, 200);
                });
            },
            'Լրացնում ենք անհրաժեշտ տեղեկատվությունը և պահպանում։ Աստղանիշով նշված դաշտերը պարտադիր են լրացման համար։'
        ),

        //user
        infoForStep(
            '.guide-users',
            'bottom',
            { selector: '.guide-users', event: 'click' },
            function () {
                return new Promise<void>(function (resolve) {
                    setTimeout(function () {
                        resolve();
                    }, 200);
                });
            },
            'Համակարգի օգտվողներ կարգաբերելու համար օգտվում ենք «Օգտվողներ» ներդիրից'
        ),
        infoForStep(
            '.guide-users-create',
            'bottom',
            { selector: '.guide-users-create', event: 'click' },
            function () {
                return new Promise<void>(function (resolve) {
                    setTimeout(function () {
                        resolve();
                    }, 200);
                });
            },
            'Սեղմում ենք «Ստեղծել»'
        ),
        infoForStep(
            '.guide-users-create-modal',
            'top',
            { selector: '.guide-create-modal-button', event: 'click' },
            function () {
                return new Promise<void>(function (resolve) {
                    setTimeout(function () {
                        resolve();
                    }, 200);
                });
            },
            'Լրացնում ենք անհրաժեշտ տեղեկատվությունը և պահպանում։ Աստղանիշով նշված դաշտերը պարտադիր են լրացման համար։'
        ),
    ]
}