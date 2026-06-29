import React, { useMemo, useState } from "react";
import Card, { CardBody } from "../ui/Card";
import Button from "../ui/Button";
import { Plus, Trash2 } from "lucide-react";
import { useAlert } from "../../helpers/AlertContent";

const ChecklistSection = ({ taskId, checklist, onToggle, onDelete, onAdd, loading }) => {
  const { showAlert } = useAlert();
  const [newChecklistTitle, setNewChecklistTitle] = useState("");

  const checklistProgress = useMemo(() => {
    const items = checklist || [];
    if (!items.length) return 0;
    const done = items.filter((i) => i.isCompleted).length;
    return Math.round((done / items.length) * 100);
  }, [checklist]);

  const handleAddChecklist = async () => {
    const title = newChecklistTitle.trim();
    if (!title) return;
    try {
      await onAdd(title);
      setNewChecklistTitle("");
      showAlert({ type: "success", title: "Added", message: "Checklist item added." });
    } catch (error) {
      showAlert({ type: "error", title: "Error", message: error });
    }
  };

  const handleDeleteChecklist = async (checklistId) => {
    if (!window.confirm("Remove this checklist item?")) return;
    try {
      await onDelete(checklistId);
    } catch (error) {
      showAlert({ type: "error", title: "Error", message: error });
    }
  };

  return (
    <Card>
      <CardBody className="p-6 space-y-4">
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            Workflow Checklist
          </h4>
          <div className="space-y-2 bg-gray-50 p-4 rounded-lg border border-gray-100">
            {(checklist || []).map((item) => (
              <label
                key={item.id}
                className="flex items-center gap-3 text-sm text-gray-700"
              >
                <input
                  type="checkbox"
                  checked={item.isCompleted}
                  onChange={() => onToggle(item.id)}
                  disabled={loading}
                  className="w-4 h-4 rounded accent-[#04506B]"
                />
                <span
                  className={
                    item.isCompleted
                      ? "line-through text-gray-400"
                      : "font-medium"
                  }
                >
                  {item.title}
                </span>
                <button
                  type="button"
                  onClick={() => handleDeleteChecklist(item.id)}
                  className="ml-auto text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={14} />
                </button>
              </label>
            ))}
            <div className="flex gap-2 pt-2">
              <input
                type="text"
                value={newChecklistTitle}
                onChange={(e) => setNewChecklistTitle(e.target.value)}
                placeholder="New checklist item..."
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                maxLength={200}
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleAddChecklist}
                leftIcon={Plus}
                styleClass="!w-auto"
              >
                Add
              </Button>
            </div>
          </div>
        </div>

        {(checklist || []).length > 0 && (
          <div>
            <div className="flex justify-between text-sm font-semibold mb-1">
              <span className="text-gray-500">Checklist Progress</span>
              <span className="text-[#04506B]">{checklistProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-[#04506B] h-2.5 rounded-full transition-all"
                style={{ width: `${checklistProgress}%` }}
              />
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default ChecklistSection;