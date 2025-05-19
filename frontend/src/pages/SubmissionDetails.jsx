import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import HomeNavBar from "../components/HomeNavBar";
import SideBar from "../components/SideBar";

ChartJS.register(ArcElement, Tooltip, Legend);

const SubmissionDetails = () => {
  const [submissionData, setSubmissionData] = useState({});
  const [answersArray, setAnswerArray] = useState([]);
  // Data from MongoDB with correct structure
  const userID = localStorage.getItem("userID");
  const { submissionId } = useParams();
  useEffect(() => {
    const fetchSubmissions = async () => {
      const req = await fetch(
        `http://localhost:3000/api/v1/submissions/${userID}`
      );
      const res = await req.json();
      const submission = res.metadata.find((s) => s._id === submissionId);

      console.log(res.metadata);
      setSubmissionData(submission);
      setAnswerArray(
        Object.entries(submission.answers).map(([key, value]) => ({
          questionNumber: parseInt(key) + 1,
          ...value,
        }))
      );
    };

    fetchSubmissions();
  }, [submissionId, userID]);

  // Convert answers object to array for easier mapping

  // Chart data
  const chartData = {
    labels: ["Correct Answers", "Wrong Answers"],
    datasets: [
      {
        data: [
          submissionData.number_of_correct_options,
          submissionData.number_of_wrong_options,
        ],
        backgroundColor: ["#4ade80", "#f87171"],
        borderColor: ["#22c55e", "#ef4444"],
        borderWidth: 1,
      },
    ],
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString("vi-VN") + " " + date.toLocaleTimeString("vi-VN")
    );
  };

  return (
    <div className="bg-white min-h-screen">
      <HomeNavBar />
      <SideBar />
      <div className={`transition-all duration-300 ease-in-out p-6`}>
        <div className="max-w-4xl mx-auto">
          {/* Main header */}
          <div className="bg-green-400 rounded-lg p-6 shadow-md mb-6">
            <h1 className="text-2xl font-bold text-white">
              Submission Details
            </h1>
            <div className="mt-2 text-green-100">
              <p>
                Test:{" "}
                <span className="font-semibold">{submissionData.testName}</span>
              </p>
              <p>
                Submitted on:{" "}
                <span className="font-semibold">
                  {formatDate(submissionData.createdAt)}
                </span>
              </p>
            </div>
          </div>

          {/* Score Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-green-200">
              <h3 className="text-gray-500 text-sm font-medium">Score</h3>
              <p className="text-3xl font-bold text-green-600">
                {submissionData.score}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-green-200">
              <h3 className="text-gray-500 text-sm font-medium">
                Correct Answers
              </h3>
              <p className="text-3xl font-bold text-green-600">
                {submissionData.number_of_correct_options}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-green-200">
              <h3 className="text-gray-500 text-sm font-medium">
                Wrong Answers
              </h3>
              <p className="text-3xl font-bold text-red-500">
                {submissionData.number_of_wrong_options}
              </p>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-green-200 mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Performance Summary
            </h2>
            <div className="w-full md:w-1/2 mx-auto">
              <Pie data={chartData} />
            </div>
          </div>

          {/* Answers Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-green-200">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Question Details
            </h2>

            {answersArray?.map((answer, index) => (
              <div
                key={index}
                className={`mb-6 p-4 rounded-lg border ${
                  answer.isCorrect
                    ? "border-green-200 bg-green-50"
                    : "border-red-200 bg-red-50"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-800">
                    Question {answer.questionNumber}: {answer.questionText}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      answer.isCorrect
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {answer.isCorrect ? "Correct" : "Incorrect"}
                  </span>
                </div>
                {console.log(answer)}
                <div className="space-y-2 mt-3">
                  {answer.options?.map((option, optIndex) => {
                    let optionStyle = "p-2 rounded border";
                    if (option.isCorrect) {
                      optionStyle +=
                        " bg-green-100 border-green-300 font-medium";
                    } else if (
                      optIndex === answer.optionSelected &&
                      !answer.isCorrect
                    ) {
                      optionStyle += " bg-red-100 border-red-300 line-through";
                    } else {
                      optionStyle += " bg-gray-50 border-gray-200";
                    }

                    return (
                      <div key={optIndex} className={optionStyle}>
                        {String.fromCharCode(65 + optIndex)}. {option.text}
                        {optIndex === answer.optionSelected && (
                          <span
                            className={`ml-2 text-xs ${
                              answer.isCorrect
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            (Your selection)
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionDetails;
