import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import HomeNavBar from "./HomeNavBar";
import SideBar from "./SideBar";
import LibrarySearchBar from "./LibrarySearchBar";
import axios from "axios";
import PDFUploader from "../pages/PDFUploader";
import RoomNotExist from "./RoomNotExist";

const Library = () => {
  // State for tests/assessments
  const BACK_END_LOCAL_URL = import.meta.env.VITE_LOCAL_API_CALL_URL;
  const [tests, setTests] = useState([]);
  const [activeTab, setActiveTab] = useState("assessments"); // Track active tab
  const [currentPage, setCurrentPage] = useState(1);
  const role = localStorage.getItem("role");
  const itemsPerPage = 6; // Number of items per page
  const userID = localStorage.getItem("userID");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch tests when component mounts
  const fetchTest = async () => {
    try {
      const { data } = await axios.get(
        `${BACK_END_LOCAL_URL}/tests-find/${userID}`
      );
      console.log(data);
      setTests(data.metadata.foundTests);
    } catch (error) {
      console.error("Error fetching tests:", error);
    }
  };
  useEffect(() => {
    fetchTest();
  }, [BACK_END_LOCAL_URL]);

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  // pagination
  let currentItems = tests.slice(indexOfFirstItem, indexOfLastItem);
  // search items
  if (searchTerm) {
    currentItems = tests.filter((item) => {
      return item.title.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }

  const totalPages = Math.ceil(tests.length / itemsPerPage);

  // Check if current page is valid after data changes
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [tests, currentPage, totalPages]);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Handle tab change - reset to page 1 when changing tabs
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleDeleteTest = async (testId) => {
    try {
      const deleteTestRequest = await fetch(
        `${BACK_END_LOCAL_URL}/tests/${testId}`,
        {
          method: "DELETE",
        }
      );
      console.log(await deleteTestRequest.json());
      fetchTest();
    } catch (error) {
      console.error("Error deleting test:", error);
    }
  };

  return role === "teacher" ? (
    <div className="flex flex-col min-h-screen bg-green-100">
      <HomeNavBar />

      <div className="flex">
        <SideBar />
        <main className="flex-1 p-4 ">
          <div className="bg-white rounded-lg shadow-md p-6 max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-green-800 mb-4 sm:mb-0">
                My Library
              </h1>
              <LibrarySearchBar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
              />
            </div>

            {/* Tabs */}
            <div className="flex border-b border-green-200 mb-6">
              <button
                className={`py-2 px-4 font-medium text-md border-b-2 ${
                  activeTab === "assessments"
                    ? "border-green-400 text-green-700"
                    : "border-transparent text-gray-500 hover:text-green-700"
                } ${role === "student" ? "hidden" : ""} `}
                onClick={() => handleTabChange("assessments")}
              >
                Assessments
              </button>
              <button
                className={`py-2 px-4 font-medium text-md border-b-2 ${
                  activeTab === "documents"
                    ? "border-green-400 text-green-700"
                    : "border-transparent text-gray-500 hover:text-green-700"
                }`}
                onClick={() => handleTabChange("documents")}
              >
                Documents
              </button>
            </div>

            {/* Content Grid */}
            {activeTab === "assessments" && role === "teacher" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentItems.map((test, index) => (
                  <div
                    key={index}
                    className="border border-green-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300"
                  >
                    <div className="bg-green-400 p-3 border-b border-green-300 text-white">
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-green-500 text-white rounded">
                        Assessment
                      </span>
                    </div>

                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-2 text-green-800 line-clamp-2">
                        {test.title}
                      </h3>
                      <p className="text-green-600 mb-4">
                        {test.timeLimit} mins
                      </p>

                      <div className="flex justify-between items-center text-sm text-green-600 mb-4">
                        <span className="flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                            />
                          </svg>
                          {test.questions.length} questions
                        </span>
                        <span className="px-2 py-1 bg-green-100 rounded text-xs font-medium text-green-800">
                          Mathematics
                        </span>
                      </div>

                      <div className="flex justify-between pt-3 border-t border-green-100">
                        <div className="flex items-center">
                          <Link
                            to={`/tests/${test._id}`}
                            className="p-1 text-white bg-[#31cd63] rounded mr-2 px-3 py-1 font-medium text-sm inline-flex items-center"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                            Edit
                          </Link>
                          <button
                            onClick={() => {
                              handleDeleteTest(test._id);
                            }}
                            className="p-1 text-white bg-red-500 rounded px-3 py-1 font-medium text-sm inline-flex items-center"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="w-full ">
                <PDFUploader />
              </div>
            )}

            {/* Pagination - only show when on assessments tab and there are multiple pages */}
            {activeTab === "assessments" && totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <nav className="flex items-center">
                  {Array.from({ length: totalPages }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => handlePageChange(index + 1)}
                      className={`mx-1 px-3 py-1 rounded ${
                        currentPage === index + 1
                          ? "bg-green-400 text-white"
                          : "bg-green-100 text-green-700 hover:bg-green-200"
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </nav>
              </div>
            )}

            {/* Create New Button */}
            <div
              className={`mt-6 text-center ${
                activeTab === "assessments" ? "" : "hidden"
              }`}
            >
              <Link
                to={"/question_type_choosing"}
                className={`${
                  role === "student" ? "hidden" : ""
                } bg-green-400 hover:bg-green-500 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 inline-flex items-center`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Create New Assessment
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  ) : (
    <RoomNotExist />
  );
};

export default Library;
