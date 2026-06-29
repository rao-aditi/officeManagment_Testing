import React from 'react';
import { Routes, Route, Navigate, useOutletContext } from 'react-router-dom';
import AdminDashboard from '../components/Dashboard/AdminDashboard';
import TeamLeaderDashboard from '../components/Dashboard/TeamLeaderDashboard';
import TeamMemberDashboard from '../components/Dashboard/TeamMemberDashboard';
import ClientList from '../pages/ClientManagement/ClientList';
import TaskList from '../pages/TaskManagement/TaskList';
import TaskDetail from '../pages/TaskManagement/TaskDetail';
import AssignTask from '../pages/TaskManagement/AssignTask';
import TaskCompletion from '../pages/TaskManagement/TaskCompletion';
import ReassignSummary from '../pages/TaskManagement/ReassignSummary';
import DueDateReminder from '../pages/DueDateReminder/DueDateReminder';
import QuotationList from '../pages/QuotationAndFees/QuotationList';
import ServiceTypeMaster from '../pages/ServiceTypes/ServiceTypeMaster';
import InvoiceList from '../pages/QuotationAndFees/InvoiceList';
import Billing from '../pages/Billing/Billing';
import DocumentCenter from '../pages/Documents/DocumentCenter';
import DocumentTypeMaster from '../pages/Documents/DocumentTypeMaster';
import DynamicMessaging from '../pages/Messaging/DynamicMessaging';
import NotificationLink from '../pages/Messaging/NotificationLink';
import UserList from '../pages/UserManagement/UserList';
import UserForm from '../pages/UserManagement/UserForm';
import StaffPerformance from '../pages/UserManagement/StaffPerformance';
import PermissionMatrix from '../pages/Settings/PermissionMatrix';
import ProtectedRoute from './ProtectedRoute';
import { PERMISSION_KEYS } from '../helpers/permissions';
import InvoiceDetails from '../pages/QuotationAndFees/InvoiceDetails';
import ClientDetails from '../pages/ClientManagement/ClientDetail';
import ProfilePage from '../pages/profile/ProfilePage';
import ReportsPage from '../pages/Reports/ReportsPage';

const AppRoutes = () => {
  const { userRole } = useOutletContext() || {};

  const getDashboard = () => {
    const role = userRole?.toLowerCase();
    switch (role) {
      case 'admin': return <AdminDashboard />;
      case 'team_leader': return <TeamLeaderDashboard />;
      case 'team_member': return <TeamMemberDashboard />;
      default: return <AdminDashboard />;
    }
  };

  return (
    <Routes>
      <Route path="/officeManagment_DashBoard" element={getDashboard()} />

      <Route path="/profile" element={<ProfilePage />} />

      <Route
        path="/clients"
        element={
          <ProtectedRoute
            element={<ClientList />}
            anyPermissions={[
              PERMISSION_KEYS.VIEW_ALL_CLIENTS,
              PERMISSION_KEYS.VIEW_ASSIGNED_CLIENTS,
            ]}
          />
        }
      />

      <Route
        path= "/clients/:id"
        element={
          <ProtectedRoute
            element={<ClientDetails />}
            anyPermissions={[
              PERMISSION_KEYS.VIEW_ALL_CLIENTS,
              PERMISSION_KEYS.VIEW_ASSIGNED_CLIENTS,
            ]}
          />
        }
      />

      <Route path="/tasks" element={<TaskList />} />
      <Route path="/tasks/:id" element={<TaskDetail />} />
      <Route
        path="/assign-task"
        element={
          <ProtectedRoute
            element={<AssignTask />}
            permission={PERMISSION_KEYS.CREATE_TASK}
          />
        }
      />
      <Route path="/task-completion" element={<TaskCompletion />} />
      <Route
        path="/reassign-summary"
        element={
          <ProtectedRoute
            element={<ReassignSummary />}
            anyPermissions={[
              PERMISSION_KEYS.REASSIGN_TASK,
              PERMISSION_KEYS.REASSIGN_TASK_WITHIN_TEAM,
            ]}
          />
        }
      />

      <Route path="/due-date-reminder" element={<DueDateReminder />} />

      <Route
        path="/quotation"
        element={
          <ProtectedRoute
            element={<QuotationList />}
            anyPermissions={[
              PERMISSION_KEYS.CREATE_QUOTATION,
              PERMISSION_KEYS.VIEW_QUOTATION,
            ]}
          />
        }
      />

      <Route
        path="/service-types"
        element={
          <ProtectedRoute
            element={<ServiceTypeMaster />}
            anyPermissions={[
              PERMISSION_KEYS.CREATE_SERVICE_TYPE,
              PERMISSION_KEYS.UPDATE_SERVICE_TYPE,
              PERMISSION_KEYS.CREATE_CHANGE_FEES,
            ]}
          />
        }
      />

      <Route
        path="/invoice"
        element={
          <ProtectedRoute
            element={<InvoiceList />}
            permission={PERMISSION_KEYS.GENERATE_INVOICE}
          />
        }
      />

      <Route path="/invoices/:id" element={<InvoiceDetails />} />

      <Route
        path="/billing"
        element={
          <ProtectedRoute
            element={<Billing />}
            permission={PERMISSION_KEYS.GENERATE_INVOICE}
          />
        }
      />

      <Route
        path="/document-types"
        element={
          <ProtectedRoute
            element={<DocumentTypeMaster />}
            anyPermissions={[
              PERMISSION_KEYS.UPLOAD_DOCUMENTS,
              PERMISSION_KEYS.DELETE_DOCUMENTS,
              PERMISSION_KEYS.CREATE_DOCUMENT_TYPE,
              PERMISSION_KEYS.UPDATE_DOCUMENT_TYPE,
              PERMISSION_KEYS.DELETE_DOCUMENT_TYPE,
            ]}
          />
        }
      />

      <Route
        path="/documents"
        element={
          <ProtectedRoute
            element={<DocumentCenter />}
            anyPermissions={[
              PERMISSION_KEYS.UPLOAD_DOCUMENTS,
              PERMISSION_KEYS.DELETE_DOCUMENTS,
            ]}
          />
        }
      />

      <Route
        path="/dynamic-messaging"
        element={
          <ProtectedRoute
            element={<DynamicMessaging />}
            permission={PERMISSION_KEYS.SEND_CLIENT_MESSAGES}
          />
        }
      />
      <Route
        path="/notification-link"
        element={
          <ProtectedRoute
            element={<NotificationLink />}
            permission={PERMISSION_KEYS.SEND_CLIENT_MESSAGES}
          />
        }
      />

      <Route
        path="/users"
        element={
          <ProtectedRoute
            element={<UserList />}
            anyPermissions={[
              PERMISSION_KEYS.LIST_USERS,
              PERMISSION_KEYS.CREATE_USER,
            ]}
          />
        }
      />
      <Route
        path="/users/new"
        element={
          <ProtectedRoute
            element={<UserForm />}
            permission={PERMISSION_KEYS.CREATE_USER}
          />
        }
      />
      <Route
        path="/users/:id/edit"
        element={
          <ProtectedRoute
            element={<UserForm />}
            anyPermissions={[
              PERMISSION_KEYS.CREATE_USER,
              PERMISSION_KEYS.LIST_USERS,
            ]}
          />
        }
      />


      <Route
        path="/settings/permissions"
        element={
          <ProtectedRoute
            element={<PermissionMatrix />}
            permission={PERMISSION_KEYS.VIEW_AUDIT_LOGS}
          />
        }
      />

      <Route
        path="/reports"
        element={<Navigate to="/reports/tasks" replace />}
      />
      <Route
        path="/reports/:type"
        element={
          <ProtectedRoute
            element={<ReportsPage />}
            anyPermissions={[
              PERMISSION_KEYS.VIEW_REPORTS,
              PERMISSION_KEYS.VIEW_ALL_REPORTS
            ]}
          />
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
