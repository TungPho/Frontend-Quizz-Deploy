import { useContext, useEffect } from "react";
import HomeNavBar from "../components/HomeNavBar";
import SideBar from "../components/SideBar";
import { QuizzContext } from "../context/ContextProvider";
import { useNavigate } from "react-router-dom";
import RoomNotExist from "../components/RoomNotExist";

const MySubmission = () => {
  const { collapsed } = useContext(QuizzContext);
  const { submissions, setSubmissions } = useContext(QuizzContext);
  const userID = localStorage.getItem("userID");
  const role = localStorage.getItem("role");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubmissions = async () => {
      const req = await fetch(
        `http://localhost:3000/api/v1/submissions/${userID}`
      );
      const res = await req.json();
      console.log(res);
      setSubmissions(res.metadata);
    };
    if (!submissions) {
      fetchSubmissions();
    }
  }, [setSubmissions, submissions, userID]);

  const handleViewDetails = (submissionId) => {
    navigate(`/submission-details/${submissionId}`);
  };

  // const formatDate = (dateString) => {
  //   const date = new Date(dateString);
  //   return date.toLocaleString();
  // };

  return role === "student" ? (
    <div className="bg-white min-h-screen">
      <HomeNavBar />
      <SideBar />
      <div
        className={`transition-all duration-300 ease-in-out p-6 ${
          collapsed ? "ml-16" : "ml-64"
        }`}
      >
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Danh sách bài kiểm tra đã nộp
        </h1>

        {!submissions || submissions.length === 0 ? (
          <p className="text-gray-500">Bạn chưa có bài kiểm tra nào.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {submissions.map((submission, index) => (
              <div
                key={index}
                className="bg-white cursor-pointer rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col aspect-square border border-gray-200 group"
                onClick={() => handleViewDetails(submission._id)}
              >
                {/* Header with quiz name prominently displayed */}
                <div className="bg-green-500 text-white p-4 relative">
                  <h2
                    className="font-bold text-xl text-center"
                    title={submission.quizName}
                  >
                    {submission.quizName}
                  </h2>
                  <div className="absolute bottom-0 h-2 w-full left-0 bg-green-600"></div>
                </div>

                {/* Badge showing "BÀI KIỂM TRA" */}
                <div className=" top-0 right-0 bg-green-600 text-white text-md font-bold px-2 py-1 rounded-bl">
                  BÀI KIỂM TRA
                </div>

                <div className="flex-grow flex flex-col justify-center items-center text-center p-4">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  {/* Quiz name repeated here with a different style */}
                  <div className="mb-3 bg-gray-100 px-3 py-2 rounded-lg w-full">
                    <p className="font-medium text-green-700 truncate">
                      {submission.testName}
                    </p>
                  </div>

                  <div className="mb-1 flex gap-2">
                    <span className="font-medium text-gray-700">
                      Thời gian nộp:
                    </span>
                    <p className="text-gray-600">{submission.submitted_at}</p>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDetails(submission._id);
                    }}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition w-full group-hover:shadow-md"
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  ) : (
    <RoomNotExist />
  );
};

export default MySubmission;
