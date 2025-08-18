const SkeletonLoader = ({ 
  width = "100%", 
  height = "1rem", 
  rounded = "md",
  className = "",
  count = 1 
}) => {
  const items = Array.from({ length: count });
  
  return (
    <>
      {items.map((_, index) => (
        <div
          key={index}
          className={`bg-gray-200 animate-pulse ${className}`}
          style={{
            width,
            height,
            borderRadius: rounded === "full" ? "9999px" : `${rounded}px`,
          }}
        />
      ))}
    </>
  );
};

export default SkeletonLoader;