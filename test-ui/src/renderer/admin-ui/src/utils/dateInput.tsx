import { useRef } from "react";
import { DateInput } from "react-admin"

export const CustomDateInput = ({ defaultValue, disabled, source, label, alwaysOn }: any) => {
    const inputRef = useRef<any>(null);

    const handleClick = () => {
        if (inputRef.current === null || disabled) return;
        inputRef.current.showPicker();
    };

    return <DateInput defaultValue={defaultValue ? defaultValue : null} disabled={disabled ? disabled : false} alwaysOn={alwaysOn} fullWidth onClick={handleClick} inputProps={{ ref: inputRef }} source={`${source}`} label={label} />
}
