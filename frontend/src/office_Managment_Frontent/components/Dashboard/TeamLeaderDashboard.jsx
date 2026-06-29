import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Users, ClipboardList, Clock, CheckCircle, AlertTriangle, CalendarClock, Bell } from 'lucide-react';
import Card, { CardBody, CardHeader } from '../../components/ui/Card';
import { fetchTasks, fetchAssignees } from '../../store/slice/task/taskSlice';
import { fetchUsers } from '../../store/slice/user/userSlice';
import { fetchDueDateDashboard } from '../../store/slice/dueDate/dueDateSlice';
import { formatDateTime, getClientDisplayName } from '../../helpers/commonFunctions';
import Loader from '../Loader/Loader';

const TeamLeaderDashboard = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { userDetails } = useSelector((state) => state.auth);
    const [stats, setStats] = useState({
        openTasks: 0,
        overdueTasks: 0,
        dueToday: 0,
        dueSoon: 0,
        completedTasks: 0,
        pendingApproval: 0,
        teamMembers: 0,
    });
    const [teamPerformance, setTeamPerformance] = useState([]);
    const [recentTasks, setRecentTasks] = useState([]);
    const [upcomingReminders, setUpcomingReminders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTeamData();
    }, []);

    const fetchTeamData = async () => {
        try {
            setLoading(true);

            const [tasksResult, dueDateResult, usersResult, assigneesResult] = await Promise.allSettled([
                dispatch(fetchTasks({ limit: 100 })).unwrap(),
                dispatch(fetchDueDateDashboard()).unwrap(),
                dispatch(fetchUsers({ limit: 100 })).unwrap(),
                dispatch(fetchAssignees()).unwrap(),
            ]);

            const tasks =
                tasksResult.status === 'fulfilled' ? tasksResult.value.tasks || [] : [];
            const dueDateSummary =
                dueDateResult.status === 'fulfilled' ? dueDateResult.value.summary || {} : {};
            const reminders =
                dueDateResult.status === 'fulfilled'
                    ? dueDateResult.value.upcomingReminders || []
                    : [];

            let teamMembers = [];
            if (usersResult.status === 'fulfilled') {
                teamMembers = (usersResult.value.users || []).filter(
                    (u) => u.role === 'TEAM_MEMBER' || u.roleRef?.name === 'TEAM_MEMBER'
                );
            }
            if (!teamMembers.length && assigneesResult.status === 'fulfilled') {
                teamMembers = assigneesResult.value || [];
            }

            const completedTasks = tasks.filter(t => t.status === 'COMPLETED' || t.status === 'APPROVED');
            const pendingApproval = tasks.filter(t => t.status === 'SUBMITTED');

            const performance = teamMembers.map(member => {
                const memberTasks = tasks.filter(
                    (t) => String(t.assignedTo?.id) === String(member.id)
                );
                const completed = memberTasks.filter(t => t.status === 'COMPLETED' || t.status === 'APPROVED').length;
                const overdue = memberTasks.filter(
                    (t) => t.status === 'OVERDUE' || (t.dueDate && new Date(t.dueDate) < new Date() && !['COMPLETED', 'CANCELLED', 'APPROVED'].includes(t.status))
                ).length;
                return {
                    ...member,
                    totalTasks: memberTasks.length,
                    completed,
                    overdue,
                    completionRate: memberTasks.length ? ((completed / memberTasks.length) * 100).toFixed(0) : 0,
                };
            });

            setStats({
                openTasks: dueDateSummary.totalPending ?? 0,
                overdueTasks: dueDateSummary.overdue ?? 0,
                dueToday: dueDateSummary.dueToday ?? 0,
                dueSoon: dueDateSummary.dueSoon ?? 0,
                completedTasks: completedTasks.length,
                pendingApproval: pendingApproval.length,
                teamMembers: teamMembers.length,
            });

            setTeamPerformance(performance);
            setRecentTasks(tasks.slice(0, 5));
            setUpcomingReminders(reminders);
        } catch (error) {
            console.error('Error fetching team data:', error);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ title, value, icon: Icon, bgColor }) => (
        <div className={`relative overflow-hidden rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300`}>
            <div className="relative flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">
                        {title}
                    </p>
                    <h2 className="text-3xl font-bold text-gray-900">
                        {value}
                    </h2>
                </div>

                <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${bgColor}`}>
                    <Icon className={`w-6 h-6 text-white`} />
                </div>
            </div>
        </div>
    );

    if (loading) {
        return <Loader />
    }

    return (
        <>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Team Leader Dashboard</h1>
                    <p className="text-gray-500 mt-1">
                        Welcome back, {userDetails?.name}! Monitor your team's performance and tasks.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6">

                    <StatCard
                        title="Overdue Tasks"
                        value={stats.overdueTasks}
                        icon={AlertTriangle}
                        bgColor="bg-red-600"
                    />

                    <StatCard
                        title="Due Today"
                        value={stats.dueToday}
                        icon={Clock}
                        bgColor="bg-orange-600"
                    />

                    <StatCard
                        title="Due Soon"
                        value={stats.dueSoon}
                        icon={CalendarClock}
                        bgColor="bg-blue-600"
                    />

                    <StatCard
                        title="Pending Approval"
                        value={stats.pendingApproval}
                        icon={CheckCircle}
                        bgColor="bg-yellow-700"
                    />

                    <StatCard
                        title="Team Members"
                        value={stats.teamMembers}
                        icon={Users}
                        bgColor="bg-purple-600"
                    />

                </div>

                {upcomingReminders.length > 0 && (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">Upcoming Reminders (7 days)</h3>
                            <button
                                type="button"
                                onClick={() => navigate('/due-date-reminder')}
                                className="text-sm text-[#04506B] font-semibold hover:underline"
                            >
                                View All
                            </button>
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

                {/* Team Performance */}
                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-semibold text-gray-900">Team Performance</h3>
                    </CardHeader>
                    <CardBody>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase">Team Member</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase">Total Tasks</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase">Completed</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase">Overdue</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase">Completion Rate</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {teamPerformance.length > 0 ? (
                                        teamPerformance.map((member) => (
                                            <tr key={member.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{member.name}</p>
                                                        <p className="text-sm text-gray-500">{member.email}</p>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-600">{member.totalTasks}</td>
                                                <td className="px-4 py-3 text-sm text-green-600">{member.completed}</td>
                                                <td className="px-4 py-3 text-sm text-red-600">{member.overdue}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-green-500 rounded-full"
                                                                style={{ width: `${member.completionRate}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-sm text-gray-600">{member.completionRate}%</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                                                No team members found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </>
    );
};

export default TeamLeaderDashboard;