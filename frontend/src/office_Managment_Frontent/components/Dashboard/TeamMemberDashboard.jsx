import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { CheckCircle, Clock, AlertCircle, Calendar, ClipboardList, CalendarClock, Bell } from 'lucide-react';
import Card, { CardBody, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { fetchTasks } from '../../store/slice/task/taskSlice';
import { fetchDueDateDashboard } from '../../store/slice/dueDate/dueDateSlice';
import { getUserId, formatDateTime, formatDate, getClientDisplayName } from '../../helpers/commonFunctions';
import { useNavigate } from 'react-router-dom';
import Loader from '../Loader/Loader';

const TeamMemberDashboard = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { userDetails } = useSelector((state) => state.auth);
    const [stats, setStats] = useState({
        assignedTasks: 0,
        dueToday: 0,
        dueSoon: 0,
        overdue: 0,
        submitted: 0,
        completed: 0,
    });
    const [myTasks, setMyTasks] = useState([]);
    const [upcomingReminders, setUpcomingReminders] = useState([]);
    const [upcomingTasks, setUpcomingTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyTasks();
    }, []);

    const fetchMyTasks = async () => {
        const userId = getUserId() || userDetails?.id || userDetails?.userId;
        if (!userId) return;
        try {
            setLoading(true);
            const [result, dueDateResult] = await Promise.all([
                dispatch(fetchTasks({ assignedToId: userId, limit: 50 })).unwrap(),
                dispatch(fetchDueDateDashboard()).unwrap(),
            ]);
            const tasks = result.tasks || [];
            const dueDateSummary = dueDateResult.summary || {};
            const reminders = dueDateResult.upcomingReminders || [];
            const dueTasks = dueDateResult.upcomingTasks || [];

            const submitted = tasks.filter(t => t.status === 'SUBMITTED');
            const completed = tasks.filter(t => t.status === 'COMPLETED' || t.status === 'APPROVED');

            setStats({
                assignedTasks: dueDateSummary.totalPending ?? tasks.length,
                dueToday: dueDateSummary.dueToday ?? 0,
                dueSoon: dueDateSummary.dueSoon ?? 0,
                overdue: dueDateSummary.overdue ?? 0,
                submitted: submitted.length,
                completed: completed.length,
            });

            setMyTasks(tasks.slice(0, 10));
            setUpcomingReminders(reminders);
            setUpcomingTasks(dueTasks);
        } catch (error) {
            console.error('Error fetching my tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'COMPLETED': return 'bg-green-100 text-green-800';
            case 'APPROVED': return 'bg-emerald-100 text-emerald-800';
            case 'SUBMITTED': return 'bg-yellow-100 text-yellow-800';
            case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
            case 'OVERDUE': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const StatCard = ({ title, value, icon: Icon, bgColor }) => (
        <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">
                        {title}
                    </p>

                    <h2 className={`text-3xl font-bold `}>
                        {value}
                    </h2>
                </div>

                <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${bgColor}`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
        </div>
    );

    if (loading) {
        return <Loader inline />;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
                <p className="text-gray-500 mt-1">Welcome back, {userDetails?.name}!</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                <StatCard
                    title="Open Tasks"
                    value={stats.assignedTasks}
                    icon={ClipboardList}
                    bgColor="bg-blue-500"
                />

                <StatCard
                    title="Due Today"
                    value={stats.dueToday}
                    icon={Calendar}
                    bgColor="bg-orange-500"
                />

                <StatCard
                    title="Due Soon"
                    value={stats.dueSoon}
                    icon={CalendarClock}
                    bgColor="bg-cyan-500"
                />

                <StatCard
                    title="Overdue"
                    value={stats.overdue}
                    icon={AlertCircle}
                    bgColor="bg-red-500"
                />

                <StatCard
                    title="Submitted"
                    value={stats.submitted}
                    icon={Clock}
                    bgColor="bg-yellow-500"
                />

                <StatCard
                    title="Completed"
                    value={stats.completed}
                    icon={CheckCircle}
                    bgColor="bg-green-500"
                />

            </div>

            {upcomingReminders.length > 0 && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Upcoming Reminders (7 days)</h3>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate('/due-date-reminder')}
                        >
                            View All
                        </Button>
                    </CardHeader>
                    <CardBody>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {upcomingReminders.slice(0, 3).map((reminder) => (
                                <div
                                    key={reminder.id}
                                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                                    onClick={() => reminder.task?.id && navigate(`/tasks/${reminder.task.id}`)}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                                            {reminder.reminderType?.replace(/_/g, ' ') || 'REMINDER'}
                                        </span>
                                        <Bell size={16} className="text-gray-400" />
                                    </div>
                                    <p className="font-medium text-gray-900">{reminder.task?.title || 'Task'}</p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Client: {getClientDisplayName(reminder.task?.client) || '—'}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-2">
                                        Remind at: <strong>{formatDateTime(reminder.remindAt)}</strong>
                                    </p>
                                </div>
                            ))}
                        </div>
                    </CardBody>
                </Card>
            )}

            {/* My Tasks List */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">My Tasks</h3>
                    <Button
                        variant="primary"
                        size="sm"
                        styleClass='!w-auto'
                        onClick={() => navigate('/tasks')}
                    >
                        View All Tasks
                    </Button>
                </CardHeader>
                <CardBody>
                    <div className="space-y-3">
                        {myTasks.map((task) => (
                            <div
                                key={task.id}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                                onClick={() => navigate(`/tasks/${task.id}`)}
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h4 className="font-medium text-gray-900">{task.title}</h4>
                                        <span className={`px-2 py-0.5 text-sm rounded-full ${getStatusColor(task.status)}`}>
                                            {task.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        Client: {task.client?.name || '-'} | Due: {new Date(task.dueDate).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {task.priority === 'HIGH' && (
                                        <span className="px-2 py-1 text-sm bg-red-100 text-red-800 rounded">High Priority</span>
                                    )}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/task-completion?id=${task.id}`);
                                        }}
                                    >
                                        Update Status
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {myTasks.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                No tasks assigned yet
                            </div>
                        )}
                    </div>
                </CardBody>
            </Card>
        </div>
    );
};

export default TeamMemberDashboard;