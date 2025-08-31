import { MdArrowUpward, MdArrowDownward } from "react-icons/md";

const StatCard = ({
  icon: Icon,
  iconTextColor,
  title,
  value,
  metric,
  metricText,
  metricColor,
}) => {
  return (
    <div className="bg-white rounded-lg p-4 sm:p-5 shadow-md hover:shadow-lg transition-shadow duration-200">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-sm sm:text-base font-medium text-gray-600">{title}</h3>
          <p className="text-2xl sm:text-3xl font-bold mt-1 sm:mt-2 text-gray-800">
            {value}
          </p>
        </div>
        
        <div className={`text-3xl sm:text-4xl md:text-5xl ${iconTextColor} flex-shrink-0 ml-3`}>
          <Icon />
        </div>
      </div>

      <div className="mt-3 sm:mt-4 text-xs sm:text-sm flex items-center">
        {metricColor.includes('green') ? (
          <MdArrowUpward className={`inline mr-1 ${metricColor}`} />
        ) : (
          <MdArrowDownward className={`inline mr-1 ${metricColor}`} />
        )}
        <span className={`${metricColor} font-medium mr-1`}>{metric}</span> 
        <span className="text-gray-500">{metricText}</span>
      </div>
    </div>
  );
};

export default StatCard;