import { useContext, useEffect } from "react";
import { QuizzContext } from "../context/ContextProvider";

const TestWaitingRoom = ({
  studentName,
  studentID,
  testName,
  roomId,
  setIsStartExam,
}) => {
  // Sample student and test information
  const { socket } = useContext(QuizzContext);
  const { isStartPermit, setIsStartPermit } = useContext(QuizzContext);

  // check teststat e on server
  useEffect(() => {
    socket.emit("checkIfTestStarted", roomId);
    socket.on("returnTestState", (testState) => {
      setIsStartPermit(testState);
    });
    return () => {
      socket.off("checkIfTestStarted");
    };
  }, [roomId, setIsStartPermit, socket]);
  useEffect(() => {
    // ** recieves event to start the test from the teacher
    socket.on("startExamForStudent", (startExam) => {
      setIsStartPermit(startExam);
    });
  }, [setIsStartExam, setIsStartPermit, socket]);

  const handleStartTest = () => {
    if (isStartPermit) {
      setIsStartExam(true);
      sessionStorage.setItem("isStartExam", true);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border-2 border-green-600 overflow-hidden">
        <div className="bg-green-600 text-white py-6">
          <h2 className="text-3xl font-extrabold text-center tracking-wider">
            Test Waiting Room
          </h2>
        </div>
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="font-bold text-green-800">Room Code</div>
              <div className="font-bold text-green-800">Student Name</div>
              <div className="font-bold text-green-800">Student ID</div>
              <div className="font-bold text-green-800">Test Name</div>
            </div>
            <div className="space-y-4">
              <div className="text-gray-700">{roomId}</div>
              <div className="text-gray-700">{studentName}</div>
              <div className="text-gray-700">{studentID}</div>
              <div className="text-gray-700 line-clamp-2">{testName}</div>
            </div>
          </div>
        </div>
        <div className="p-6 bg-gray-50">
          <button
            onClick={() => {
              handleStartTest();
            }}
            className={`w-full ${
              isStartPermit
                ? "bg-green-500 hover:bg-green-600"
                : "bg-gray-500 hover:bg-gray-500"
            }  text-white font-bold py-3 rounded-xl 
            transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md hover:shadow-lg`}
          >
            Start Test
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestWaitingRoom;
