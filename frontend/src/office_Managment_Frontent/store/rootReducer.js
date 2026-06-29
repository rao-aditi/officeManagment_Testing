import { combineReducers } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import storageImport from "redux-persist/lib/storage";
import authReducer from "./slice/auth/authSlice";
import clientReducer from "./slice/client/clientSlice";
import userReducer from "./slice/user/userSlice";
import taskReducer from "./slice/task/taskSlice";
import dueDateReducer from "./slice/dueDate/dueDateSlice";
import permissionReducer from "./slice/permission/permissionSlice";
import serviceTypeReducer from "./slice/serviceType/serviceTypeSlice";
import quotationReducer from "./slice/quotation/quotationSlice";
import paymentReducer from "./slice/payment/paymentSlice";
import documentReducer from "./slice/document/documentSlice";
import documentTypeReducer from "./slice/documentType/documentTypeSlice";
import googleDriveReducer from "./slice/googleDrive/googleDriveSlice";
import reportsReducer from "./slice/reports/reportsSlice";

const storage = storageImport.default || storageImport;

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"],
  version: 1,
};

const rootReducer = combineReducers({
  auth: authReducer,
  clients: clientReducer,
  users: userReducer,
  tasks: taskReducer,
  dueDates: dueDateReducer,
  permission: permissionReducer,
  serviceTypes: serviceTypeReducer,
  quotations: quotationReducer,
  payments: paymentReducer,
  documents: documentReducer,
  documentTypes: documentTypeReducer,
  googleDrive: googleDriveReducer,
  reports: reportsReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export default persistedReducer;
