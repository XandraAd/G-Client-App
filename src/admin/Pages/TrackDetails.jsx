// src/pages/TrackDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ReactModal from "react-modal";
import EditTrack from "../Components/forms/EditTracks";
import CalendarIcon from "../../assets/icons/calendarIcon.png";
import { FiEdit2 } from "react-icons/fi";
import { MdDeleteOutline } from "react-icons/md";
import { ImWarning } from "react-icons/im";

const TrackDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [track, setTrack] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);


 
    const fetchTrack = async () => {
      try {
        const res = await axios.get(`/api/tracks/${id}`);
        setTrack(res.data);
      } catch (error) {
        console.error("Failed to load track:", error);
      }
    };
     useEffect(() => {
    fetchTrack();
  }, [id]);




  if (!track) return <p>Loading track details...</p>;

  return (
    <>
      <h4 className="mt-10 text-[24px] font-semibold">Manage Tracks</h4>
      <p className="text-gray-400 text-[18px] font-normal">
        Filter, sort, and access detailed tracks
      </p>

      <div
        key={track.title}
        className=" mt-10  lg:m-24 min-w-full md:w-[50%] h-[70vh] lg:h-[60vh] lg:w-[70%] rounded-xl shadow-lg flex flex-col justify-between relative overflow-hidden "
      >
        <div
          className="rounded-t-md w-[70%] h-[400px] bg-no-repeat bg-cover min-w-full "
          style={{
            backgroundImage: `url(${track.bgImg})`,
          }}
        >
          <p className="text-xs mt-2 w-[20px]h-[20px] bg-white rounded absolute right-2">
            ${track.value}
          </p>
        </div>

        <div className="relative z-10 text-black">
          <h3 className="mt-2 px-2 text-[18px] font-semibold  w-56">
            {track.title}
          </h3>
          <div className="flex items-center mt-2 mx-2 text-gray-500 font-normal text-[14px]">
            <img src={CalendarIcon} alt="calendar" className="w-4 h-4" />
            <p className="ml-2">{track.duration}</p>
          </div>

          <div className="flex flex-wrap gap-2 my-4 ml-2">
            {track.program?.map((item, id) => (
              <span
                key={id}
                className="px-3 py-1 rounded-full text-xs"
                style={{ backgroundColor: item.bgColor, color: item.textColor }}
              >
                {item.label}
              </span>
            ))}
          </div>
          <div className="flex justify-end mb-4">
  <FiEdit2 
    className="text-green-700 text-[30px] p-2 rounded-full hover:bg-green-200 cursor-pointer" 
    onClick={() => setIsEditOpen(true)} 
  />
  <MdDeleteOutline 
    className="text-red-600 text-[30px] p-2 rounded-full hover:bg-red-200 cursor-pointer" 
    onClick={() => setIsDeleteOpen(true)} 
  />
</div>

            <ReactModal
        isOpen={isEditOpen}
        onRequestClose={() => setIsEditOpen(false)}
         className="bg-white rounded-lg  p-4 w-full max-w-md mx-auto mt-20 md:mt-40 outline-none relative"
         contentLabel="Add New Track"
        overlayClassName="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50"
      >
        <EditTrack track={track} onClose={() => setIsEditOpen(false)} refresh={fetchTrack} />
      </ReactModal>
      <ReactModal
  isOpen={isDeleteOpen}
  onRequestClose={() => setIsDeleteOpen(false)}
  className="bg-white rounded-lg p-6 w-full max-w-sm mx-auto mt-20 md:mt-40 outline-none relative text-center"
  overlayClassName="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
>
  <ImWarning className="w-20 mx-auto mb-4" />
 
  <h2 className="text-xl font-semibold mb-2">Delete this track?</h2>
  <p className="text-sm text-gray-500 mb-6">This action cannot be undone.</p>

  <div className="flex justify-center gap-4">
    <button
      onClick={async () => {
        try {
          await axios.delete(`http://localhost:5000/api/tracks/${id}`);
          navigate("/dashboard/tracks");
        } catch (err) {
          console.error("Failed to delete:", err);
        } finally {
          setIsDeleteOpen(false);
        }
      }}
      className="bg-red-600 text-white px-4 py-2 rounded"
    >
      Yes, Delete
    </button>
    <button
      onClick={() => setIsDeleteOpen(false)}
      className="bg-gray-300 text-black px-4 py-2 rounded"
    >
      Cancel
    </button>
  </div>
</ReactModal>

        </div>
      </div>
    </>
  );
};

export default TrackDetails;
