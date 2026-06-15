import type { FC } from "react";
import { Link } from "react-router-dom";

interface BackButtonProps {
    label: string;
    path: string;
    newClassName?: string;
    className?: string;
}
const BackButton: FC<BackButtonProps> = ({
    label,
    path,
    newClassName,
    className,
}) => {
    return (
        <>
            <Link to={path}
            className={`
            ${newClassName
                    ? newClassName
                    : `px-4 py-3 bg-white dark:bg-gray-800
                    hover:bg-gray-200 dark:hover:bg-gray-700
                    border border-gray-200 dark:border-gray-700
                    text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white
                    font-medium cursor-pointer rounded-lg shadow-lg
                    transition-colors duration-200 text-sm
                ${className}`
                }`}>
                {label}
            </Link>
        </>
    )
}

export default BackButton