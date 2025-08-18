import React from 'react'

const CourseInsights = ({filters,setFilters}) => {
  return (
     <div>
      <select
        value={filters.month}
        onChange={(e) => setFilters({ ...filters, month: e.target.value })}
        className="border rounded-md px-3 py-1"
      >
        <option value="all">All Time</option>
        <option value="1">This Month</option>
        <option value="3">Last 3 Months</option>
        <option value="6">Last 6 Months</option>
      </select>
    </div>
  )
}

export default CourseInsights