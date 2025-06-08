import { Link, useNavigate, useParams } from "react-router-dom";
import { IoArrowBackSharp, IoTimeOutline } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";

import { CiSearch, CiEdit, CiTrash } from "react-icons/ci";
import { IoIosMove } from "react-icons/io";
import { GoCheck } from "react-icons/go";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const TestEdit = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const BACK_END_LOCAL_URL = import.meta.env.VITE_LOCAL_API_CALL_URL;

  // get Test
  const [test, setTest] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  // get all questions of that test
  const [questions, setQuestions] = useState([]);
  const [questionLength, setQuestionLength] = useState(0);
  const [timeLimit, setTimeLimit] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState("");

  useEffect(() => {
    const fetchTest = async () => {
      const req = await fetch(`${BACK_END_LOCAL_URL}/tests/${testId}`);
      const testFound = await req.json();
      console.log(testFound.metadata);
      setTest(testFound.metadata);
      setNewTitle(testFound.metadata.title);
      setTimeLimit(testFound.metadata.timeLimit);
      setSelectedSubject(testFound.metadata.subject || "");
      // loop over the questions in the test
      const questionPromises = testFound.metadata.questions.map(
        async (questionID) => {
          const questionDetail = await fetch(
            `${BACK_END_LOCAL_URL}/questions/${questionID}`
          );
          const finalQuestionDetail = await questionDetail.json();
          return finalQuestionDetail.metadata;
        }
      );
      const allQuestions = await Promise.all(questionPromises);

      // filtered null questions
      const filteredQuestions = allQuestions.filter((q) => q);
      setQuestions(filteredQuestions);
      setQuestionLength(filteredQuestions.length);
    };
    fetchTest();
  }, [testId, questionLength]);

  const handleSaveTest = async () => {
    const req = await fetch(`${BACK_END_LOCAL_URL}/tests/${testId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        timeLimit,
        title: newTitle,
        subject: selectedSubject,
      }),
    });
    console.log(req.status);
    if (req.status !== 200) {
      toast.error("Error saving test!");
      return;
    }
    const res = await req.json();
    toast.success(res.message);
  };

  const handleDeleteQuestion = async (id) => {
    console.log(id);
    const req = await fetch(`${BACK_END_LOCAL_URL}/questions/${id}`, {
      method: "DELETE",
    });
    const res = await req.json();
    console.log(res);
    setQuestionLength((l) => l - 1);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex items-center w-full md:w-auto">
          <button
            onClick={() => navigate("/home/library")}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Go back"
          >
            <IoArrowBackSharp className="text-xl" />
          </button>
          <input
            onChange={(e) => setNewTitle(e.target.value)}
            value={newTitle}
            type="text"
            placeholder="Enter the title of the test"
            className="ml-3 p-2 border-b-2 border-gray-300 focus:border-green-500 focus:outline-none text-lg font-medium w-full md:w-auto"
          />
        </div>
        <button
          onClick={handleSaveTest}
          className="text-white bg-green-500 hover:bg-green-600 px-4 py-2 rounded-md transition-colors w-full md:w-auto font-medium shadow-sm flex items-center justify-center"
        >
          <GoCheck className="mr-2" /> Save Test
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full lg:w-1/4">
          {/* Time limit selector */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex items-center mb-2">
              <IoTimeOutline className="text-xl text-gray-600 mr-2" />
              <h3 className="font-medium">Time Limit</h3>
            </div>
            <select
              onChange={(e) => setTimeLimit(parseInt(e.target.value))}
              value={timeLimit}
              className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="0">Select Time</option>
              <option value="5">5 minutes</option>
              <option value="15">15 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">60 minutes</option>
              <option value="90">90 minutes</option>
              <option value="150">150 minutes</option>
            </select>
          </div>

          {/* Subject selector */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex items-center mb-2">
              <h3 className="font-medium">Subject</h3>
            </div>
            <select
              onChange={(e) => setSelectedSubject(e.target.value)}
              value={selectedSubject}
              className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Select Subject</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Physics">Physics</option>
              <option value="Biology">Biology</option>
              <option value="Literature">Literature</option>
              <option value="English">English</option>
              <option value="History">History</option>
            </select>
          </div>
        </div>

        {/* Main content */}
        <div className="w-full lg:w-3/4">
          {/* Search bar */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="flex flex-col md:flex-row justify-between p-4">
              <input
                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 w-full md:w-2/3 mb-3 md:mb-0"
                type="text"
                placeholder="Search question in Quizzes Library"
              />
              <button className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md px-4 py-2 transition-colors w-full md:w-auto">
                <CiSearch className="mr-2 text-lg" />
                Search
              </button>
            </div>
          </div>

          {/* Questions section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-medium text-lg">Questions</h2>
              <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                {questions.length} questions
              </span>
            </div>

            {questionLength > 0 ? (
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg bg-gray-50 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-center bg-white p-3 border-b border-gray-200">
                      <button className="p-2 rounded hover:bg-gray-100 cursor-move">
                        <IoIosMove className="text-gray-500" />
                      </button>
                      <div className="flex">
                        <Link
                          to={`/update-question/${question._id}/${testId}`}
                          className="flex items-center justify-center px-3 py-1 border border-gray-200 rounded-md mr-2 hover:bg-gray-100 transition-colors"
                        >
                          <CiEdit className="mr-1 text-lg" />
                          <span className="text-sm">Edit</span>
                        </Link>
                        <button
                          onClick={() => handleDeleteQuestion(question._id)}
                          className="flex items-center justify-center px-3 py-1 border border-gray-200 rounded-md hover:bg-gray-100 hover:text-red-500 transition-colors"
                        >
                          <CiTrash className="text-lg" />
                        </button>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="mb-3">
                        <div className="flex items-start mb-1">
                          <span className="text-sm font-medium text-gray-600 mr-2 mt-0.5">
                            Question:
                          </span>
                          <p className="text-sm">{question.text}</p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-600 mb-2">
                          Answer choices:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {question.options.map((option, index) => (
                            <div
                              key={index}
                              className="flex items-center p-2 rounded-md bg-white border border-gray-100"
                            >
                              {option.isCorrect ? (
                                <GoCheck className="text-green-600 mr-2 flex-shrink-0" />
                              ) : (
                                <IoMdClose className="text-red-500 mr-2 flex-shrink-0" />
                              )}
                              <p className="text-sm overflow-hidden text-ellipsis">
                                {option.text}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500">
                <p>No questions added yet</p>
                <p className="text-sm mt-2">Add your first question below</p>
              </div>
            )}

            <div className="mt-6">
              <Link
                to={`/create-question/${testId}`}
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-green-600 bg-white hover:bg-green-50 transition-colors font-medium"
              >
                + Add question
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestEdit;
