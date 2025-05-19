import { useContext, useEffect } from "react";
import { QuizzContext } from "../context/ContextProvider";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { FaClock } from "react-icons/fa";
import axios from "axios";
import io from "socket.io-client";
import RoomNotExist from "../components/RoomNotExist";
import { toast } from "react-toastify";
import NotificationComponent from "../components/NotificationComponent";

const Room = () => {
  const { roomID } = useParams();
  const userID = localStorage.getItem("userID");
  const role = localStorage.getItem("role");
  const { socket, setSocket } = useContext(QuizzContext);
  const [data, setData] = useState([]);
  const { classID } = useLocation().state;
  const [isRoomExist, setIsRoomExist] = useState(true);
  const navigate = useNavigate();
  const [studentList, setStudentList] = useState([]);
  // test info
  const [teacherId, setTeacherId] = useState("");
  const [testName, setTestname] = useState("");
  const [testDuration, setTestDuration] = useState(0);
  const [className, setClassName] = useState("");
  // Exam timing states
  const [examStarted, setExamStarted] = useState(false);
  const [examEnded, setExamEnded] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [remainingTime, setRemainingTime] = useState(null);

  // Hàm helper để lưu trạng thái vào localStorage
  const saveExamState = (started, startTimeValue, endTimeValue) => {
    const examState = {
      examStarted: started,
      startTime: startTimeValue ? startTimeValue.toISOString() : null,
      endTime: endTimeValue ? endTimeValue.toISOString() : null,
    };
    localStorage.setItem(`exam_state_${roomID}`, JSON.stringify(examState));
  };

  // Hàm helper để lấy trạng thái từ localStorage
  const loadExamState = () => {
    const savedState = localStorage.getItem(`exam_state_${roomID}`);
    if (savedState) {
      const { examStarted, startTime, endTime } = JSON.parse(savedState);
      setExamStarted(examStarted);
      setStartTime(startTime ? new Date(startTime) : null);
      setEndTime(endTime ? new Date(endTime) : null);
    }
  };

  useEffect(() => {
    const fetchStudentList = async () => {
      const req = await fetch(
        `http://localhost:3000/api/v1/get_all_students/${classID}`
      );
      console.log(req);
      const res = await req.json();
      sessionStorage.setItem("student_list", JSON.stringify(res.metadata));
      setStudentList(res.metadata);
    };
    const sessionList = JSON.parse(sessionStorage.getItem("student_list"));
    if (sessionList) {
      setStudentList(sessionList);
    } else {
      fetchStudentList();
    }
  }, [classID]);

  useEffect(() => {
    // Khôi phục trạng thái bài kiểm tra từ localStorage
    loadExamState();

    socket.emit("getRoomById", roomID);
    socket.emit("checkRoomExist", roomID);

    socket.on("studentData", (studentData) => {
      setTestDuration(studentData[0].duration);
      setTestname(studentData[0].test_name);
      setData(studentData);
      setTeacherId(studentData[0].teacher_id);
      setClassName(studentData[0].className);
    });

    socket.on("isRoomExist", (roomExist) => {
      setIsRoomExist(roomExist);
    });
    return () => {
      socket.off("studentData");
      socket.off("getRoomById");
      socket.off("isRoomExist");
    };
  }, [roomID, socket, testDuration]);

  // Timer effect to update remaining time
  useEffect(() => {
    let interval;

    if (examStarted && endTime) {
      interval = setInterval(() => {
        const now = new Date();
        const remaining = endTime - now;

        if (remaining <= 0) {
          setRemainingTime("Exam ended");
          clearInterval(interval);
          // Kiểm tra nếu đã hết thời gian mà chưa kết thúc bài kiểm tra
          if (!examEnded) {
            toast.warning("Exam time is up!");
          }
        } else {
          const minutes = Math.floor(remaining / 60000);
          const seconds = Math.floor((remaining % 60000) / 1000);

          setRemainingTime(`${minutes}:${seconds < 10 ? "0" : ""}${seconds}`);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [examStarted, endTime, examEnded]);

  useEffect(() => {
    setSocket(
      io("ws://localhost:3000", {
        query: { userId: userID, role },
      })
    );
  }, [role, setSocket, userID]);

  // Show modal when exam ended
  useEffect(() => {
    if (examEnded) {
      setShowModal(true);
      // Xóa trạng thái bài kiểm tra khỏi localStorage khi bài kiểm tra kết thúc
      localStorage.removeItem(`exam_state_${roomID}`);
    }
  }, [examEnded, roomID]);

  const handleForceSubmit = (studentId, roomID) => {
    socket.emit("requestForceSubmit", studentId, roomID);
  };

  const handleStartExam = () => {
    const now = new Date();
    const newEndTime = new Date(now.getTime() + testDuration * 60000);

    // Cập nhật state
    setStartTime(now);
    setEndTime(newEndTime);
    setExamStarted(true);

    // Lưu trạng thái vào localStorage
    saveExamState(true, now, newEndTime);

    // Emit the start exam event with the current time
    socket.emit("requestStartExam", roomID, now.toISOString());
  };

  // END EXAM
  const handleEndExam = () => {
    if (!examStarted) {
      toast.error("The Test Has'nt started yet!");
      return;
    }
    const confirm = window.confirm("Are you sure you want to end the exam ? ");
    // loop through every students to force submit
    if (!confirm) return;

    setIsLoading(true);
    data.forEach((d) => {
      if (d.student_id_db) {
        handleForceSubmit(d.student_id_db, roomID);
      }
    });
    // create test history here
    const newTestHistory = {
      testName: testName,
      className: className,
      classId: classID,
      roomId: roomID,
      teacherId: teacherId,
      startTime: startTime,
      endTime: endTime,
    };
    //
    setTimeout(async () => {
      try {
        const req = await axios.post(
          "http://localhost:3000/api/v1/test_history",
          JSON.stringify(newTestHistory),
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        console.log(req.data);
        setIsLoading(false);
        setExamEnded(true);
        socket.emit("deleteRoom", roomID);

        // Xóa trạng thái bài kiểm tra khỏi localStorage khi bài kiểm tra kết thúc
        localStorage.removeItem(`exam_state_${roomID}`);
      } catch (error) {
        console.log(error);
        setIsLoading(false);
        console.log(error);
        toast.error("Failed to save test history");
      }
    }, 1000);
  };

  // Function to format date to display time
  const formatTime = (date) => {
    return date
      ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "";
  };

  const handleNavigateToHistory = () => {
    navigate("/home/test_history");
  };

  return isRoomExist ? (
    <div className="bg-green-400 min-h-screen p-4">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <button
              onClick={() => {
                navigate(`/teacher_class/${classID}`);
              }}
              className="text-3xl mr-3 hover:bg-green-100 p-2 rounded-full transition-colors"
            >
              <IoIosArrowRoundBack />
            </button>
            <div>
              <h1 className="text-xl font-bold">Room: {roomID}</h1>
              <h1 className="text-xl font-bold">Test: {testName}</h1>

              <p className="text-gray-600">
                {data.length - 1} / {studentList.length} Students
              </p>
            </div>
          </div>

          <div className="flex flex-col md:items-end">
            <NotificationComponent />
            <p className="font-medium">
              Duration:{" "}
              <span className="font-bold">{testDuration} minutes</span>
            </p>

            {!examStarted ? (
              <button
                onClick={handleStartExam}
                className="mt-2 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md transition-colors font-medium"
              >
                Start Exam
              </button>
            ) : (
              <div className="mt-2 p-3 bg-green-100 rounded-md">
                <div className="flex items-center text-green-800 font-medium mb-1">
                  <FaClock className="mr-2" />
                  Remaining: {remainingTime}
                </div>
                <div className="text-sm text-green-700">
                  Started: {formatTime(startTime)} • Ends: {formatTime(endTime)}
                </div>
              </div>
            )}
            <button
              onClick={() => {
                handleEndExam();
              }}
              disabled={isLoading}
              className="mt-2 bg-red-500 hover:bg-red-600 text-white py-2 px-5 rounded-md transition-colors font-medium flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-green-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </>
              ) : (
                "End Exam"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Student List Section */}
      <div className="overflow-x-auto">
        <div className="bg-white rounded-lg shadow-md">
          {/* Table Header */}
          <div className="grid grid-cols-7 font-semibold text-center p-3 border-b">
            <div className="col-span-1">Name</div>
            <div className="col-span-1">ID</div>
            <div className="col-span-1">State</div>
            <div className="col-span-1">Question</div>
            <div className="col-span-1">Violations</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1">Action</div>
          </div>

          {/* Table Body */}
          {data.map((student, index) => {
            // exclude the teacher
            if (student.teacher_id) return null;
            return (
              <div
                key={index}
                className="grid grid-cols-7 border-b text-center p-3 hover:bg-green-50"
              >
                <div className="col-span-1 truncate">{student.name}</div>
                <div className="col-span-1 truncate">{student.student_id}</div>
                <div
                  className={`col-span-1 ${
                    student.state === "joined"
                      ? "text-green-500"
                      : "text-red-500"
                  } font-medium`}
                >
                  {student.state}
                </div>
                <div className="col-span-1">{student.current_question}</div>
                <div className="col-span-1 text-red-500 font-medium">
                  {student.number_of_violates} times
                </div>
                <div
                  className={`col-span-1 ${
                    student.status === "Not Submitted"
                      ? "text-red-500"
                      : "text-green-500"
                  } font-medium`}
                >
                  {student.status}
                </div>
                <div className="col-span-1">
                  <button
                    onClick={() =>
                      handleForceSubmit(student.student_id_db, roomID)
                    }
                    className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm transition-colors"
                  >
                    Force Submit
                  </button>
                </div>
              </div>
            );
          })}

          {/* Empty state if no students */}
          {(!data.length || (data.length === 1 && data[0].teacher_id)) && (
            <div className="p-8 text-center text-gray-500">
              No students have joined this room yet.
            </div>
          )}
        </div>
      </div>

      {/* Modal when exam ended */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Exam Completed</h2>
            <p className="mb-6">
              The exam has been ended successfully and all responses have been
              recorded.
            </p>
            <div className="flex justify-end">
              <button
                onClick={handleNavigateToHistory}
                className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md transition-colors font-medium"
              >
                View Test History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  ) : (
    <RoomNotExist />
  );
};

export default Room;
