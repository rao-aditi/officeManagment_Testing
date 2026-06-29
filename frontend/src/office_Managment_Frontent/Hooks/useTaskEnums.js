import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getEnums } from "../store/slice/auth/authSlice";

export const useTaskEnums = () => {
  const dispatch = useDispatch();
  const { enums, enumsLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!enums?.taskStatus?.length) {
      dispatch(
        getEnums({
          taskStatus: true,
          taskType: true,
          taskPriority: true,
          reminderStatus: true,
        })
      );
    }
  }, [dispatch, enums?.taskStatus?.length]);

  return { enums, enumsLoading };
};
