import { IoArrowBackSharp } from "react-icons/io5";
import { FaRegSave } from "react-icons/fa";
import { FaCheck } from "react-icons/fa6";
import { FaRegTrashCan } from "react-icons/fa6";
import { CiImageOn } from "react-icons/ci";
import { IoMdAdd } from "react-icons/io";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { QuizzContext } from "../context/ContextProvider";
import { toast } from "react-toastify";
const CreateQuestion = () => {
  const [question, setQuestion] = useState("");
  let { testId, questionId } = useParams();
  const updateState = questionId ? "update" : "create";
  const { setState } = useContext(QuizzContext);
  const navigate = useNavigate();
  const userID = localStorage.getItem("userID");

  const [answers, setAnswers] = useState([
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ]);

  const handleInputChange = (index, value) => {
    setAnswers((prevAnswers) =>
      prevAnswers.map((answer, i) =>
        i === index ? { ...answer, text: value } : answer
      )
    );
  };

  const handleCorrectAnswer = (index) => {
    setAnswers((prevAnswers) =>
      prevAnswers.map((answer, i) =>
        i === index
          ? { ...answer, isCorrect: true }
          : { ...answer, isCorrect: false }
      )
    );
  };

  const handleDeleteAnswer = (index) => {
    if (answers.length <= 2) {
      console.log("Minimum 2 answers");
      return;
    }
    setAnswers((prevAnswers) => prevAnswers.filter((answer, i) => i !== index));
  };

  const addAnswer = () => {
    if (answers.length >= 5) {
      console.log("Maximum 5 answers");
      return;
    }
    setAnswers([...answers, { text: "", isCorrect: false }]);
  };

  const createQuestion = async () => {
    if (!question || answers.length <= 0) {
      console.log("think again");
      return;
    }
    const correctAnswer = answers.filter((a) => a.isCorrect);
    if (correctAnswer.length === 0) {
      toast.error("You must set at least 1 correct answer");
      return;
    }
    // 1. Create the test first
    if (!testId) {
      const req = await fetch("http://localhost:3000/api/v1/tests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teacherId: userID,
        }),
      });
      const res = await req.json();
      testId = res.metadata.newTest._id;
    }

    // 2. Add the question to that test
    const req2 = await fetch("http://localhost:3000/api/v1/questions/", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        quizId: testId.toString(),
        text: question,
        options: answers,
      }),
    });
    const res2 = await req2.json();
    console.log(res2);
    navigate(`/tests/${testId}`);
  };

  useEffect(() => {
    const fetchQuestion = async () => {
      const req = await fetch(
        `http://localhost:3000/api/v1/questions/${questionId}`
      );
      const res = await req.json();
      setQuestion(res.metadata.text);
      setAnswers(res.metadata.options);
    };
    if (questionId && updateState === "update") fetchQuestion();
  }, [questionId, updateState]);

  const updateQuestion = async () => {
    if (!questionId) return;
    const correctAnswer = answers.filter((a) => a.isCorrect);
    if (!correctAnswer) {
      toast.error("You must set at least 1 correct answer");
      return;
    }
    const req = await fetch(
      `http://localhost:3000/api/v1/questions/${questionId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: question,
          options: answers,
        }),
      }
    );
    const res = await req.json();
    navigate(`/tests/${testId}`);
  };

  return (
    <div className="bg-gray-50 min-h-screen p-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setState("normal");
                testId
                  ? navigate(`/tests/${testId}`)
                  : navigate(`/home/library`);
              }}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Go back"
            >
              <IoArrowBackSharp className="text-xl" />
            </button>
            <select className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400">
              <option value="0">Multiple Choice</option>
            </select>
          </div>
          <button
            onClick={() => {
              updateState === "update" ? updateQuestion() : createQuestion();
            }}
            className="flex items-center bg-green-500 hover:bg-green-600 px-4 py-2 text-white rounded-md text-sm font-medium transition-colors w-full sm:w-auto justify-center"
          >
            <FaRegSave className="mr-2" />
            {updateState === "update" ? "Update Question" : "Save Question"}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Question Section */}
          <div className="p-6 bg-gradient-to-r from-green-400 to-teal-400">
            <div className="relative mb-6">
              <button className="absolute right-3 top-3 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors">
                <CiImageOn className="text-xl text-gray-600" />
              </button>
              <textarea
                onChange={(e) => setQuestion(e.target.value)}
                value={question}
                className="w-full p-6 pr-12 min-h-[120px] text-center rounded-lg shadow-md border border-gray-200 focus:ring-2 focus:ring-green-400 focus:outline-none resize-none"
                placeholder="Enter your question here..."
              />
            </div>

            {/* Answers Container with horizontal scroll */}
            <div className="relative">
              {/* Add answer button */}
              <div className="flex justify-center mb-4">
                <button
                  onClick={addAnswer}
                  disabled={answers.length >= 5}
                  className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    answers.length >= 5
                      ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                      : "bg-white text-green-600 hover:bg-gray-50 shadow-md"
                  }`}
                >
                  <IoMdAdd />
                  Add Answer{" "}
                  {answers.length < 5 ? `(${answers.length}/5)` : "(Max)"}
                </button>
              </div>

              {/* Horizontal scrollable container for answers */}
              <div className="overflow-x-auto pb-4 hide-scrollbar">
                <div
                  className="flex flex-nowrap"
                  style={{ width: `${Math.max(100, answers.length * 25)}%` }}
                >
                  {answers.map((answer, index) => (
                    <div
                      key={index}
                      className={`flex-1 min-w-[200px] mx-2 first:ml-0 last:mr-0 bg-white rounded-xl shadow-md overflow-hidden transition-all ${
                        answer.isCorrect
                          ? "ring-2 ring-green-500"
                          : "hover:shadow-lg"
                      }`}
                    >
                      <div className="p-4">
                        <div className="flex justify-end space-x-2 mb-2">
                          <button
                            onClick={() => handleCorrectAnswer(index)}
                            className={`rounded-full p-2 text-white transition-colors ${
                              answer.isCorrect
                                ? "bg-green-500 hover:bg-green-600"
                                : "bg-gray-300 hover:bg-gray-400"
                            }`}
                            aria-label="Mark as correct"
                          >
                            <FaCheck />
                          </button>
                          <button
                            onClick={() => handleDeleteAnswer(index)}
                            disabled={answers.length <= 2}
                            className={`rounded-full p-2 text-white transition-colors ${
                              answers.length <= 2
                                ? "bg-gray-300 cursor-not-allowed"
                                : "bg-red-500 hover:bg-red-600"
                            }`}
                            aria-label="Delete answer"
                          >
                            <FaRegTrashCan />
                          </button>
                        </div>
                        <textarea
                          value={answer.text}
                          onChange={(e) =>
                            handleInputChange(index, e.target.value)
                          }
                          className="w-full p-2 min-h-[80px] text-center border border-gray-200 rounded-md focus:ring-2 focus:ring-green-400 focus:outline-none resize-none"
                          placeholder={`Answer ${index + 1}`}
                        />
                      </div>
                      {answer.isCorrect && (
                        <div className="bg-green-500 text-white text-xs text-center py-1">
                          Correct Answer
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateQuestion;
