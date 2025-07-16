import { HiOutlineUserGroup, HiCurrencyDollar } from "react-icons/hi2";
import { LiaFileInvoiceSolid } from "react-icons/lia";
import { MdArrowUpward } from "react-icons/md";
import TracksCards from "../Components/TracksCard";
import CalendarIcon from "../../assets/icons/calendarIcon.png"

const DashBoard = () => {
  // Card data array
  const statsCards = [
    {
      icon: HiOutlineUserGroup,
      iconTextColor: "text-green-600",
      title: "Total Learners",
      value: (12450).toLocaleString() ,
      metric: "12%",
      metricText: "vs last month",
      metricColor: "text-green-500",
    },
    {
      icon: HiCurrencyDollar,
      iconTextColor: "text-orange-600",
      title: "Revenues",
      value: ` $${(12450).toLocaleString()}`,
      metric: "12%",
      
      metricText: "vs last month",
      metricColor: "text-green-500",
    },
    {
      icon: LiaFileInvoiceSolid,
      iconTextColor: "text-blue-600",
      title: "Invoices",
      value: (100).toLocaleString(),
      metric: "2%",
      metricText: "vs last month",
      metricColor: "text-green-500",
    },
  ];

  return (
    <>
    {/* Stats Cards Section */}
      <p className="text-gray-400 text-[18px] font-normal">
        Track Activity,trends, and popular destination in real time
      </p>
      <div>
        
        <div className="my-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {statsCards.map((card) => (
            <div
              key={card.title}
              className="bg-white rounded-lg p-3 shadow-lg h-40 w-full"
            >
              <p className="text-[16px] text-gray-800 font-medium">{card.title}</p>

              <div className="flex items-center justify-between">
                <p className="text-[36px] font-semibold text-end">{card.value}</p>

                <div
                  className={`$ ${card.iconTextColor}   p-2 text-[60px]  rounded-lg `}
                >
                  <card.icon />
                </div>
              </div>

              <p className="text-[14px] font-medium  text-gray-500 my-2">
                <MdArrowUpward className="inline w-4 h-4 mr-1 t"  style={{ color: "#12B76A" }} />
                {card.metric && (
                  <span className={`${card.metricColor} `}>
                    {card.metric}{" "}
                  </span>
                )}
                {card.metricText}
              </p>
            </div>
          ))}
        </div>
      </div>
   {/* Tracks Cards Section */}
      <div className="py-2   min-h-full  ">
        <h4 className="text[20px] font-semibold text-gray-900">Tracks</h4>
     
        <div className="my-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ">
          {TracksCards.map((track) => (
            <div
              key={track.title}
              className=" rounded-xl shadow-lg flex flex-col justify-between relative overflow-hidden"
            >
               
              <div
                className="rounded-t-md w-[256px] h-[180px] bg-no-repeat bg-cover min-w-full "
                style={{
                  backgroundImage: `url(${track.bgImg})`,
                }}
              >
                <p className="text-xs mt-2 w-[20px]h-[20px] bg-white rounded absolute right-2">${track.value}</p>
              </div>
             

              <div className="relative z-10 text-black">
                
                <h3 className="mt-2 px-2 text-[18px] font-semibold  w-56">{track.title}</h3>
              <div className="flex items-center mt-2 text-gray-500 font-normal text-[14px]">
                   <img src={CalendarIcon} alt="calendar" className="w-4 h-4" />
                  <p className="ml-2">
                      {track.duration}
                    </p>
              </div>
                 



                <div>
                    {track.program.map((tech)=>(
                        <span  key={tech.label}     style={{
      backgroundColor: tech.bgColor,
      color: tech.textColor,
      fontSize: "10px",
      padding: "4px 8px",
      borderRadius: "9999px",
      marginRight: "6px",
      display: "inline-block",
    }}
>
                        {tech.label}
                        </span>

                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default DashBoard;
