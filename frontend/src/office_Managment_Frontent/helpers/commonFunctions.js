import { getStore } from "./storeRef";

export const getUserId = () => {
  const store = getStore();

  let userId = null;

  if (store) {
    const authState = store.getState()?.auth;

    userId =
      authState?.userDetails?.id ||
      authState?.userDetails?.userId ||
      authState?.userData?.id ||
      authState?.userData?.userId ||
      null;
  }

  if (!userId) {
    try {
      const savedUser = JSON.parse(localStorage.getItem("userData"));

      userId =
        savedUser?.id ||
        savedUser?.userId ||
        null;
    } catch (err) {
      console.warn("Error reading user from localStorage:", err);
    }
  }

  if (!userId) {
    console.warn("[getUserId] User ID not found!");
  }

  return userId;
};

export const truncateText = (text, maxLength = 50) => {
  if (!text) return "-";
  const plain = String(text).replace(/<[^>]+>/g, "");
  return plain.length > maxLength
    ? plain.substring(0, maxLength) + "..."
    : plain;
};

export const formatCurrencyINR = (amount) => {
  if (amount === null || amount === undefined || amount === "") return "--";

  const num = Number(amount);
  if (isNaN(num)) return "--";

  const abs = Math.abs(num);
  const sign = num < 0 ? "-" : "";

  if (abs >= 10000000) {
    // Crores
    return `${sign}₹ ${(abs / 10000000).toFixed(1).replace(/\.0$/, "")} Cr`;
  }

  if (abs >= 100000) {
    // Lakhs
    return `${sign}₹ ${(abs / 100000).toFixed(1).replace(/\.0$/, "")} L`;
  }

  // Normal formatting
  return `${sign}₹ ${abs.toLocaleString("en-IN")}`;
};

export const formatDate = (dateStr) => {
  if (!dateStr) return "-";

  const [year, month, day] = dateStr.split("T")[0].split("-");

  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec",
  ];
  return `${day}-${monthNames[Number(month) - 1]}-${year}`;
};

export const formatDateForInput = (dateStr) => {
  if (!dateStr) return "";
  return dateStr.split("T")[0]; // YYYY-MM-DD
};

export const getUserRole = () => {
  return localStorage.getItem("role"); // "distributor"
};

export const formatCurrencyINRToCommas = (amount) => {
  if (amount === null || amount === undefined || amount === "") return "--";

  return `₹ ${Number(amount).toLocaleString("en-IN")}`;
};


// Add this function to format dates for API requests
export const formatDateForAPI = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};


export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatDateTime = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getStatusColor = (status) => {
  const colors = {
    ACTIVE: 'green',
    INACTIVE: 'red',
    DRAFT: 'gray',
    ASSIGNED: 'blue',
    IN_PROGRESS: 'blue',
    SUBMITTED: 'yellow',
    APPROVED: 'green',
    REJECTED: 'red',
    COMPLETED: 'green',
    OVERDUE: 'red',
    CANCELLED: 'gray',
    SENT: 'blue',
    PAID: 'green',
    PARTIALLY_PAID: 'orange',
  };
  return colors[status] || 'gray';
};

export const getPriorityColor = (priority) => {
  const colors = {
    LOW: 'gray',
    MEDIUM: 'blue',
    HIGH: 'orange',
    URGENT: 'red',
  };
  return colors[priority] || 'gray';
};

export const formatEnumLabel = (value) => {
  if (!value) return "";
  return String(value)
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

export const getClientDisplayName = (client) => {
  if (!client) return "-";
  const fullName = [client.firstName, client.middleName, client.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  return (
    client.displayName ||
    client.businessName ||
    client.companyName ||
    client.legalName ||
    client.name ||
    fullName ||
    "-"
  );
};

export const toIsoDateTime = (localDateTime) => {
  if (!localDateTime) return undefined;
  return new Date(localDateTime).toISOString();
};

export const toLocalDateTimeInput = (isoString) => {
  if (!isoString) return "";
  const d = new Date(isoString);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
};


export const getTaskStatusBadge = (status) => {
  switch (status) {
    case "COMPLETED":
      return "bg-green-100 text-green-700 border border-green-200";

    case "APPROVED":
      return "bg-emerald-100 text-emerald-700 border border-emerald-200";

    case "IN_PROGRESS":
      return "bg-blue-100 text-blue-700 border border-blue-200";

    case "SUBMITTED":
      return "bg-indigo-100 text-indigo-700 border border-indigo-200";

    case "REJECTED":
      return "bg-red-100 text-red-700 border border-red-200";

    case "OVERDUE":
      return "bg-rose-100 text-rose-700 border border-rose-200";

    case "CANCELLED":
      return "bg-gray-100 text-gray-500 border border-gray-200";

    case "ASSIGNED":
      return "bg-cyan-100 text-cyan-700 border border-cyan-200";

    default:
      return "bg-gray-100 text-gray-700 border border-gray-200";
  }
};

export const getPriorityBadge = (priority) => {
  switch (priority) {
    case "URGENT":
      return "bg-red-100 text-red-700 border border-red-200";
    case "HIGH":
      return "bg-orange-100 text-orange-700 border border-orange-200";
    case "MEDIUM":
      return "bg-yellow-100 text-yellow-700 border border-yellow-200";
    case "LOW":
      return "bg-purple-100 text-purple-700 border border-purple-200";
    default:
      return "bg-gray-100 text-gray-700 border border-gray-200";
  }
};
