import React, { useEffect, useMemo, useState } from "react";
import { Pagination, Stack } from "@mui/material";
import Card, { CardBody } from "../ui/Card";
import Loader from "../Loader/Loader";

const ReportTable = ({ columns, data = [], isLoading }) => {
  const rowsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  const totalPages = Math.ceil(data.length / rowsPerPage);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return data.slice(start, start + rowsPerPage);
  }, [data, currentPage]);

  const paginationSx = {
    "& .MuiPaginationItem-root": {
      width: "32px",
      height: "32px",
      minWidth: "32px",
      color: "#04506B",
      borderColor: "#d1d5db",
    },

    "& .MuiPaginationItem-root.Mui-selected": {
      backgroundColor: "#04506B",
      color: "#fff",

      "&:hover": {
        backgroundColor: "#03394d",
      },
    },

    "& .MuiPaginationItem-root:hover": {
      backgroundColor: "#f3f4f6",
    },

    "& .MuiPagination-ul": {
      gap: 0.5,
    },
  };

  if (isLoading) {
    return (
      <Loader />
    );
  }

  if (!data.length) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
        <p className="text-gray-500">
          No data found for the selected criteria.
        </p>
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardBody className="p-0 relative">
          <div className="bg-white overflow-hidden pt-3">
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <div className="max-h-[55vh] overflow-y-auto">
                <table className="min-w-full table-auto border-collapse">

                  <thead className="sticky top-0 z-20 bg-[#04506B]">
                    <tr>
                      {columns.map((col) => (
                        <th
                          key={col.dataKey}
                          className="px-4 py-2.5 text-left text-[14px] font-bold text-muted-foreground whitespace-nowrap bg-muted border-b border-gray-300"
                        >
                          {col.header}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedData.map((row, rowIndex) => (
                      <tr
                        key={row.id || rowIndex}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        {columns.map((col) => {
                          const value = row[col.dataKey];
                          let displayValue = value;

                          if (col.format === "date" && value) {
                            displayValue = new Date(value).toLocaleDateString();
                          } else if (
                            col.format === "currency" &&
                            value != null
                          ) {
                            displayValue = `₹${Number(value).toLocaleString()}`;
                          } else if (
                            typeof value === "object" &&
                            value !== null
                          ) {
                            displayValue =
                              value.name ||
                              value.businessName ||
                              value.title ||
                              "-";
                          }

                          return (
                            <td
                              key={col.dataKey}
                              className="px-4 py-4 text-sm text-gray-700 whitespace-nowrap"
                            >
                              {col.render ? col.render(row) : displayValue || "-"}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>

                </table>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center mt-5 gap-4">

            <p className="text-sm text-gray-600">
              Showing{" "}
              <span className="font-medium">
                {(currentPage - 1) * rowsPerPage + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(currentPage * rowsPerPage, data.length)}
              </span>{" "}
              of{" "}
              <span className="font-medium">{data.length}</span>{" "}
              entries
            </p>

            {totalPages > 1 && (
              <Stack>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={(e, page) => setCurrentPage(page)}
                  variant="outlined"
                  shape="rounded"
                  size="small"
                  sx={paginationSx}
                />
              </Stack>
            )}

          </div>
        </CardBody>
      </Card>
    </>
  );
};

export default ReportTable;