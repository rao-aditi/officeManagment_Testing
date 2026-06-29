import React, { memo } from "react";
import ClientTasksTable from "../../components/Dashboard/ClientTasksTable";
import RecentInvoices from "../../components/Dashboard/RecentInvoices";
import RecentActivity from "../../components/Dashboard/RecentActivity";

import {
  STATS_DATA,
  UPCOMING_DUES,
  CLIENT_TASKS,
  RECENT_ACTIVITIES,
  COMPLIANCE_DATA,
  RECENT_INVOICES,
} from "../../components/Dashboard/dashboardData";
import { ArrowDownRight, ArrowUpRight, DollarSign, PlusCircle, TrendingUp, UserPlus } from "lucide-react";
import UpcomingDues from "../../components/Dashboard/UpcomingDues";

const DashBoardPage = () => {

  const getTrendClass = (trend) => {
    if (trend === "up") return "bg-green-100 text-green-700";
    if (trend === "down") return "bg-red-100 text-red-700";
    if (trend === "alert") return "bg-amber-100 text-amber-700";
    return "bg-purple-100 text-purple-700";
  };

  return (
    <div className="min-h-screen">
      <div className="relative overflow-hidden rounded-3xl p-8 mb-5 bg-linear-to-br from-[#04364A] via-[#06506B] to-[#022B3A] shadow-lg">
        <div className="absolute top-0 right-0 w-60 h-60 bg-white/5 rounded-full -mr-16 -mt-16"></div>

        <div className="relative z-10 flex items-center justify-between flex-wrap gap-5">
          <div>
            <h1 className="text-3xl font-bold text-white">
              CA Office Dashboard
            </h1>
            <p className="text-white/70 mt-2 text-sm">
              Manage clients, compliance, invoices, due dates and office workflow efficiently.
            </p>
          </div>

          <div className="flex gap-3">
            <button className="bg-white/15 hover:bg-white/20 text-white px-5 py-3 rounded-xl backdrop-blur-sm transition-all flex items-center gap-2">
              <PlusCircle size={18} />
              Add Client
            </button>
            <button className="bg-white text-cyanDark px-5 py-3 rounded-xl font-medium hover:scale-105 transition-all">
              Generate Invoice
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-5">
        {STATS_DATA.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white border border-gray-300 rounded-2xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-center justify-between">
              <div className={`${stat.bgColor} p-3 rounded-2xl`}>
                <div className={stat.textColor}>{stat.icon}</div>
              </div>
              <div className={`text-sm font-semibold px-3 py-1 rounded-full ${getTrendClass(stat.trend)}`}>
                {stat.trend === "up" && <ArrowUpRight size={20} className="inline mr-1" />}
                {stat.trend === "down" && <ArrowDownRight size={20} className="inline mr-1" />}
                {stat.change}
              </div>
            </div>
            <h2 className="text-2xl font-extrabold text-gray-800 mt-1">{stat.value}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <UpcomingDues dues={UPCOMING_DUES} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <ClientTasksTable tasks={CLIENT_TASKS} />
          <RecentInvoices invoices={RECENT_INVOICES} />
        </div>

        <div className="space-y-6">
          <RecentActivity activities={RECENT_ACTIVITIES} />

          <div className="bg-white border border-gray-300 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-300">
              <h3 className="font-semibold text-gray-800">Compliance Completion</h3>
            </div>
            <div className="p-5 space-y-5">
              {COMPLIANCE_DATA.map((item, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{item.category}</span>
                    <span className="text-sm font-semibold text-gray-800">{item.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div className={`${item.color} h-full rounded-full`} style={{ width: `${item.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl p-5 text-white" style={{ background: 'linear-gradient(135deg, #022938 0%, #065273 100%)' }}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-8 -mb-8"></div>
            <div className="relative z-10">
              <h3 className="font-bold text-lg mb-2">Quick Actions</h3>
              <p className="text-white/80 text-sm mb-5">Create new task, invoice, or client in seconds</p>
              <div className="flex flex-wrap gap-2">
                <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 flex items-center gap-2">
                  <PlusCircle size={16} /> New Task
                </button>
                <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 flex items-center gap-2">
                  <DollarSign size={16} /> Invoice
                </button>
                <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 flex items-center gap-2">
                  <UserPlus size={16} /> Add Client
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default memo(DashBoardPage);