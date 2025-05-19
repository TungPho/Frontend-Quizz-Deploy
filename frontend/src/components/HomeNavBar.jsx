import { useContext, useEffect, useState } from "react";
import { IoMdArrowDropdown } from "react-icons/io";
import { IoMdClose } from "react-icons/io";
import { QuizzContext } from "../context/ContextProvider";
import { Link, useNavigate } from "react-router-dom";
import { IoLogOutOutline } from "react-icons/io5";
import { CgProfile } from "react-icons/cg";
import { FaExclamation } from "react-icons/fa6";
import { FaArrowRightLong } from "react-icons/fa6";
import { toast } from "react-toastify";
import NotificationComponent from "./NotificationComponent"; // Import the new component
import io from "socket.io-client";

const HomeNavBar = () => {
  const role = localStorage.getItem("role");
  const userID = localStorage.getItem("userID");

  const [isOpenEnterCode, setIsOpenEnterCode] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const { socket, setSocket, collapsed, examProgress, setExamProgress } =
    useContext(QuizzContext);
  const [isOpenProfileMenu, setIsOpenProfileMenu] = useState(false);
  const [isOpenYesNoMenu, setIsOpenYesNoMenu] = useState(false);
  const [isPermit, setIsPermit] = useState(false);
  const BACK_END_LOCAL_URL = import.meta.env.VITE_LOCAL_API_CALL_URL;
  const BACK_END_SOCKET_URL = import.meta.env.BACK_END_SOCKET_URL;

  const navigate = useNavigate();

  // userInfo
  const userName = localStorage.getItem("userName");
  const userEmail = localStorage.getItem("userEmail");
  const studentId = localStorage.getItem("studentId");
  //setSocket
  // io den orender.com
  useEffect(() => {
    setSocket(
      io(`https://backend-quizz-deploy.onrender.com`, {
        query: { userId: userID, role },
        withCredentials: true,
        extraHeaders: {
          "my-custom-header": "abcd",
        },
      })
    );
  }, [role, setSocket, userID]);

  useEffect(() => {
    socket.on("permit", (permission) => {
      if (permission.permit) {
        toast.success(permission.message);
        setIsPermit(true); // true
      } else {
        toast.error(permission.message);
      }
    });
  }, [socket]);

  useEffect(() => {
    const fetchExamProgress = async () => {
      const getExamReq = await fetch(
        `${BACK_END_LOCAL_URL}/exam_progress/${userID}`
      );
      const res = await getExamReq.json();

      setExamProgress(res.metadata[0]);
    };
    fetchExamProgress();
  }, [setExamProgress, userID]);

  const handleJoinRoom = () => {
    if (!isPermit) {
      console.log("progress", examProgress);
      socket.emit("requestToJoinRoom", roomCode, examProgress?.examId || "", {
        studentName: userName,
        student_id_db: userID,
      });
      return;
    }
    // emit an event ro join room
    socket.emit("joinRoom", roomCode, {
      name: userName,
      student_id_db: userID,
      student_id: studentId,
    });
    // actually enter the exam
    navigate(`/main_exam`, {
      state: {
        room: roomCode,
      },
    });
  };

  const handleLogOut = () => {
    localStorage.clear();
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (!event.target.closest(".menu-content")) {
        setIsOpenProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative">
      {/* Confirmation Dialog */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 ${
          isOpenYesNoMenu ? "" : "hidden"
        }`}
      >
        <div className="bg-white rounded-lg p-6 shadow-xl w-full max-w-md mx-4">
          <div className="flex justify-center mb-4">
            <div className="bg-green-50 p-4 rounded-full">
              <FaExclamation className="text-green-500 text-3xl" />
            </div>
          </div>

          <h2 className="text-2xl font-medium text-center text-gray-700 mb-6">
            Are you leaving?
          </h2>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setIsOpenYesNoMenu(false)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                handleLogOut();
                navigate("/");
              }}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-green-300"
            >
              <span>Yes</span>
              <FaArrowRightLong />
            </button>
          </div>
        </div>
      </div>

      {/* Navbar */}
      <div
        className={`flex items-center justify-end h-16 shadow-md bg-white sticky top-0 z-20 transition-all duration-300 ease-in-out ${
          collapsed ? "ml-16" : "ml-64"
        }`}
      >
        <div className="flex items-center space-x-3 mr-6">
          {/* Notification Bell - Replace the old bell with our new component */}
          <NotificationComponent />

          {/* Enter Code Button - Only for students */}
          {role !== "teacher" && (
            <button
              onClick={() => setIsOpenEnterCode(true)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Enter Code
            </button>
          )}

          {/* Profile Menu */}
          <div className="relative menu-content">
            <button
              onClick={() => setIsOpenProfileMenu(!isOpenProfileMenu)}
              className="flex items-center space-x-1 px-2 py-1 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              <img
                className="w-8 h-8 rounded-full object-cover"
                src="/images/avatar.png"
                alt="Profile"
              />
              <IoMdArrowDropdown className="text-gray-600" />
            </button>

            {/* Profile Dropdown Menu */}
            <div
              className={`absolute right-0 top-12 w-64 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden transition-all duration-200 ${
                isOpenProfileMenu
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-2 pointer-events-none"
              }`}
            >
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <img
                    className="w-10 h-10 rounded-full object-cover"
                    src="/images/avatar.png"
                    alt="Profile"
                  />
                  <div>
                    <p className="font-medium text-gray-800">{userName}</p>
                    <p className="text-sm text-gray-500">{userEmail}</p>
                  </div>
                </div>
              </div>

              <div className="py-1">
                <Link
                  to="/my_profile"
                  className="flex items-center px-4 py-2.5 hover:bg-gray-50 text-gray-700 menu-content"
                >
                  <CgProfile className="mr-3 text-gray-500" />
                  <span>View profile</span>
                </Link>

                <button
                  onClick={() => setIsOpenYesNoMenu(true)}
                  className="flex items-center w-full text-left px-4 py-2.5 hover:bg-gray-50 text-gray-700 menu-content"
                >
                  <IoLogOutOutline className="mr-3 text-gray-500" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enter Code Modal */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 ${
          isOpenEnterCode ? "" : "hidden"
        }`}
      >
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium text-gray-800">Join Room</h2>
            <button
              onClick={() => setIsOpenEnterCode(false)}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <IoMdClose className="text-xl text-gray-600" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="room_code"
              >
                Room Code
              </label>
              <input
                id="room_code"
                type="text"
                placeholder="Enter room code"
                onChange={(e) => setRoomCode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="student_id"
              >
                Student ID
              </label>
              <input
                disabled={true}
                id="student_id"
                type="text"
                placeholder="Ex: 211210244"
                value={studentId}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="student_name"
              >
                Your Name
              </label>
              <input
                id="student_name"
                type="text"
                placeholder="Enter your name"
                disabled={true}
                value={userName}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <button
              onClick={() => {
                handleJoinRoom();
              }}
              className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-green-300 focus:ring-offset-2"
            >
              {isPermit ? "Join now!" : "Request to join room"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeNavBar;
