import { MdArrowUpward ,MdArrowDownward} from "react-icons/md";

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
  <div className="bg-white rounded-lg p-4 shadow-md">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold  ">{title}</h3>
         
        </div>
        <div className={`text-6xl mt-20  ${iconTextColor}`}>
          <Icon />
        </div>
       
      </div>
         <p className="text-2xl font-bold mt-2">{value}</p>

       
      <div className="mt-3 text-sm text-gray-500 flex items-center">
        {metricColor.includes('green') ? (
          <MdArrowUpward className={`inline mr-1 ${metricColor}`} />
        ) : (
          <MdArrowDownward className={`inline mr-1 ${metricColor}`} />
        )}
        <span className={`${metricColor} mr-2`}>{metric}</span> {metricText}
      </div>
    </div>
  );
};

export default StatCard;
