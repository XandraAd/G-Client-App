// Components/report/TopCourses.js
import React from 'react';
import { FiUsers, FiTrendingUp, FiAward, FiBook } from 'react-icons/fi';

const TopCourses = ({ tracks = [], invoices = []}) => {
  // Calculate real enrollment data from paid invoices
  const calculateRealEnrollments = () => {
    const courseEnrollments = {};
    
    // Count enrollments from paid invoices
    invoices
      .filter(invoice => invoice.status?.toLowerCase() === 'paid')
      .forEach(invoice => {
        // Check items array
        if (invoice.items && Array.isArray(invoice.items)) {
          invoice.items.forEach(item => {
            const courseId = item.trackId || item.id;
            if (courseId) {
              courseEnrollments[courseId] = (courseEnrollments[courseId] || 0) + 1;
            }
          });
        }
        
        // Check direct trackId
        if (invoice.trackId && !invoice.items) {
          courseEnrollments[invoice.trackId] = (courseEnrollments[invoice.trackId] || 0) + 1;
        }
      });
    
    return courseEnrollments;
  };

  const realEnrollments = calculateRealEnrollments();
  const paidInvoicesCount = invoices.filter(inv => inv.status?.toLowerCase() === 'paid').length;

  // Get display courses with real enrollment data
  const getDisplayCourses = () => {
    return tracks
      .map(track => {
        const realEnrollmentCount = realEnrollments[track.id] || 0;
        const displayEnrollments = realEnrollmentCount > 0 ? realEnrollmentCount : (track.students || 0);
        
        return {
          id: track.id,
          name: track.title,
          enrollments: displayEnrollments,
          description: track.description,
          instructor: track.instructor,
          duration: track.duration,
          value: track.value,
          image: track.bgImg,
          hasRealEnrollmentData: realEnrollmentCount > 0,
          revenue: realEnrollmentCount > 0 ? realEnrollmentCount * (track.value || 0) : 0
        };
      })
      .sort((a, b) => b.enrollments - a.enrollments)
      .slice(0, 6); // Show top 6 courses
  };

  const displayCourses = getDisplayCourses();
  const hasRealEnrollments = displayCourses.some(course => course.hasRealEnrollmentData);
  const totalEnrollments = displayCourses.reduce((sum, course) => sum + course.enrollments, 0);
  const totalRevenue = displayCourses.reduce((sum, course) => sum + course.revenue, 0);

  // Summary stats
  const summaryStats = [
    {
      icon: FiBook,
      label: 'Total Tracks',
      value: tracks.length,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: FiUsers,
      label: 'Total Enrollments',
      value: totalEnrollments,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: FiTrendingUp,
      label: 'Paid Invoices',
      value: paidInvoicesCount,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      icon: FiAward,
      label: 'Active Tracks',
      value: displayCourses.filter(c => c.enrollments > 0).length,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Track Performance</h3>
          <p className="text-sm text-gray-500 mt-1">
            Track enrollment trends and popularity
          </p>
        </div>
        {hasRealEnrollments && (
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">{totalEnrollments}</div>
            <div className="text-sm text-gray-500">Total Enrollments</div>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {summaryStats.map((stat, index) => (
          <div key={index} className={`p-4 rounded-lg ${stat.bgColor} border border-gray-100`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600 mt-1 w-1/2">{stat.label}</p>
              </div>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Courses List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-gray-900">Top Performing Tracks</h4>
          <span className="text-sm text-gray-500">
            {displayCourses.filter(c => c.enrollments > 0).length} with enrollments
          </span>
        </div>

        {displayCourses.map((course, index) => (
          <div 
            key={course.id} 
            className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all duration-200"
          >
            {/* Course Rank */}
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${
              index === 0 ? 'bg-yellow-100 text-yellow-600 border border-yellow-200' :
              index === 1 ? 'bg-gray-100 text-gray-600 border border-gray-200' :
              index === 2 ? 'bg-orange-100 text-orange-600 border border-orange-200' :
              'bg-blue-100 text-blue-600 border border-blue-200'
            }`}>
              {index + 1}
            </div>

            {/* Course Image */}
            {course.image && (
              <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                <img 
                  src={course.image} 
                  alt={course.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Course Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h5 className="font-semibold text-gray-900 truncate">
                    {course.name}
                  </h5>
                  
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                    {course.instructor && (
                      <span>By {course.instructor}</span>
                    )}
                    {course.duration && (
                      <span>• {course.duration}</span>
                    )}
                    {course.value > 0 && (
                      <span className="text-green-600 font-semibold">
                        GHS {course.value}
                      </span>
                    )}
                  </div>

                  {course.description && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {course.description}
                    </p>
                  )}
                </div>

                {/* Enrollment Stats */}
                <div className="flex-shrink-0 text-right">
                  <div className={`flex items-center gap-2 justify-end ${
                    course.enrollments > 0 ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    <FiUsers className="w-4 h-4" />
                    <span className="font-semibold text-lg">
                      {course.enrollments}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {course.enrollments === 1 ? 'enrollment' : 'enrollments'}
                  </div>
                  
                  {course.hasRealEnrollmentData && course.revenue > 0 && (
                    <div className="text-xs text-green-600 font-medium mt-1">
                      Ghs {course.revenue.toLocaleString()} revenue
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              {totalEnrollments > 0 && course.enrollments > 0 && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>Enrollment share</span>
                    <span>{Math.round((course.enrollments / totalEnrollments) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${(course.enrollments / totalEnrollments) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {displayCourses.length === 0 && (
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <FiBook className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">No Courses Available</h4>
          <p className="text-gray-500 max-w-sm mx-auto">
            Create and publish courses to start tracking enrollment performance.
          </p>
        </div>
      )}

      {/* Footer Actions */}
      {displayCourses.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing top {displayCourses.length} of {tracks.length} courses
            </div>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              View all courses
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopCourses;