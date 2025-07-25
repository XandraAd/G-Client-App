function LoadingIndicator() {
  return (
    <div className="fixed top-0 left-0 w-full h-screen bg-blue-700 bg-opacity-40 flex items-center justify-center z-50">
      <div className="w-12 h-12 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
    </div>
  );
}

export default LoadingIndicator;
