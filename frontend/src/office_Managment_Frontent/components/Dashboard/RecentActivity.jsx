import React from "react";
import { Clock } from "lucide-react";

const RecentActivity = ({ activities }) => {
  return (
    <div className="bg-white border border-gray-300 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-5 py-2.5 border-b border-gray-300 flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">Recent Activity</h3>
        <button className="text-cyanDark text-sm font-semibold">View All</button>
      </div>
      <div className="divide-y divide-gray-200">
        {activities.map((activity) => (
          <div key={activity.id} className="p-2.5 flex items-start gap-3 hover:bg-gray-50 transition-all">
            <div className={`${activity.bg} p-2 rounded-xl`}>
              <div className={activity.color}>{activity.icon}</div>
            </div>
            <div>
              <p className="text-sm text-gray-800 leading-relaxed">{activity.action}</p>
              <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                <Clock size={11} />
                {activity.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;