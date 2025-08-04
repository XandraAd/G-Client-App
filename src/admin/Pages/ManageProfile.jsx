import React from 'react'
import AdminProfileUpdate from '../Components/forms/AdminProfileUpdate'

const ManageProfile = () => {
  return (
    <div>
         <h4 className="mt-10 text-[24px] font-semibold">Manage Profile</h4>
      <p className="text-gray-400 text-[18px] font-normal">
        Update Profile Details
      </p>
       <div className="flex items-center justify-between gap-2 my-4">
        <AdminProfileUpdate className=""/>
       </div>
    </div>
  )
}

export default ManageProfile