import type { FC } from "react";

interface CloseButtonProps {
    label: string;
    onClose: () => void;
    newClassName?: string;
    className?: string;
}

const CloseButton: FC<CloseButtonProps> = ({ label, onClose, newClassName, className }) => {
    return (
        <>
            <button type="submit" className={`
            ${newClassName
                    ? newClassName
                    : `px-4 py-3 bg-white dark:bg-gray-800
                    hover:bg-gray-200 dark:hover:bg-gray-700
                    border border-gray-200 dark:border-gray-700
                    text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white
                    font-medium cursor-pointer rounded-lg shadow-lg
                    transition-colors duration-200 text-sm 
                ${className}`
                }`}
                onClick={onClose}
            >
                {label}
            </button>
        </>
    )
}

export default CloseButton