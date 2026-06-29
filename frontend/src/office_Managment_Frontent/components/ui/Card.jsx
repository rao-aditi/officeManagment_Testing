import React from 'react';

const Card = ({ children, className = "", onClick }) => {
    return (
        <div
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
};

export const CardHeader = ({ children, className = "" }) => {
    return (
        <div className={`px-6 py-3 border-b border-gray-200 dark:border-gray-700 ${className}`}>
            {children}
        </div>
    );
};

export const CardBody = ({ children, className = "" }) => {
    return (
        <div className={`px-6 py-4 ${className}`}>
            {children}
        </div>
    );
};

export const CardFooter = ({ children, className = "" }) => {
    return (
        <div className={`px-6 py-4 border-t border-gray-200 dark:border-gray-700 ${className}`}>
            {children}
        </div>
    );
};

export default Card;