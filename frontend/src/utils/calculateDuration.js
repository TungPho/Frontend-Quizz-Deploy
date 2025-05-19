const calculateDuration = (startTime, endTime) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const diffInMinutes = Math.floor((end - start) / (1000 * 60));
  return `${diffInMinutes} phút`;
};

export default calculateDuration;
