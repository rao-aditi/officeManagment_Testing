import React from "react";
import { IoMdClose } from "react-icons/io";
import { motion, AnimatePresence } from "framer-motion";
import { useFormik } from "formik";
import * as Yup from "yup";

import TextInput from "../ui/TextInput";
import SelectInput from "../ui/SelectInput";
import Button from "../ui/Button";
import SearchWithFilter from "./SearchWithFilter";

const ManageFilter = ({ isOpen, onClose, onApply, title = "Filter" }) => {
  const celebrationOptions = [
    { label: "Birthday", value: "birthday" },
    { label: "Anniversary", value: "anniversary" },
  ];

  const statusOptions = [
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
  ];

  const genderOptions = [
    { label: "Male", value: "male" },
    { label: "Female", value: "female" },
  ];

  const formik = useFormik({
    initialValues: {
      search: "",
      selectDate: "",
      celebration: "",
      status: "",
      gender: "",
    },
    validationSchema: Yup.object({}),
    onSubmit: (values) => {
      onApply?.(values);
      onClose();
    },
  });

  const handleSearchClick = () => {
    formik.handleSubmit();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/40"
          onClick={onClose}
        >
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 right-0 h-full w-72 bg-card shadow-xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between bg-button px-5 py-3">
              <h2 className="text-button-foreground text-lg font-semibold">{title}</h2>
              <IoMdClose
                className="text-button-foreground text-xl cursor-pointer"
                onClick={onClose}
              />
            </div>

            <form onSubmit={formik.handleSubmit} className="flex flex-col flex-1">
              <div className="flex-1 overflow-y-auto px-5 py-6 bg-muted space-y-5">
                <SearchWithFilter
                  placeholder="Search..."
                  width="100%"
                  value={formik.values.search}
                  onChange={(e) => formik.setFieldValue("search", e.target.value)}
                  onSearchClick={handleSearchClick}
                />

                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">
                    Select Date
                  </label>
                  <input
                    type="date"
                    name="selectDate"
                    value={formik.values.selectDate}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full bg-input border border-gray-300 rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1"
                  />
                </div>

                <SelectInput
                  label="Celebration"
                  name="celebration"
                  options={celebrationOptions}
                  value={formik.values.celebration}
                  onChange={(val) => formik.setFieldValue("celebration", val)}
                  placeholder="--Select Celebration--"
                />

                <SelectInput
                  label="Status"
                  name="status"
                  options={statusOptions}
                  value={formik.values.status}
                  onChange={(val) => formik.setFieldValue("status", val)}
                  placeholder="--Select Status--"
                />

                <SelectInput
                  label="Gender"
                  name="gender"
                  options={genderOptions}
                  value={formik.values.gender}
                  onChange={(val) => formik.setFieldValue("gender", val)}
                  placeholder="--Select Gender--"
                />
              </div>

              <div className="border-t border-gray-300 p-4 bg-card">
                <div className="flex justify-between gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    styleClass="w-full"
                    onClick={() => formik.resetForm()}
                  >
                    Reset
                  </Button>

                  <Button type="submit" variant="primary" styleClass="w-full">
                    Apply Filter
                  </Button>
                </div>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ManageFilter;
