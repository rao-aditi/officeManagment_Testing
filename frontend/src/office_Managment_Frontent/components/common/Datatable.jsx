import { useState, useEffect, memo, useRef } from "react";
import { Pagination, Stack } from "@mui/material";
import { ArrowUpDown } from "lucide-react";
import SelectPage from "./SelectPage";
import { TbBrandDatabricks } from "react-icons/tb";

const DataTable = ({
  columns = [],
  data = [],
  renderRow,
  rowsPerPage = 10,
  currentPage = 1,
  totalRecords,
  setRowsPerPage,
  setCurrentPage,
  sortable = true,
  onSort,
}) => {
  const [visibleColumns, setVisibleColumns] = useState(
    columns.filter((c) => c.enabled !== false)
  );
  const tableContainerRef = useRef(null);

  useEffect(() => {
    setVisibleColumns(columns.filter((c) => c.enabled !== false));
  }, [columns]);

  const totalPages = Math.ceil(totalRecords / rowsPerPage);
  const startRow = totalRecords === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const endRow = Math.min(currentPage * rowsPerPage, totalRecords);

  const paginationSx = {
    "& .MuiPaginationItem-root": {
      width: "25px",
      height: "25px",
      padding: 0,
      minWidth: "25px",
      color: "var(--color-primary)",
      backgroundColor: "transparent",
      borderColor: "var(--color-border)",
    },
    "& .MuiPaginationItem-icon": {
      fontSize: "16px",
      color: "var(--color-muted-foreground)",
    },
    "& .MuiPaginationItem-root.Mui-selected": {
      backgroundColor: "var(--color-muted)",
      color: "var(--color-primary)",
      border: "1px solid var(--color-primary)",
      "&:hover": {
        backgroundColor: "var(--color-muted)",
      },
    },
    "& .MuiPaginationItem-root:hover": {
      backgroundColor: "var(--color-accent)",
    },
    "& .MuiPaginationItem-ellipsis": {
      color: "var(--color-muted-foreground)",
    },
  };

  return (
    <div className="relative flex flex-col w-full rounded-lg border border-gray-300 bg-card transition-colors duration-200">
      <div className="table-scroll-wrapper">
        <div
          ref={tableContainerRef}
          className="table-scroll-inner"
        >
          <table className="min-w-full table-auto border-separate border-spacing-0">

            <thead className="sticky top-0 z-30">
              <tr>
                {visibleColumns.map((col) => (
                  <th
                    key={col.id}
                    className="px-4 py-2.5 text-left text-[14px] font-bold text-muted-foreground whitespace-nowrap bg-muted border-b border-gray-300"
                    style={{
                      minWidth: col.minWidth || "100px",
                      maxWidth: col.maxWidth || "auto",
                      width: col.width || "auto",
                    }}
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      {sortable &&
                        col.id !== "actionButton" &&
                        col.id !== "status" && (
                          <span className="ml-1 text-[10px] text-muted-foreground cursor-pointer hover:text-foreground">
                            <ArrowUpDown
                              size={14}
                              className="inline ml-1 text-muted-foreground"
                            />
                          </span>
                        )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="bg-card">
              {data && data.length > 0 ? (
                renderRow(data, visibleColumns)
              ) : (
                <tr>
                  <td
                    colSpan={visibleColumns.length}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <TbBrandDatabricks
                        size={40}
                        className="text-primary/40 mb-2"
                      />
                      <p className="text-sm text-foreground">
                        No matching records found
                      </p>
                      <p className="text-xs text-muted-foreground">
                        No records available
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>
      </div>

      {totalRecords > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center px-4 py-3 gap-3 rounded-b-lg bg-card border-t border-gray-300 flex-shrink-0">

          <div className="text-sm text-muted-foreground">
            Showing {startRow} to {endRow} of {totalRecords} entries
          </div>

          <Stack spacing={1}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={(e, value) => setCurrentPage(value)}
              variant="outlined"
              shape="rounded"
              size="small"
              sx={paginationSx}
            />
          </Stack>

          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground whitespace-nowrap">
              Rows per page:
            </label>
            <SelectPage
              isSearchable={false}
              value={rowsPerPage.toString()}
              onChange={(value) => {
                setRowsPerPage(Number(value));
                setCurrentPage(1);
              }}
              options={[
                { label: "10", value: "10" },
                { label: "20", value: "20" },
                { label: "30", value: "30" },
                { label: "40", value: "40" },
              ]}
              style={{ width: "70px" }}
            />
          </div>

        </div>
      )}

    </div>
  );
};

export default memo(DataTable);