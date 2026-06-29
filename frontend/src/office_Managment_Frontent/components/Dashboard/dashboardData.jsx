import {
  Calendar,
  Users,
  FileText,
  CheckCircle,
  DollarSign,
  UserPlus,
  Upload,
  Briefcase,
} from "lucide-react";

export const STATS_DATA = [
  {
    label: "Total Clients",
    value: "148",
    change: "+6 this month",
    trend: "up",
    icon: <Users size={23} />,
    bgColor: "bg-blue-100",
    textColor: "text-blue-600",
  },
  {
    label: "Active Tasks",
    value: "37",
    change: "12 overdue",
    trend: "alert",
    icon: <CheckCircle size={22} />,
    bgColor: "bg-amber-100",
    textColor: "text-amber-600",
  },
  {
    label: "Pending Invoices",
    value: "₹4.2L",
    change: "18 invoices",
    trend: "down",
    icon: <DollarSign size={22} />,
    bgColor: "bg-red-100",
    textColor: "text-red-600",
  },
  {
    label: "Due Dates",
    value: "9",
    change: "3 urgent",
    trend: "urgent",
    icon: <Calendar size={22} />,
    bgColor: "bg-purple-100",
    textColor: "text-purple-600",
  },
];

export const UPCOMING_DUES = [
  {
    id: 1,
    title: "GST Filing",
    client: "Mehta Traders Pvt. Ltd.",
    dueDate: "20 May 2026",
    status: "urgent",
    category: "GST",
  },
  {
    id: 2,
    title: "TDS Return",
    client: "Sharma & Sons",
    dueDate: "25 May 2026",
    status: "warning",
    category: "TDS",
  },
  {
    id: 3,
    title: "ITR Filing",
    client: "Patel Exports",
    dueDate: "31 Jul 2026",
    status: "normal",
    category: "ITR",
  },
];

export const CLIENT_TASKS = [
  {
    id: 1,
    client: "Mehta Traders",
    task: "GST Filing",
    status: "Overdue",
    type: "GST",
    dueDate: "20 May 2026",
    progress: 20,
  },
  {
    id: 2,
    client: "Sharma & Sons",
    task: "TDS Return",
    status: "In Progress",
    type: "TDS",
    dueDate: "25 May 2026",
    progress: 65,
  },
  {
    id: 3,
    client: "Patel Exports",
    task: "ITR Filing",
    status: "Pending",
    type: "ITR",
    dueDate: "31 Jul 2026",
    progress: 40,
  },
  {
    id: 4,
    client: "Kapoor Ltd",
    task: "GST Reconciliation",
    status: "Completed",
    type: "GST",
    dueDate: "15 May 2026",
    progress: 100,
  },
];

export const RECENT_ACTIVITIES = [
  {
    id: 1,
    action: "GST reconciliation completed for Kapoor Ltd.",
    time: "2m ago",
    icon: <CheckCircle size={18} />,
    color: "text-green-600",
    bg: "bg-green-100",
  },
  {
    id: 2,
    action: "Invoice generated for Desai Infra — ₹28,000",
    time: "18m ago",
    icon: <FileText size={16} />,
    color: "text-blue-600",
    bg: "bg-blue-100",
  },
  {
    id: 3,
    action: "New client added — Verma & Partners",
    time: "1h ago",
    icon: <UserPlus size={16} />,
    color: "text-emerald-600",
    bg: "bg-emerald-100",
  },
  {
    id: 4,
    action: "Document uploaded for Mehta Traders",
    time: "2h ago",
    icon: <Upload size={16} />,
    color: "text-orange-600",
    bg: "bg-orange-100",
  },
];

export const COMPLIANCE_DATA = [
  {
    category: "GST Filing",
    percentage: 72,
    color: "bg-blue-500",
  },
  {
    category: "TDS Returns",
    percentage: 58,
    color: "bg-amber-500",
  },
  {
    category: "ITR Filing",
    percentage: 40,
    color: "bg-green-500",
  },
  {
    category: "ROC Filing",
    percentage: 85,
    color: "bg-purple-500",
  },
];

export const RECENT_INVOICES = [
  {
    id: "INV-2047",
    client: "Mehta Traders",
    amount: "₹45,000",
    status: "Pending",
  },
  {
    id: "INV-2048",
    client: "Desai Infra",
    amount: "₹28,000",
    status: "Paid",
  },
  {
    id: "INV-2046",
    client: "Patel Exports",
    amount: "₹62,000",
    status: "Overdue",
  },
];