import React from "react";
import { TfiEye } from "react-icons/tfi";
import { SlPencil } from "react-icons/sl";
import { GoTrash } from "react-icons/go";
import { HiOutlinePlusSmall, HiPlusSmall } from "react-icons/hi2";

const ActionButtons = ({
  onView,
  onEdit,
  onDelete,
  onAdd,
  showView = true,
  showEdit = true,
  showDelete = true,
  showAdd = false,
  reserveAddSpace = false,
  disabled = false,
}) => {
  const baseBtnClasses =
    "w-8 h-8 flex justify-center items-center rounded text-sm transition-all duration-200";

  const addBtn =
    "flex items-center gap-1 px-2 h-7 rounded text-sm font-medium transition-all duration-200";

  return (
    <div className="flex gap-2">
      {/* Edit Button */}
      {showEdit && (
        <button
          type="button"
          onClick={onEdit}
          className={`${baseBtnClasses} bg-[#E8FFEE] text-[#00A651] hover:border hover:border-[#00A651]`}
        >
          <SlPencil size={16} />
        </button>
      )}

      {/* View Button */}
      {showView && (
        <button
          type="button"
          onClick={onView}
          className={`${baseBtnClasses} bg-[#E8F3FF] text-[#0057FF] hover:border hover:border-[#0057FF]`}
        >
          <TfiEye size={16} />
        </button>
      )}

      {/* Delete Button */}
      {showDelete && (
        <button
          type="button"
          onClick={onDelete}
          disabled={disabled}
          className={`${baseBtnClasses} bg-[#FFEDED] text-[#FF0000] hover:border hover:border-[#FF0000] disabled:opacity-50`}
        >
          <GoTrash size={16} />
        </button>
      )}

      {(showAdd || reserveAddSpace) && (
        <button
          type="button"
          onClick={onAdd}
          style={{ visibility: showAdd ? "visible" : "hidden" }}
          className={`${addBtn} bg-orange-50 text-primary hover:border hover:border-[#ff9f1c]`}
        >
          <HiOutlinePlusSmall size={14} />
          <span>Add</span>
        </button>
      )}
    </div>
  );
};

export default ActionButtons;
