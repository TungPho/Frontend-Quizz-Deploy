import { useState, useEffect, useContext } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { BsPeople } from "react-icons/bs";
import { RiTestTubeFill } from "react-icons/ri";
import { useNavigate, useParams } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { FiRefreshCw } from "react-icons/fi";
import { QuizzContext } from "../context/ContextProvider";
import { toast } from "react-toastify";
import io from "socket.io-client";

// Set up pdf.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const StudentClassDetails = () => {
  const BACK_END_LOCAL_URL = import.meta.env.VITE_LOCAL_API_CALL_URL;
  const BACK_END_SOCKET_URL = import.meta.env.BACK_END_SOCKET_URL;

  const [activeRooms, setActiveRooms] = useState([]);
  const [pdfDocuments, setPdfDocuments] = useState([]);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { classId } = useParams();
  const [className, setClassName] = useState("");
  const { socket, setSocket, examProgress, setExamProgress } =
    useContext(QuizzContext);
  const [isPermit, setIsPermit] = useState(false);
  const userID = localStorage.getItem("userID");
  const role = localStorage.getItem("role");

  const userName = localStorage.getItem("userName");
  const studentId = localStorage.getItem("studentId");

  const navigate = useNavigate();

  // request permission and recieved
  useEffect(() => {
    setSocket(
      io(`${BACK_END_SOCKET_URL}`, {
        query: { userId: userID, role }, // Gửi userId và role khi kết nối
      })
    );
  }, [role, setSocket, userID]);

  useEffect(() => {
    socket.on("permit", (permission) => {
      if (permission.permit) {
        console.log(permission);
        toast.success(permission.message);
        setIsPermit(true); // true
      } else {
        toast.error(permission.message);
      }
    });
  }, [socket]);

  // get exam progress
  useEffect(() => {
    const fetchExamProgress = async () => {
      const getExamReq = await fetch(
        `${BACK_END_LOCAL_URL}/exam_progress/${userID}`
      );
      const res = await getExamReq.json();
      console.log(res);
      setExamProgress(res.metadata[0]);
    };
    fetchExamProgress();
  }, [setExamProgress, userID]);

  // Function to load rooms
  const loadRooms = () => {
    if (className) socket.emit("getRoomList", className);
  };

  // Refresh rooms function with visual feedback
  const refreshRooms = () => {
    setIsRefreshing(true);
    loadRooms();

    // Add a slight delay to show the refresh animation
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  // Fetch rooms and documents on component mount
  useEffect(() => {
    const fetchClass = async () => {
      const req = await fetch(`${BACK_END_LOCAL_URL}/classes/${classId}`);
      const res = await req.json();
      setClassName(res.metadata.name);
    };

    const fetchDocuments = async () => {
      const req = await fetch(
        `${BACK_END_LOCAL_URL}/class_documents/${classId}`
      );
      const res = await req.json();
      setPdfDocuments(res.metadata);
    };
    fetchDocuments();
    fetchClass();
  }, [classId]);

  useEffect(() => {
    // Listen for room updates from socket
    socket.emit("getRoomList", className);
    if (socket) {
      socket.on("roomList", (updatedRooms) => {
        setActiveRooms(updatedRooms);
      });

      return () => {
        socket.off("roomList");
      };
    }
  }, [className, socket]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const changePage = (offset) => {
    setPageNumber((prevPageNumber) => prevPageNumber + offset);
  };

  const previousPage = () => changePage(-1);
  const nextPage = () => changePage(1);

  const handleJoinRoom = (roomCode) => {
    if (!isPermit) {
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

  return (
    <div className="bg-green-100 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate("/home/my_classes")}
          className="flex items-center mb-6 text-green-600 hover:text-green-800 transition-colors font-medium"
        >
          <IoArrowBack className="mr-2" />
          Back to Home
        </button>

        <h1 className="text-3xl font-bold text-gray-800 mb-6">{className}</h1>
        {/* Active Rooms with Refresh Button */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-green-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              Active Rooms
            </h2>

            {/* Refresh button */}
            <button
              onClick={refreshRooms}
              className="flex items-center text-green-600 hover:text-green-800 transition-colors px-3 py-1 rounded-md border border-green-400 hover:bg-green-50"
              disabled={isRefreshing}
            >
              <FiRefreshCw
                className={`mr-2 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Refresh Rooms
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {activeRooms.map((room, index) => {
            return (
              <div
                key={index}
                className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all cursor-pointer overflow-hidden"
              >
                <div className="p-1 bg-green-400 text-white text-center text-xs font-semibold">
                  ACTIVE
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg text-gray-800">
                      {room[0]}
                    </h3>
                    <span className="flex items-center text-gray-600">
                      <BsPeople className="mr-1" />
                      <span className="font-semibold">
                        {room[1].length - 1}
                      </span>
                    </span>
                  </div>

                  <div className="flex flex-col text-gray-600 text-sm mb-4">
                    <div className="flex items-center mb-1">
                      <span className="font-semibold w-20">Class:</span>
                      <span>{className}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-semibold w-20">Test:</span>
                      <span className="flex items-center">
                        <RiTestTubeFill className="mr-1 text-green-500" />
                        {room[1][0].test_name || "Selected Test"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => {
                        handleJoinRoom(room[0]);
                      }}
                      className="text-green-500 hover:text-green-600 text-sm font-semibold flex items-center"
                    >
                      {isPermit ? "Enter Room →" : "Request To Join Room →"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {activeRooms.length === 0 && (
            <div className="col-span-full text-center py-10 text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mx-auto mb-4 text-green-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-lg">No active rooms available</p>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-green-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                    clipRule="evenodd"
                  />
                </svg>
                Course Documents
              </h2>
              <div className="divide-y divide-gray-200">
                {pdfDocuments.map((doc) => (
                  <div
                    key={doc._id}
                    onClick={() => setSelectedPdf(doc)}
                    className={`py-3 px-2 cursor-pointer flex items-center ${
                      selectedPdf?._id === doc._id ? "bg-green-100 rounded" : ""
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-red-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700 hover:text-green-600 transition-colors">
                      {doc.fileName}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6 h-full">
              {selectedPdf ? (
                <div className="flex flex-col h-full">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    {selectedPdf.fileName}
                  </h3>
                  <div className="flex-grow overflow-auto bg-gray-100 rounded-lg mb-4">
                    <Document
                      file={selectedPdf.fileUrl}
                      onLoadSuccess={onDocumentLoadSuccess}
                      className="flex justify-center"
                    >
                      <Page pageNumber={pageNumber} scale={1.0} />
                    </Document>
                  </div>

                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                      Page {pageNumber} of {numPages}
                    </p>
                    <div className="space-x-2">
                      <button
                        disabled={pageNumber <= 1}
                        onClick={previousPage}
                        className="px-3 py-1 bg-green-500 text-white rounded-md disabled:bg-green-200 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        disabled={pageNumber >= numPages}
                        onClick={nextPage}
                        className="px-3 py-1 bg-green-500 text-white rounded-md disabled:bg-green-200 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 mb-4 text-green-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="text-lg">Select a document to view</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentClassDetails;
