const ActivityTable = ({ activities = [] }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
      {activities.length > 0 ? (
        <ul className="space-y-5">
          {activities.map((activity) => (
            <li key={activity.id} className="text-sm text-gray-700 border-b pb-2 last:border-b-0">
              <span className="font-medium mr-2">{activity.name || activity.user || 'Unknown user'}</span> 
              {activity.action} 
              <span className="text-gray-500"> ({activity.date || activity.time})</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 py-4 text-center">No recent activities found</p>
      )}
    </div>
  );
};

export default ActivityTable;
