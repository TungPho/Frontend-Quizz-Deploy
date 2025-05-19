import { useContext, useEffect, useRef, useState } from "react";
import { QuizzContext } from "../context/ContextProvider";
import { useLocation, useNavigate } from "react-router-dom";
import CountdownTimer from "../utils/CountDownTimer";
import io from "socket.io-client";
import RoomNotExist from "../components/RoomNotExist";
import axios from "axios";
import { Button, Modal, Progress } from "antd";
import { toast } from "react-toastify";
import TestWaitingRoom from "../components/TestWaitingRoom";

// TODO: khi ấn chọn câu trả lời, lưu vào doing test
// khi submit xóa luôn!

const MainExam = () => {
  const tempSubmitBtn = useRef(null);
  const mainSubmitBtn = useRef(null);

  const navigate = useNavigate();
  // This is the main exam
  const [mainExam, setMainExam] = useState({});
  ///////////////////////////////////
  const [timeLimit, setTimeLimit] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [isFinished, setIsFinished] = useState(false);
  const userID = localStorage.getItem("userID");
  const role = localStorage.getItem("role");
  const { room } = useLocation().state || "";

  const { socket, setSocket, timeRemaining, setIsStartPermit } =
    useContext(QuizzContext);
  const [examProgress, setExamProgress] = useState({});
  const BACK_END_LOCAL_URL = import.meta.env.VITE_LOCAL_API_CALL_URL;
  const BACK_END_SOCKET_URL = import.meta.env.BACK_END_SOCKET_URL;

  // student info
  const timerKey = room + "," + userID;
  if (!isNaN(timeRemaining) && timeRemaining !== 0) {
    console.log(timeRemaining);
    localStorage.setItem(timerKey, timeRemaining);
  }
  const [student, setStudent] = useState();
  const [examID, setExamID] = useState("");
  const [studentName, setStudentName] = useState("");
  const [studentID, setStudentID] = useState("");
  const [testName, setTestName] = useState("");

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [numberOfViolates, setNumberOfViolates] = useState(0);
  // room
  const [isRoomExist, setIsRoomExist] = useState(true);

  //Modal Submit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOpenSubmit, setIsOpenSubmit] = useState(false);
  const [isSubmitedTest, setIsSubmitTest] = useState();
  // ExamProgress from the database

  // Final Result:
  const [finalResult, setFinalResult] = useState({
    score: 0,
    timeSubmited: new Date(),
  });
  const [isStartExam, setIsStartExam] = useState(
    sessionStorage.getItem("isStartExam")
  );

  useEffect(() => {
    const handleWindowChange = () => {
      if (isSubmitedTest) return;
      toast.error(`You just switch tab 1 more time`);
      setNumberOfViolates((n) => n + 1);
      socket.emit("studentInteraction", room, studentID, {
        type: "violates",
        violateNums: numberOfViolates,
      });
    };
    window.addEventListener("blur", handleWindowChange);

    // Cảnh báo thoát trang ?
    window.addEventListener("beforeunload", function (event) {
      event.preventDefault();
      event.returnValue = "Are you sure you want to quit?";
    });
    // event khi thoát trang
    window.addEventListener("unload", function () {
      socket.emit("studentInteraction", room, studentID, {
        type: "violates",
        violateNums: numberOfViolates,
      });
    });

    window.addEventListener("focus", () => {
      socket.emit("studentInteraction", room, studentID, { type: "re-joined" });
    });
    return () => {
      window.removeEventListener("blur", handleWindowChange);
      window.removeEventListener("beforeunload", handleWindowChange);

      socket.off("studentInteraction");
    };
  });
  // Progress calculation
  const getProgressPercentage = () => {
    if (!mainExam) return;
    if (!questions.length) return 0;
    const answeredQuestions = Object.values(mainExam).filter(
      (q) => q.isSelected
    ).length;
    return Math.round((answeredQuestions / questions.length) * 100);
  };

  useEffect(() => {
    const fetchExamProgress = async () => {
      console.log("fe");
      const getExamReq = await fetch(
        `${BACK_END_LOCAL_URL}/exam_progress/${userID}`
      );
      const res = await getExamReq.json();
      setExamProgress(res.metadata[0]);
    };
    fetchExamProgress();
  }, [setExamProgress, userID]);

  /////
  useEffect(() => {
    setSocket(
      io(`${BACK_END_SOCKET_URL}`, {
        query: { userId: userID, role },
        withCredentials: true,
        extraHeaders: {
          "my-custom-header": "abcd",
        },
      })
    );
  }, [role, setSocket, userID]);

  useEffect(() => {
    socket.emit("studentInfo", userID, room);
    socket.emit("checkRoomExist", room);
  }, [examID, room, socket, student, userID]);

  useEffect(() => {
    socket.on("sentStudentInfo", (inputStudent) => {
      sessionStorage.setItem("student", JSON.stringify(inputStudent));
      setExamID(inputStudent.examID);
      setStudentName(inputStudent.name);
      setStudentID(inputStudent.student_id);
      setTestName(inputStudent.testName);
      setNumberOfViolates(inputStudent.number_of_violates);
    });

    socket.on("isRoomExist", (roomExist) => {
      setIsRoomExist(roomExist);
    });

    socket.on("forceSubmit", () => {
      console.log("You were force to submit the test");
      if (!isSubmitedTest) {
        // Only proceed if not already submitted
        setIsSubmitTest(true); // Set this flag immediately to prevent further submissions
        tempSubmitBtn.current.click();
        setTimeout(() => {
          mainSubmitBtn.current.click();
        }, 0);
      } else {
        console.log("Test already submitted, ignoring force submit");
      }
    });
    return () => {
      socket.off("sentStudentInfo");
      socket.off("isRoomExist");
      socket.off("startExamForStudent");
    };
  }, [socket]);

  useEffect(() => {
    const fetchTest = async () => {
      if (!examID) return;
      try {
        const req = await axios.get(`${BACK_END_LOCAL_URL}/tests/${examID}`);
        const testFound = req.data;

        const questionPromises = testFound.metadata.questions.map(
          async (questionID) => {
            const questionDetail = await axios.get(
              `${BACK_END_LOCAL_URL}/questions/${questionID}`
            );
            return questionDetail.data.metadata;
          }
        );
        const allQuestions = await Promise.all(questionPromises);
        const filteredQuestions = allQuestions.filter((q) => q);

        // Có thể get exam từ localStorage
        let initialExam = {};
        if (!examProgress) {
          filteredQuestions.forEach((q, index) => {
            initialExam[index] = {
              optionSelected: "none",
              isSelected: false,
              isCorrect: false,
            };
          });
        } else {
          initialExam = examProgress.answers;
          setTimeLimit(Number(localStorage.getItem(timerKey)));
        }
        if (!timeLimit && !localStorage.getItem(timerKey)) {
          console.log("OK");
          setTimeLimit(Number(testFound.metadata.timeLimit * 60));
        }
        setMainExam(initialExam);
        setQuestions(filteredQuestions);
        // setTime ở đây ||
      } catch (error) {
        console.error("Error fetching test:", error);
      }
    };

    fetchTest();
  }, [BACK_END_LOCAL_URL, examID, examProgress]);

  useEffect(() => {
    if (isFinished) {
      setIsModalOpen(true);
    }
  }, [isFinished]);

  const onChangeQuestionHandler = (index) => {
    socket.emit("studentInteraction", room, studentID, {
      type: "change_question",
      current_question: index + 1,
    });
    setCurrentQuestion(index);
  };

  useEffect(() => {
    if (Object.keys(mainExam).length === 0) return; // Chỉ gửi khi có dữ liệu

    const examData = {
      studentID: studentID,
      roomId: room,
      examId: examID,
      examName: testName,
      startTime: "2025-03-22T10:00:00Z",
      endTime: "2025-03-22T11:00:00Z",
      remainingTime: timeRemaining,
      answers: mainExam,
      status: "in_progress",
    };

    const syncExamProgress = async () => {
      try {
        const response = await fetch(
          `${BACK_END_LOCAL_URL}/exam_progress/${userID}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(examData),
          }
        );

        if (!response.ok) throw new Error("Gửi dữ liệu thất bại");
      } catch (error) {
        toast.error("Lỗi khi đồng bộ bài thi:", error);
      }
    };

    syncExamProgress();
  }, [mainExam]); // useEffect theo dõi mainExam

  const handleSelectAnswer = (index) => {
    socket.emit("checkRoomExist", room);
    setMainExam((prev) => ({
      ...prev,
      [currentQuestion]: {
        optionSelected: index,
        isSelected: true,
        isCorrect: questions[currentQuestion].options[index].isCorrect,
        questionText: questions[currentQuestion].text,
        options: questions[currentQuestion].options,
      },
    }));
  };

  const calculateScore = () => {
    const questionLength = questions.length;
    const pointsPerQuestion = parseInt(10 / questionLength);
    let numberOfCorrectAnswers = 0;

    for (const answerIndex in mainExam) {
      if (mainExam[answerIndex].isCorrect) {
        numberOfCorrectAnswers += 1;
      }
    }

    const score = numberOfCorrectAnswers * pointsPerQuestion;
    return {
      score,
      numberOfCorrectAnswers,
      numberOfWrongOptions: questionLength - numberOfCorrectAnswers,
    };
  };

  const handleSubmitTest = async () => {
    // if (isSubmitedTest) return; => errror
    setIsOpenSubmit(false);
    setIsModalOpen(true);
    setIsSubmitTest(true);
    const result = calculateScore();
    setFinalResult({
      score: result.score || 0,
      timeSubmited: new Date().toLocaleTimeString(),
    });
    setStudent(null);
    socket.emit("studentInteraction", room, studentID, { type: "submit" });

    //gửi dữ liệu cho submissions:
    const bodyExam = {
      testId: examID,
      testName: testName,
      userId: userID,
      studentId: studentID,
      userName: studentName,
      roomId: room,
      answers: mainExam,
      score: result.score,
      number_of_wrong_options: result.numberOfWrongOptions,
      submitted_at: new Date().toLocaleTimeString(),
      number_of_correct_options: result.numberOfCorrectAnswers,
    };

    try {
      // 1. submit test
      const submitRequest = await fetch(`${BACK_END_LOCAL_URL}/submissions`, {
        method: "POST",
        body: JSON.stringify(bodyExam),
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(submitRequest.data);
      // 2. Xóa progress:
      const deleteRequest = await fetch(
        `${BACK_END_LOCAL_URL}/exam_progress/${userID}`,
        {
          method: "DELETE",
        }
      );

      if (deleteRequest.status === 200 && submitRequest.status === 200) {
        toast.success("Submit success!");
        sessionStorage.removeItem("isStartExam");
        setIsStartPermit(false);
      }
    } catch (error) {
      toast.error("Error submitting test:", error);
      console.error("Error submitting test:", error);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  if (!isRoomExist || !room) {
    return <RoomNotExist />;
  }

  return isStartExam ? (
    <div className="min-h-screen bg-gradient-to-b from-green-300 to-green-100">
      {/* Final Submit Modal */}
      <Modal
        closable={false}
        maskClosable={false}
        width={650}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
        }}
        footer={[]}
      >
        <div className="text-center">
          <div className="bg-green-100 rounded-full mx-auto w-20 h-20 flex items-center justify-center mb-4">
            <span className="text-green-500 text-4xl">✓</span>
          </div>
          <h2 className="text-center text-2xl text-green-600 font-bold mb-4">
            Congratulations!
          </h2>
          <p className="text-xl mb-2">
            You have completed: {getProgressPercentage()}% of the test
          </p>
          <p className="text-xl mb-2">
            Time Submitted: {finalResult.timeSubmited}
          </p>
          <p className="text-xl mb-6">
            Your Score:{" "}
            <span className="font-bold text-green-600">
              {finalResult.score.toFixed(1)}
            </span>
          </p>
        </div>
        <div className="flex justify-center">
          <Button
            className="w-1/2 h-12 text-lg"
            key="ok"
            type="primary"
            style={{ backgroundColor: "#31cd63", borderColor: "#31cd63" }}
            onClick={() => {
              navigate("/home/my_submission");
            }}
          >
            Return To Home
          </Button>
        </div>
      </Modal>

      {/* Open Submit Modal */}
      <Modal
        width={500}
        open={isOpenSubmit}
        onCancel={() => {
          setIsOpenSubmit(false);
        }}
        footer={[
          <Button
            className="h-10"
            key="cancel"
            onClick={() => {
              setIsOpenSubmit(false);
            }}
          >
            Cancel
          </Button>,
          <Button
            ref={mainSubmitBtn}
            className="h-10"
            key="ok"
            type="primary"
            style={{ backgroundColor: "#31cd63", borderColor: "#31cd63" }}
            onClick={() => {
              setIsSubmitTest(true);
              setTimeout(() => {
                handleSubmitTest();
              });
            }}
          >
            Submit
          </Button>,
        ]}
      >
        <div className="text-center">
          <div className="bg-yellow-100 rounded-full mx-auto w-16 h-16 flex items-center justify-center mb-4">
            <span className="text-yellow-500 text-3xl">!</span>
          </div>
          <p className="text-xl">Are you sure you want to submit your exam?</p>
          <p className="text-sm text-gray-500 mt-2">
            You have completed {getProgressPercentage()}% of the test
          </p>
        </div>
      </Modal>

      {/* Navigation Bar */}
      <nav className="flex flex-row justify-between items-center h-16 sm:h-20 shadow-lg bg-white mb-5 px-4 sm:px-8">
        <div className="text-[#31cd63] text-2xl sm:text-4xl font-bold">
          Quizzes
        </div>
        <div className="hidden sm:block bg-green-100 px-4 py-2 rounded-full">
          <span className="font-medium">Test: {testName}</span>
        </div>
      </nav>

      <div className="container mx-auto px-4 flex flex-col lg:flex-row gap-4 pb-8">
        {/* Question Panel */}
        <div className="flex-grow bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-green-500 text-white p-4 flex justify-between items-center">
            <h2 className="text-lg font-bold">
              Question {currentQuestion + 1} of {questions.length}
            </h2>
            <div className="hidden sm:block">
              {timeLimit ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm">Time Remaining:</span>
                  <span className="font-mono font-bold">
                    <CountdownTimer
                      seconds={timeLimit}
                      setIsFinished={setIsFinished}
                    />
                  </span>
                </div>
              ) : (
                ""
              )}
            </div>
          </div>

          <div className="p-6">
            <div className="bg-green-50 p-4 rounded-lg mb-6">
              <p className="text-xl sm:text-2xl font-medium">
                {questions[currentQuestion]?.text || "Loading question..."}
              </p>
            </div>

            <div className="space-y-4">
              {questions[currentQuestion]?.options.map((answer, index) => (
                <button
                  className={`w-full text-left p-4 rounded-lg transition-colors ${
                    mainExam[currentQuestion]?.isSelected &&
                    mainExam[currentQuestion]?.optionSelected === index
                      ? "bg-green-500 text-white"
                      : "bg-gray-100 text-gray-800 hover:bg-green-100"
                  }`}
                  onClick={() => handleSelectAnswer(index)}
                  key={index}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center ${
                        mainExam[currentQuestion]?.isSelected &&
                        mainExam[currentQuestion]?.optionSelected === index
                          ? "bg-white border-white"
                          : "border-gray-400"
                      }`}
                    >
                      <span
                        className={
                          mainExam[currentQuestion]?.isSelected &&
                          mainExam[currentQuestion]?.optionSelected === index
                            ? "text-green-500 text-sm"
                            : "text-transparent"
                        }
                      >
                        ✓
                      </span>
                    </div>
                    <span>{answer.text}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={handlePrevQuestion}
                disabled={currentQuestion === 0}
                className={`px-4 py-2 rounded ${
                  currentQuestion === 0
                    ? "bg-gray-200 text-gray-500"
                    : "bg-green-100 text-green-700 hover:bg-green-200"
                }`}
              >
                Previous
              </button>
              <button
                onClick={handleNextQuestion}
                disabled={currentQuestion === questions.length - 1}
                className={`px-4 py-2 rounded ${
                  currentQuestion === questions.length - 1
                    ? "bg-gray-200 text-gray-500"
                    : "bg-green-100 text-green-700 hover:bg-green-200"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Info Panel */}
        <div className="lg:w-80 bg-white rounded-lg shadow-md flex flex-col overflow-hidden">
          <div className="p-4 border-b">
            <div className="flex items-center mb-4">
              <div className="bg-green-100 p-2 rounded-full mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Violates</p>
                <h3 className="font-bold">
                  {numberOfViolates + " Times" || "Loading..."}
                </h3>
              </div>
            </div>

            <div className="flex items-center mb-4">
              <div className="bg-green-100 p-2 rounded-full mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Student</p>
                <h3 className="font-bold">{studentName || "Loading..."}</h3>
              </div>
            </div>

            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-2 rounded-full mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5M10 6a2 2 0 002-2h4a2 2 0 002 2M10 6a2 2 0 01-2 2H5a2 2 0 00-2 2"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Student ID</p>
                <h3 className="font-bold">{studentID || "Loading..."}</h3>
              </div>
            </div>

            <div className="flex items-center mb-4">
              <div className="bg-purple-100 p-2 rounded-full mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-purple-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Room</p>
                <h3 className="font-bold">{room}</h3>
              </div>
            </div>

            <div className="sm:hidden flex items-center mb-4">
              <div className="bg-red-100 p-2 rounded-full mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Time Remaining</p>
                <div className="font-bold font-mono">
                  {timeLimit ? (
                    <CountdownTimer
                      minutes={timeLimit}
                      setIsFinished={setIsFinished}
                    />
                  ) : (
                    "N/A"
                  )}
                </div>
              </div>
            </div>

            <div className="mt-2">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Completion</span>
                <span className="text-sm font-medium">
                  {getProgressPercentage()}%
                </span>
              </div>
              <Progress
                percent={getProgressPercentage()}
                showInfo={false}
                strokeColor="#31cd63"
                trailColor="#e5e7eb"
              />
            </div>
          </div>

          <div className="p-4 flex-grow">
            <h3 className="font-bold text-lg mb-3">Question Navigator</h3>
            <div className="grid grid-cols-4 xs:grid-cols-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 gap-2">
              {questions.map((quest, index) => (
                <button
                  className={`flex items-center justify-center h-10 rounded-lg transition-colors ${
                    currentQuestion === index
                      ? "bg-green-500 text-white"
                      : mainExam[index]?.isSelected
                      ? "bg-green-200 text-green-800"
                      : "bg-gray-200 text-gray-800 hover:bg-green-100"
                  }`}
                  onClick={() => onChangeQuestionHandler(index)}
                  key={index}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 border-t">
            <button
              ref={tempSubmitBtn}
              onClick={() => setIsOpenSubmit(true)}
              className={`w-full py-3 rounded-lg ${
                isSubmitedTest
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600"
              } text-white font-medium transition-colors flex items-center justify-center gap-2`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {isSubmitedTest ? "Test Submitted" : "Submit Exam"}
            </button>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <TestWaitingRoom
      setIsStartExam={setIsStartExam}
      studentName={studentName}
      studentID={studentID}
      testName={testName}
      roomId={room}
    />
  );
};

export default MainExam;
