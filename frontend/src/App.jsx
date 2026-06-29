import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./office_Managment_Frontent/components/Login/Login";
import AppRoutes from "./office_Managment_Frontent/routes/AppRoutes";
import { ThemeProvider } from "./office_Managment_Frontent/helpers/ThemeContext";
import { AlertProvider } from "./office_Managment_Frontent/helpers/AlertContent";
import ProtectedLayout from "./office_Managment_Frontent/routes/ProtectedLayout";
import AppShell from "./office_Managment_Frontent/layouts/AppShell";
import Dashboard from "./gst_Frontend/pages/Dashboard";
import ModulePage from "./gst_Frontend/pages/ModulePage";
import MasterDataPage from "./gst_Frontend/pages/MasterDataPage";
 
export default function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/module/:moduleId" element={<ModulePage />} />
          <Route path="/master-data" element={<MasterDataPage />} />
        </Routes>
      </BrowserRouter>
 
      <ThemeProvider>
        <AlertProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
 
              <Route element={<ProtectedLayout />}>
                <Route element={<AppShell />}>
                  <Route path="/*" element={<AppRoutes />} />
                </Route>
              </Route>
 
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </AlertProvider>
      </ThemeProvider>
    </>
  );
}