import React, { useState, useEffect } from 'react';
import { Users, ClipboardList, Receipt, AlertCircle, TrendingUp, CheckCircle, Clock, DollarSign } from 'lucide-react';
import Card, { CardBody, CardHeader } from '../../components/ui/Card';
import { taskApi } from '../../api/taskApi';
import { clientApi } from '../../api/clientApi';
import { invoiceApi } from '../../api/invoiceApi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Loader from '../Loader/Loader';
import { useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { getEnums } from '../../store/slice/auth/authSlice';

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <Card className="hover:shadow-lg transition-shadow">
        <CardBody className="p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                    {trend && (
                        <p className={`text-sm mt-2 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            {trend.isPositive ? '↑' : '↓'} {trend.value} from last month
                        </p>
                    )}
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
        </CardBody>
    </Card>
);

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalClients: 0,
        activeClients: 0,
        openTasks: 0,
        overdueTasks: 0,
        completedTasks: 0,
        pendingInvoices: 0,
        paidInvoices: 0,
        totalRevenue: 0,
    });
    const [recentTasks, setRecentTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [taskData, setTaskData] = useState([]);
    const [invoiceData, setInvoiceData] = useState([]);
    const [allInvoices, setAllInvoices] = useState([]);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { enums } = useSelector((state) => state.auth);

    useEffect(() => {
        dispatch(getEnums({ invoiceStatus: true }));
        fetchDashboardData();
    }, [dispatch]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [clientsRes, tasksRes, invoicesRes] = await Promise.all([
                clientApi.getAllClients(),
                taskApi.listTasks({ limit: 100 }),
                invoiceApi.getAllInvoices(),
            ]);

            const clients = clientsRes.data.data.clients || [];
            const tasks = tasksRes.data.data.tasks || [];
            const invoices = invoicesRes.data.data.invoices || [];

            const openTasks = tasks.filter(t => t.status !== 'COMPLETED' && t.status !== 'APPROVED' && t.status !== 'CANCELLED');
            const overdueTasks = tasks.filter(
                (t) => t.status === 'OVERDUE' || (t.dueDate && new Date(t.dueDate) < new Date() && !['COMPLETED', 'CANCELLED', 'APPROVED'].includes(t.status))
            );
            const completedTasks = tasks.filter(t => t.status === 'COMPLETED' || t.status === 'APPROVED');
            const pendingInvoices = invoices.filter(i => i.status === 'DRAFT' || i.status === 'SENT');
            const paidInvoices = invoices.filter(i => i.status === 'PAID');
            const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.total, 0);

            setStats({
                totalClients: clients.length,
                activeClients: clients.filter(c => c.status === 'ACTIVE').length,
                openTasks: openTasks.length,
                overdueTasks: overdueTasks.length,
                completedTasks: completedTasks.length,
                pendingInvoices: pendingInvoices.length,
                paidInvoices: paidInvoices.length,
                totalRevenue: totalRevenue,
            });

            setRecentTasks(tasks.slice(0, 5));

            setAllInvoices(invoices);

            // Chart data
            const taskStatusCount = {
                'DRAFT': tasks.filter(t => t.status === 'DRAFT').length,
                'ASSIGNED': tasks.filter(t => t.status === 'ASSIGNED').length,
                'IN_PROGRESS': tasks.filter(t => t.status === 'IN_PROGRESS').length,
                'SUBMITTED': tasks.filter(t => t.status === 'SUBMITTED').length,
                'APPROVED': tasks.filter(t => t.status === 'APPROVED').length,
                'COMPLETED': tasks.filter(t => t.status === 'COMPLETED').length,
            };
            setTaskData(Object.entries(taskStatusCount).map(([name, value]) => ({ name, value })));

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const invoiceStatusCount = {};
        const statuses = enums?.invoiceStatus;
        
        statuses.forEach(status => {
            invoiceStatusCount[status] = allInvoices.filter(i => i.status === status).length;
        });

        setInvoiceData(Object.entries(invoiceStatusCount).map(([name, value]) => ({ name, value })));
    }, [allInvoices, enums?.invoiceStatus]);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

    const TASK_STATUS = Object.freeze({
        DRAFT: "DRAFT",
        ASSIGNED: "ASSIGNED",
        IN_PROGRESS: "IN_PROGRESS",
        SUBMITTED: "SUBMITTED",
        APPROVED: "APPROVED",
        REJECTED: "REJECTED",
        COMPLETED: "COMPLETED",
        OVERDUE: "OVERDUE",
        CANCELLED: "CANCELLED",
    });

    const TASK_COLORS = {
        [TASK_STATUS.DRAFT]: '#94A3B8',
        [TASK_STATUS.ASSIGNED]: '#3B82F6',
        [TASK_STATUS.IN_PROGRESS]: '#8B5CF6',
        [TASK_STATUS.SUBMITTED]: '#e8c07d',
        [TASK_STATUS.APPROVED]: '#d69df5',
        [TASK_STATUS.COMPLETED]: '#059669',
        [TASK_STATUS.OVERDUE]: '#EF4444',
        [TASK_STATUS.CANCELLED]: '#6B7280',
        [TASK_STATUS.REJECTED]: '#DC2626',
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-500 mt-1">Overview of your CA office operations</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Clients"
                    value={stats.totalClients}
                    icon={Users}
                    color="bg-blue-500"
                    trend={{ isPositive: true, value: '12%' }}
                />
                <StatCard
                    title="Open Tasks"
                    value={stats.openTasks}
                    icon={ClipboardList}
                    color="bg-yellow-500"
                />
                <StatCard
                    title="Overdue Tasks"
                    value={stats.overdueTasks}
                    icon={AlertCircle}
                    color="bg-red-500"
                />
                <StatCard
                    title="Completed Tasks"
                    value={stats.completedTasks}
                    icon={CheckCircle}
                    color="bg-green-500"
                />
                <StatCard
                    title="Pending Invoices"
                    value={stats.pendingInvoices}
                    icon={Receipt}
                    color="bg-orange-500"
                />
                <StatCard
                    title="Paid Invoices"
                    value={stats.paidInvoices}
                    icon={DollarSign}
                    color="bg-purple-500"
                />
                <StatCard
                    title="Total Revenue"
                    value={`₹${stats.totalRevenue.toLocaleString()}`}
                    icon={TrendingUp}
                    color="bg-emerald-500"
                />
                <StatCard
                    title="Active Clients"
                    value={stats.activeClients}
                    icon={Users}
                    color="bg-teal-500"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <h3 className="text-base font-semibold text-gray-900">Task Status Distribution</h3>
                    </CardHeader>
                    <CardBody>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={taskData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => {
                                        if (percent < 0.05) return "";
                                        return `${name}: ${(percent * 100).toFixed(0)}%`;
                                    }}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {taskData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={TASK_COLORS[entry.name] || COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardBody>
                </Card>

                <Card>
                    <CardHeader>
                        <h3 className="text-base font-semibold text-gray-900">Invoice Status Distribution</h3>
                    </CardHeader>
                    <div className=' pt-5 pr-4'>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={invoiceData} >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" tick={{ fontSize: 14 }} />
                                <YAxis tick={{ fontSize: 14 }} />
                                <Tooltip
                                    contentStyle={{ fontSize: "14px" }}
                                    labelStyle={{ fontSize: "14px" }}
                                />
                                <Legend wrapperStyle={{ fontSize: "15px" }} />

                                <Bar dataKey="value" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* Recent Tasks */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <h3 className="text-base font-semibold text-gray-900">Recent Tasks</h3>
                    <button
                        onClick={() => navigate("/tasks")}
                        className="text-[15px] text-cyanDark underline"
                    >
                        View All
                    </button>
                </CardHeader>
                <CardBody>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase">Task Title</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase">Client</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase">Assigned To</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase">Due Date</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {recentTasks.map((task) => (
                                    <tr key={task.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">{task.title}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{task.client?.name || '-'}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{task.assignedTo?.name || '-'}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {new Date(task.dueDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 text-sm rounded-full ${task.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                                task.status === 'OVERDUE' ? 'bg-red-100 text-red-800' :
                                                    task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {task.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {recentTasks.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                                            No tasks found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
};

export default AdminDashboard;