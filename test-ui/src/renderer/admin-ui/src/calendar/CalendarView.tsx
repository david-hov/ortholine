import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
// @ts-ignore
import { Calendar, Views, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import { useRedirect } from 'ra-core'
import { AutocompleteInput, DateInput, Loading, ReferenceInput, SimpleForm, usePermissions } from 'react-admin'
import { dataProvider } from '../dataProvider';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'moment/locale/en-ie';
import { Box, Button, FormControl, InputLabel, Menu, MenuItem, Select, useMediaQuery } from '@mui/material'
import { isArray } from 'lodash'
import RefreshIcon from '@mui/icons-material/RefreshRounded';

moment.locale('en-ie', {
    week: {
        dow: 1,
        doy: 1,
    },
});
const localizer = momentLocalizer(moment);
const DragAndDropCalendar = withDragAndDrop(Calendar)

export const CalendarView = () => {
    const isSmall = useMediaQuery('(max-width:600px)');
    const { isLoading, permissions } = usePermissions();
    const redirect = useRedirect();
    const [contextMenu, setContextMenu] = useState<any>(null);
    const [eventChanged, setEventChanged] = useState<any>(false);
    const [calendarDate, setCalendarDate] = useState<any>(moment().toDate());
    const [events, setEvents] = useState<any>();
    const [doctors, setDoctors] = useState<any>();
    const [rangeDate, setRangeDate] = useState<any>(moment(moment().startOf('week').format()).format("YYYY-MM-DD HH:mm:ss"));
    const [rangeEndDate, setEndRangeDate] = useState<any>(moment(moment().endOf('week').format()).format("YYYY-MM-DD HH:mm:ss"));
    const inputRef = useRef<any>(null);

    const handleClickDateInput = () => {
        if (inputRef.current === null) return;
        inputRef.current.showPicker();
    };

    const handleClick = (event: any, data: any) => {
        setContextMenu(
            contextMenu === null
                ? {
                    mouseX: event.clientX - 2,
                    mouseY: event.clientY - 4,
                    data: data
                }
                : null,
        );
    };

    const handleClose = () => {
        setContextMenu(null);
    };

    useEffect(() => {
        const getDoctors = async () => {
            const { data } = await dataProvider.getList('doctors', {
                pagination: { page: 1, perPage: 10000 },
                sort: { field: 'id', order: 'DESC' },
                filter: {}
            })
            setDoctors(data)
        }
        getDoctors();
    }, []);

    useEffect(() => {
        const getEvents = async () => {
            const { data } = await dataProvider.getList('visits/calendar', {
                pagination: { page: 1, perPage: 10000 },
                sort: { field: 'id', order: 'DESC' },
                filter: { startDate: rangeDate, endDate: rangeEndDate, doctor: permissions === 'doctor' ? localStorage.getItem('token') : '' }
            })
            setEvents(data);
            setEventChanged(false);
        }
        getEvents();
        const interval = setInterval(() => {
            getEvents();
        }, 5 * 60 * 1000);
        return () => {
            clearInterval(interval)
        }
    }, [rangeDate, calendarDate, contextMenu, eventChanged]);


    const handleSelectSlot = ({ start, end }: any) => {
        if (permissions !== 'doctor') {
            redirect('create', 'visits', undefined, undefined, { startDate: start, endDate: end })
        }
    }

    const handleSelectEvent = (event: any) => {
        redirect('edit', 'visits', event.id, event, undefined)
    }

    const { defaultDate, scrollToTime } = useMemo(
        () => ({
            defaultDate: moment().toDate(),
            scrollToTime: new Date(1970, 1, 1, 6),
        }),
        []
    )

    const moveEvent = useCallback(
        async ({ event, start, end, isAllDay: droppedOnAllDaySlot = false }: any) => {
            const { allDay } = event;
            if (permissions !== 'doctor') {
                if (!allDay && droppedOnAllDaySlot) {
                    event.allDay = true
                }
                setEvents((prev: any) => {
                    const existing = prev.find((ev: any) => ev.id === event.id) ?? {}
                    const filtered = prev.filter((ev: any) => ev.id !== event.id)
                    return [...filtered, { ...existing, start, end, allDay }]
                });
                event.start = moment(start).format("YYYY-MM-DD HH:mm:ss")
                event.end = moment(end).format("YYYY-MM-DD HH:mm:ss")
                await dataProvider.update('visits/movementCalendar', {
                    id: event.id,
                    data: event,
                    previousData: {}
                });
                setEventChanged(true);
            }
        },
        [setEvents]
    )

    const resizeEvent = useCallback(
        async ({ event, start, end }: any) => {
            if (permissions !== 'doctor') {
                if(moment(start).isSame(moment(end))) {
                    end = moment(end).add(30, 'minutes')
                }
                setEvents((prev: any) => {
                    const existing = prev.find((ev: any) => ev.id === event.id) ?? {}
                    const filtered = prev.filter((ev: any) => ev.id !== event.id)
                    return [...filtered, { ...existing, start, end }]
                });
                event.start = moment(start).format("YYYY-MM-DD HH:mm:ss")
                event.end = moment(end).format("YYYY-MM-DD HH:mm:ss")
                await dataProvider.update('visits/movementCalendar', {
                    id: event.id,
                    data: event,
                    previousData: {}
                });
            }
        },
        [setEvents]
    )

    const filterByDoctor = async (body: any) => {
        const { data } = await dataProvider.getList('visits/calendar', {
            pagination: { page: 1, perPage: 10000 },
            sort: { field: 'id', order: 'DESC' },
            filter: { startDate: rangeDate, endDate: rangeEndDate, doctor: body }
        })
        setEvents(data)
    }

    const filterByClients = async (e: any) => {
        const { data } = await dataProvider.getList('visits/calendar', {
            pagination: { page: 1, perPage: 10000 },
            sort: { field: 'id', order: 'DESC' },
            filter: { startDate: rangeDate, endDate: rangeEndDate, client: e }
        });
        setEvents(data)
    }

    const sendArrived = async (arrivedStatus: string) => {
        await dataProvider.update('visits/isArrived', {
            id: contextMenu.data.id,
            data: {
                lastVisitChecked: arrivedStatus
            },
            previousData: {}
        });
        handleClose();
    }

    if (isLoading) return <Loading />
    return (
        <Box>
            <Menu
                className="right-click-menu"
                anchorReference="anchorPosition"
                anchorPosition={
                    contextMenu !== null
                        ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                        : undefined
                }
                keepMounted
                open={contextMenu !== null}
                onClose={handleClose}
            >
                <MenuItem onClick={() => sendArrived('came')}>
                    Մոտեցել է
                </MenuItem>
                <MenuItem onClick={() => sendArrived('notCame')}>
                    Չի մոտեցել
                </MenuItem>
            </Menu>
            <div className="height600">
                <SimpleForm className='date-calendar' toolbar={false}>
                    <FormControl fullWidth>
                        {permissions == 'doctor' ? null :
                            <>
                                <InputLabel id='demo-simple-select-label'>Բժիշկ</InputLabel>
                                <Select
                                    defaultValue={''}
                                    onChange={(e) => filterByDoctor(e.target.value)}
                                >
                                    <MenuItem style={{ height: '36px' }} value='' />
                                    {doctors?.map((item: any, key: number) => {
                                        return <MenuItem key={key} value={item.id}>{item.name}</MenuItem>
                                    })}
                                </Select>
                            </>
                        }
                        <ReferenceInput resource='calendar' source="clients" reference="clients">
                            <AutocompleteInput noOptionsText={<Button variant='contained' onClick={() => redirect('/clients/create')}>Ավելացնել Պացիենտ</Button>} onChange={(e: any) => filterByClients(e)} label="Պացիենտ" optionText="name" />
                        </ReferenceInput>
                    </FormControl>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                        <DateInput label='Ամսաթիվ' onClick={handleClickDateInput} inputProps={{ ref: inputRef }} onChange={(e: any) => {
                            setCalendarDate(e.target.value !== '' ? moment(e.target.value).format("YYYY-MM-DD HH:mm:ss") : moment().format("YYYY-MM-DD HH:mm:ss"));
                            setRangeDate(moment(e.target.value !== '' ? moment(e.target.value).day(0).format("YYYY-MM-DD HH:mm:ss") : moment().day(0).format("YYYY-MM-DD HH:mm:ss")))
                            setEndRangeDate(moment(e.target.value !== '' ? moment(e.target.value).day(6).format("YYYY-MM-DD HH:mm:ss") : moment().day(6).format("YYYY-MM-DD HH:mm:ss")))
                        }} style={{ width: 'fit-content' }} source='calendarDate' />
                        {/* <Button className='button-orange' onClick={() => setRangeDate(moment(rangeDate).day(0).format("YYYY-MM-DD HH:mm:ss"))}>
                            Թարմացնել<RefreshIcon />
                        </Button> */}
                    </div>
                </SimpleForm>
                <DragAndDropCalendar
                    components={{
                        eventWrapper: ({ event, children, props }: any) => {
                            if (event.info !== 'Չկա') {
                                if (isArray(children.props.children.props.children)) {
                                    children.props.children.props.children.push(<span className='info-notif'>*</span>)
                                }
                            }

                            return (
                                <div
                                    onContextMenu={
                                        e => {
                                            e.preventDefault()
                                            if (e.type === 'contextmenu' && permissions != 'doctor') {
                                                if (moment().isAfter(moment(event.start))) {
                                                    handleClick(e, event)
                                                }
                                            }
                                        }
                                    }
                                >
                                    {children}
                                </div>
                            )
                        }
                    }}
                    onRangeChange={(range: any) => {
                        if (range.hasOwnProperty('start')) {
                            setRangeDate(moment(new Date(range.start)).format("YYYY-MM-DD HH:mm:ss"))
                            setEndRangeDate(moment(new Date(range.end)).format("YYYY-MM-DD HH:mm:ss"))
                        } else if (range.length == 1) {
                            setRangeDate(moment(new Date(range[0])).format("YYYY-MM-DD HH:mm:ss"))
                            setEndRangeDate(moment(new Date(range[0]).setHours(23, 59)).format("YYYY-MM-DD HH:mm:ss"))
                        } else {
                            setRangeDate(moment(new Date(range[0])).format("YYYY-MM-DD HH:mm:ss"))
                            setEndRangeDate(moment(new Date(range[range.length - 1])).format("YYYY-MM-DD HH:mm:ss"))
                        }
                    }}
                    min={moment(new Date(0, 0, 0, 8, 0, 0)).toDate()}
                    date={calendarDate}
                    onNavigate={(date: any) => setCalendarDate(moment(date).format("YYYY-MM-DD HH:mm:ss"))}
                    tooltipAccessor={(e: any) => {
                        return '\n' + e.title + '\n' +
                            'Բժիշկ - ' + e.doctor + '\n' +
                            'Սենյակ - ' + e.room + '\n' +
                            'Աղբյուր - ' + e.template + '\n' +
                            'Նշում - ' + e.info + '\n' +
                            'Ապպա -' + e.insurance
                    }}
                    eventPropGetter={(event: any) => {
                        let newStyle = {
                            backgroundColor: 'blue',
                            borderRadius: "5px",
                            border: "1px solid grey"
                        };
                        if (event.color) {
                            newStyle.backgroundColor = event.color;
                        }
                        return {
                            className: `${event.late == true ? 'late' : ''}` + ' ' + `${event.isFinished == false ? 'notFinished' : ''}`,
                            style: newStyle
                        }
                    }}
                    onEventResize={resizeEvent}
                    onEventDrop={moveEvent}
                    defaultDate={defaultDate}
                    defaultView={isSmall ? Views.DAY : Views.WEEK}
                    startAccessor={(event: any) => { return new Date(event.start) }}
                    endAccessor={(event: any) => { return new Date(event.end) }}
                    events={events}
                    localizer={localizer}
                    onSelectEvent={handleSelectEvent}
                    onSelectSlot={(e) => handleSelectSlot(e)}
                    messages={{
                        next: "Հաջորդ",
                        previous: "Նախորդ",
                        today: "Այսօր",
                        month: "Ամիս",
                        week: "Շաբաթ",
                        day: "Օր"
                    }}
                    selectable
                    resizable
                    popup
                    scrollToTime={scrollToTime}
                />
            </div>
        </Box>
    )
}
