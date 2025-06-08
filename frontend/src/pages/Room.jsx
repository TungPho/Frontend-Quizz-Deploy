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
  const BACK_END_LOCAL_URL = import.meta.env.VITE_LOCAL_API_CALL_URL;

  const { roomID } = useParams();
  const userID = localStorage.getItem("userID");
  const role = localStorage.getItem("role");
  const { socket, setSocket } = useContext(QuizzContext);
  const [data, setData] = useState([]);
  const { classID } = useLocation().state;
  const [isRoomExist, setIsRoomExist] = useState(null); // null để biết chưa check
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

  // Loading states - Đơn giản hóa
  const [isLoading, setIsLoading] = useState(false);
  const [isPageReady, setIsPageReady] = useState(false); // Thay thế cho isPageLoading
  const [isStartingExam, setIsStartingExam] = useState(false);
  const [forceSubmitLoading, setForceSubmitLoading] = useState({});

  // Tracking completion states
  const [roomDataLoaded, setRoomDataLoaded] = useState(false);
  const [studentListLoaded, setStudentListLoaded] = useState(false);
  const [roomExistenceChecked, setRoomExistenceChecked] = useState(false);

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

  const loadExamState = () => {
    const savedState = localStorage.getItem(`exam_state_${roomID}`);
    if (savedState) {
      const { examStarted, startTime, endTime } = JSON.parse(savedState);
      setExamStarted(examStarted);
      setStartTime(startTime ? new Date(startTime) : null);
      setEndTime(endTime ? new Date(endTime) : null);
    }
  };

  // Check if all data is loaded
  useEffect(() => {
    if (roomDataLoaded && studentListLoaded && roomExistenceChecked) {
      setIsPageReady(true);
    }
  }, [roomDataLoaded, studentListLoaded, roomExistenceChecked]);

  useEffect(() => {
    const fetchStudentList = async () => {
      try {
        const req = await fetch(
          `${BACK_END_LOCAL_URL}/get_all_students/${classID}`
        );
        const res = await req.json();
        sessionStorage.setItem("student_list", JSON.stringify(res.metadata));
        setStudentList(res.metadata);
      } catch (error) {
        console.error("Error fetching student list:", error);
        toast.error("Failed to load student list");
      } finally {
        setStudentListLoaded(true);
      }
    };

    const sessionList = JSON.parse(sessionStorage.getItem("student_list"));
    if (sessionList) {
      setStudentList(sessionList);
      setStudentListLoaded(true);
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
      setRoomDataLoaded(true);
    });

    socket.on("isRoomExist", (roomExist) => {
      setIsRoomExist(roomExist);
      setRoomExistenceChecked(true);
    });

    return () => {
      socket.off("studentData");
      socket.off("getRoomById");
      socket.off("isRoomExist");
    };
  }, [roomID, socket]);

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
      io(`https://backend-quizz-deploy.onrender.com`, {
        query: { userId: userID, role },
        withCredentials: true,
        extraHeaders: {
          "my-custom-header": "abcd",
        },
      })
    );
  }, [role, setSocket, userID]);

  // Show modal when exam ended
  useEffect(() => {
    if (examEnded) {
      setShowModal(true);
      localStorage.removeItem(`exam_state_${roomID}`);
    }
  }, [examEnded, roomID]);

  const handleForceSubmit = async (studentId, roomID) => {
    setForceSubmitLoading((prev) => ({ ...prev, [studentId]: true }));
    try {
      socket.emit("requestForceSubmit", studentId, roomID);
      setTimeout(() => {
        setForceSubmitLoading((prev) => ({ ...prev, [studentId]: false }));
      }, 2000);
    } catch (error) {
      console.error("Error force submitting:", error);
      setForceSubmitLoading((prev) => ({ ...prev, [studentId]: false }));
    }
  };

  const handleStartExam = async () => {
    if (
      !(
        data.length - 1 < studentList.length &&
        window.confirm("Are you sure you want to start the test ?")
      )
    ) {
      return;
    }

    setIsStartingExam(true);
    try {
      const now = new Date();
      const newEndTime = new Date(now.getTime() + testDuration * 60000);

      setStartTime(now);
      setEndTime(newEndTime);
      setExamStarted(true);

      saveExamState(true, now, newEndTime);
      socket.emit("requestStartExam", roomID, now.toISOString());

      toast.success("Exam started successfully!");
    } catch (error) {
      console.error("Error starting exam:", error);
      toast.error("Failed to start exam");
    } finally {
      setIsStartingExam(false);
    }
  };

  const handleEndExam = () => {
    if (!examStarted) {
      toast.error("The Test Has'nt started yet!");
      return;
    }
    const confirm = window.confirm("Are you sure you want to end the exam ? ");
    if (!confirm) return;

    setIsLoading(true);
    data.forEach((d) => {
      if (d.student_id_db) {
        handleForceSubmit(d.student_id_db, roomID);
      }
    });

    const newTestHistory = {
      testName: testName,
      className: className,
      classId: classID,
      roomId: roomID,
      teacherId: teacherId,
      startTime: startTime,
      endTime: endTime,
    };

    setTimeout(async () => {
      try {
        const req = await axios.post(
          `${BACK_END_LOCAL_URL}/test_history`,
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

        localStorage.removeItem(`exam_state_${roomID}`);
        toast.success("Exam ended successfully!");
      } catch (error) {
        console.log(error);
        setIsLoading(false);
        toast.error("Failed to save test history");
      }
    }, 1000);
  };

  const formatTime = (date) => {
    return date
      ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "";
  };

  const handleNavigateToHistory = () => {
    navigate("/home/test_history");
  };

  // Simple Loading Component
  const LoadingSpinner = () => (
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
  );

  // Show loading until everything is ready
  if (!isPageReady) {
    return (
      <div className="bg-green-400 min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Show room not exist if room doesn't exist
  if (isRoomExist === false) {
    return <RoomNotExist />;
  }

  return (
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
                disabled={isStartingExam}
                className="mt-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2 px-4 rounded-md transition-colors font-medium flex items-center justify-center min-w-[120px]"
              >
                {isStartingExam ? "Starting..." : "Start Exam"}
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
              onClick={handleEndExam}
              disabled={isLoading}
              className="mt-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2 px-5 rounded-md transition-colors font-medium flex items-center justify-center min-w-[120px]"
            >
              {isLoading ? "Processing..." : "End Exam"}
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
                    disabled={forceSubmitLoading[student.student_id_db]}
                    className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-2 py-1 rounded text-sm transition-colors min-w-[100px]"
                  >
                    {forceSubmitLoading[student.student_id_db]
                      ? "..."
                      : "Force Submit"}
                  </button>
                </div>
              </div>
            );
          })}

          {/* Empty state */}
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
  );
};

export default Room;
