export const TabPanel = (props: any) => {
    const { children, value, index, ...other } = props;

    return (
        <div
            className="tab-panel"
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <div>
                    {children}
                </div>
            )}
        </div>
    );
}
