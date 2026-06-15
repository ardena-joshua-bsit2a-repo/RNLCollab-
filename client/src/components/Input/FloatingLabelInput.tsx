import type { ChangeEvent, FC } from "react";

interface FloatingLabelInputProps {
  label: string;
  type: "text" | "date" | "password";
  name: string;
  value?: string | any;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  newLabelClassName?: string;
  labelClassName?: string;
  newInputClassName?: string;
  inputClassName?: string;
  required?: boolean;
  autoFocus?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  errors?: string[];
}

const FloatingLabelInput: FC<FloatingLabelInputProps> = ({
  label,
  name,
  type,
  value,
  onChange,
  newLabelClassName,
  labelClassName,
  newInputClassName,
  inputClassName,
  required,
  autoFocus,
  disabled,
  readOnly,
  errors,
}) => {
  return (
    <>
      <div className="relative">
        <input
          type={type}
          id={name}
          value={value}
          onChange={onChange}
          className={`${
            newInputClassName
              ? newInputClassName
              : `block px-2.5 pb-2.5 pt-4 w-full bg-transparent text-sm text-white text-heading rounded-lg
                            border border-default-medium appearance-none focus:outline-none
                            focus:border-blue-400 focus:shadow-[0_0_10px_rgba(59,130,246,0.6)]
                            ${inputClassName}`
          }`}
          placeholder=" "
          autoFocus={autoFocus}
          disabled={disabled}
          readOnly={readOnly}
        />
        <label
          htmlFor={name}
          className={`${
            newLabelClassName
              ? newLabelClassName
              : `absolute text-sm text-white duration-300 transform bg-gray-700 -translate-y-4 scale-75 top-2 z-10 origin-left 
                           px-2 peer-focus:px-2 peer-focus:text-white peer-placeholder-shown:scale-100
                            peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-scaled-75
                            peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto inset-s-1 rounded-lg
                            ${labelClassName}`  
          }`}
        >
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </label>
      </div>
      {errors && errors.length > 0 && (
        <span className="text-red-600 text-xs">{errors[0]}</span>
      )}
    </>
  );
};

export default FloatingLabelInput;
