import { Link } from "react-router-dom";

const RoomNotExist = () => {
  const role = localStorage.getItem("role");
  return (
    <div className="poppins-medium flex justify-center">
      <div className="flex flex-col items-center">
        <p className="text-[10em]">
          4<span className="text-green-500">0</span>4
        </p>
        <h1 className="text-3xl font-sans">
          THE PAGE YOU REQUESTED COULD NOT FOUND
        </h1>
        <Link
          to={role === "teacher" ? "/home/library" : "/home/my_submission"}
          className="bg-green-500 text-white p-3 rounded-3xl w-1/6 mt-10 hover:bg-green-400 text-center"
        >
          HOME
        </Link>
      </div>
    </div>
  );
};

export default RoomNotExist;
