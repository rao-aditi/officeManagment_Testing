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
              "view_all_clients",
              "view_assigned_clients",
            ]}
          />
        }
      />

      <Route
        path="/clients/:id"
        element={
          <ProtectedRoute
            element={<ClientDetails />}
            anyPermissions={[
              "view_all_clients",
              "view_assigned_clients",
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
            permission={"create_task"}
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
              "reassign_task",
              "reassign_task_within_team",
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
              "create_quotation",
              "view_quotation",
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
              "create_service_type",
              "update_service_type",
              "create_change_fees",
            ]}
          />
        }
      />

      <Route
        path="/invoice"
        element={
          <ProtectedRoute
            element={<InvoiceList />}
            permission={"generate_invoice"}
          />
        }
      />

      <Route path="/invoices/:id" element={<InvoiceDetails />} />

      <Route
        path="/billing"
        element={
          <ProtectedRoute
            element={<Billing />}
            permission={"generate_invoice"}
          />
        }
      />

      <Route
        path="/document-types"
        element={
          <ProtectedRoute
            element={<DocumentTypeMaster />}
            anyPermissions={[
              "upload_documents",
              "delete_documents",
              "create_document_type",
              "update_document_type",
              "delete_document_type",
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
              "upload_documents",
              "delete_documents",
            ]}
          />
        }
      />

      <Route
        path="/dynamic-messaging"
        element={
          <ProtectedRoute
            element={<DynamicMessaging />}
            permission={"send_client_messages"}
          />
        }
      />
      <Route
        path="/notification-link"
        element={
          <ProtectedRoute
            element={<NotificationLink />}
            permission={"send_client_messages"}
          />
        }
      />

      <Route
        path="/users"
        element={
          <ProtectedRoute
            element={<UserList />}
            anyPermissions={[
              "list_users",
              "create_user",
            ]}
          />
        }
      />
      <Route
        path="/users/new"
        element={
          <ProtectedRoute
            element={<UserForm />}
            permission={"create_user"}
          />
        }
      />
      <Route
        path="/users/:id/edit"
        element={
          <ProtectedRoute
            element={<UserForm />}
            anyPermissions={[
              "create_user",
              "list_users",
            ]}
          />
        }
      />


      <Route
        path="/settings/permissions"
        element={
          <ProtectedRoute
            element={<PermissionMatrix />}
            permission={"view_audit_logs"}
          />
        }
      />

      <Route
        path="/reports/:type"
        element={
          <ProtectedRoute
            element={<ReportsPage />}
            anyPermissions={[
              "view_all_reports",
              "view_operational_reports",
              "view_own_reports",
            ]}
          />
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
