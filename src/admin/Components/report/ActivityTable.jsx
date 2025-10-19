import React from 'react';
import { 
  FiUser, 
  FiDollarSign, 
  FiBook, 
  FiCheckCircle, 
  FiClock,
  FiAlertCircle,
  FiTrendingUp
} from 'react-icons/fi';

const ActivityTable = ({ activities = [], loading = false }) => {
  // Activity type configuration with icons and colors
  const activityConfig = {
    enrollment: { icon: FiUser, color: 'text-blue-600 bg-blue-50', label: 'Enrollment' },
    payment: { icon: FiDollarSign, color: 'text-green-600 bg-green-50', label: 'Payment' },
    completion: { icon: FiCheckCircle, color: 'text-purple-600 bg-purple-50', label: 'Completion' },
    course: { icon: FiBook, color: 'text-orange-600 bg-orange-50', label: 'Course' },
    system: { icon: FiAlertCircle, color: 'text-red-600 bg-red-50', label: 'System' },
    default: { icon: FiClock, color: 'text-gray-600 bg-gray-50', label: 'Activity' }
  };

  // Get activity configuration based on type or action
  const getActivityConfig = (activity) => {
    const type = activity.type || activity.action?.toLowerCase() || 'default';
    
    if (type.includes('enroll') || type.includes('signup')) return activityConfig.enrollment;
    if (type.includes('payment') || type.includes('purchase')) return activityConfig.payment;
    if (type.includes('complete') || type.includes('finish')) return activityConfig.completion;
    if (type.includes('course') || type.includes('track')) return activityConfig.course;
    if (type.includes('system') || type.includes('error')) return activityConfig.system;
    
    return activityConfig.default;
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return 'Just now';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    
    return date.toLocaleDateString();
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex items-center gap-3 animate-pulse">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <FiTrendingUp className="w-4 h-4" />
          <span>Live updates</span>
        </div>
      </div>

      {activities.length > 0 ? (
        <div className="space-y-4">
          {activities.slice(0, 8).map((activity, index) => {
            const config = getActivityConfig(activity);
            const Icon = config.icon;
            
            return (
              <div 
                key={activity.id || index} 
                className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${config.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.userName || activity.user || 'Unknown User'}
                      </p>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {activity.description || activity.action || activity.title}
                      </p>
                    </div>
                    
                    {activity.amount && (
                      <div className="flex-shrink-0 text-right">
                        <span className="text-sm font-semibold text-green-600">
                          GHS {parseFloat(activity.amount).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      {config.label}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTime(activity.timestamp || activity.date || activity.time)}
                    </span>
                  </div>
                  
                  {activity.course && (
                    <div className="mt-2 text-xs text-gray-500">
                      Course: <span className="font-medium">{activity.course}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <FiClock className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Activity Yet</h4>
          <p className="text-gray-500 max-w-sm mx-auto">
            Recent user activities will appear here once learners start enrolling and completing courses.
          </p>
        </div>
      )}

      {activities.length > 8 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium">
            View All Activities ({activities.length})
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivityTable;