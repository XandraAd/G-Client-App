import React from "react";
import Img1 from "../../assets/icons/image1.png";
import Img2 from "../../assets/icons/image2.png";
import Img3 from "../../assets/icons/image3.png";
import Img4 from "../../assets/icons/image4.png";

const userInfo = [
  {index:"1",
    name: "James Anderson",
    amount: "$320",
    img:  Img1 ,
  },
  {
    index:"2",
    name: "Micheal Johnson",
    amount: "$210",
    img: Img2 ,
  },
  {
    index:"3",
    name: "David Brown",
    amount: "$315",
    img: Img3 ,
  },
  {
    index:"4",
    name: "Orlando diggs",
    amount: "$250",
    img: Img4 ,
  },
];

const LatestInvoice = () => {
  return (
    <div className="bg-white p-6 rounded shadow-md w-full  mx-auto min-h-[400px]">
      <p className="flex items-center mb-2 font-semibold text-[20px] ml-6">
        Latest Invoice
      </p>
      <hr className="w-[90%] text-gray-300 ml-6 mb-8 h-4" />

      {/* Labels Row */}
      <div
        className="flex justify-between px-4 py-2 font-normal text-sm lg:text-[12px]  uppercase "
        style={{ color: "#7F7E83" }}
      >
        <span>Name</span>
        <span>Amount</span>
      </div>

      <div className="space-y-2.5 h-[200px] ">
        {userInfo.map((user, index) => {
          const bgColor = index % 2 === 0 ? "bg-white" : "bg-gray-50";
          return (
            <div
              key={user.index}
              className={`flex items-center justify-between px-2 shadow h-[20%] ${bgColor}`}
            >
              {/* Left: Image + Name */}
              <div className="flex items-center gap-3">
                <img
                  src={user.img}
                  alt={user.name}
                  className="w-6 h-6 rounded-full object-cover"
                />
                <p className="text-sm font-semibold ">{user.name}</p>
              </div>
              {/* Right: Amount */}
              <p className="text-sm font-semibold text-gray-700">
                {user.amount}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LatestInvoice;
