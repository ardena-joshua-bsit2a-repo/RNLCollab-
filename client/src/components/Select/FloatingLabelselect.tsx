import type { ChangeEvent, FC, ReactNode } from "react";

interface FloatingLabelSelectProps {
    label: string;
    newSelectClassName?: string;
    selectClassName?: string;
    newLabelClassName?: string;
    labelClassName?: string;
    name?: string;
    value?: string | number;
    onChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
    required?: boolean;
    autoFocus?: boolean;
    disabled?: boolean;
    errors?: string[];
    children: ReactNode;
}

const FloatingLabelSelect: FC<FloatingLabelSelectProps> = ({
    label,
    newSelectClassName,
    selectClassName,
    newLabelClassName,
    labelClassName,
    name,
    value,
    onChange,
    required,
    autoFocus,
    disabled,
    errors,
    children,
}) => {
    return (
        <div className="relative">
            <select
                name={name}
                id={name}
                value={value}
                onChange={onChange}
                className={
                    newSelectClassName
                        ? newSelectClassName
                        : `block px-2.5 pb-2.5 pt-4 w-full text-sm text-white text-heading bg-transparent rounded-lg
                            border border-default-medium appearance-none focus:outline-none
                            focus:border-blue-400 focus:shadow-[0_0_10px_rgba(59,130,246,0.6)]
                            [&>option]:bg-gray-900 [&>option]:text-white ${selectClassName || ""}`
                }
                required={required}
                autoFocus={autoFocus}
                disabled={disabled}
            >
                {children}
            </select>

            <label
                htmlFor={name}
                className={
                    newLabelClassName
                        ? newLabelClassName
                        : `absolute text-sm text-white duration-300 transform bg-gray-700 -translate-y-4 scale-75 top-2 z-10 origin-left 
                           px-2 peer-focus:px-2 peer-focus:text-white peer-placeholder-shown:scale-100
                            peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-scaled-75
                            peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto inset-s-1 rounded-lg ${labelClassName || ""}`
                }
            >
                {label}
                {required && <span className="text-red-600">*</span>}
            </label>

            {errors && errors.length > 0 && (
                <span className="text-red-600">{errors[0]}</span>
            )}
        </div>
    );
};

export default FloatingLabelSelect;