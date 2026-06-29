import React from "react";

const CustomTable = ({
    data = [],
    columns = [],
    loading = false,
    emptyMessage = "No data found.",
    className = "",
    headerClassName = "",
    renderRow,
}) => {
    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#04364A]"></div>
            </div>
        );
    }

    // Render empty state
    if (!data?.length) {
        return (
            <p className="text-sm text-gray-500 py-8 text-center border border-dashed border-gray-200 rounded-lg">
                {emptyMessage}
            </p>
        );
    }

    const renderFunction =
        renderRow ||
        ((data, columns) =>
            data.map((row, index) => (
                <tr key={index}>
                    {columns.map((col) => (
                        <td
                            key={col.key}
                            className="px-4 py-3 border-b border-gray-200"
                        >
                            {row[col.key] ?? "—"}
                        </td>
                    ))}
                </tr>
            )));

    return (
        <div className={`overflow-x-auto ${className}`}>
            <table className="w-full border-collapse">
                <thead>
                    <tr className={`bg-gray-50 border-b border-gray-200 ${headerClassName}`}>
                        {columns.map((column, index) => (
                            <th
                                key={column.key || column.id || index}
                                className={`px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider ${column.className || ""
                                    }`}
                                style={column.width || column.minWidth ? {
                                    width: column.width || column.minWidth,
                                    minWidth: column.minWidth
                                } : {}}
                            >
                                {column.label}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody className="bg-white">
                    {renderFunction(data, columns)}
                </tbody>
            </table>
        </div>
    );
};

export default CustomTable;