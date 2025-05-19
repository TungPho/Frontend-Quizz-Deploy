import { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  Clock,
  Award,
  User,
  Book,
  School,
  FileDown,
} from "lucide-react";
import calculateDuration from "../utils/calculateDuration";
import { useNavigate, useParams } from "react-router-dom";
import Chart from "chart.js/auto";
import * as XLSX from "xlsx";

export default function TestHistoryDetail() {
  const { testHistoryId } = useParams();
  const [testData, setTestData] = useState();
  const [activeTab, setActiveTab] = useState("overview");
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [submissionData, setSubmissionData] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchTestHistoryById = async () => {
      const req = await fetch(
        `http://localhost:3000/api/v1/get_test_history_by_id/${testHistoryId}`
      );
      const res = await req.json();
      console.log(res);
      setTestData(res.metadata);
    };
    const fetchSubmissionData = async () => {
      const req = await fetch(
        `http://localhost:3000/api/v1/get_submissions_by_roomId/${testData?.roomId}`
      );
      const res = await req.json();
      setSubmissionData(res.metadata);
      console.log(res);
    };
    fetchTestHistoryById();
    fetchSubmissionData();
  }, [testData?.roomId, testHistoryId]);

  const numStudentsByScore = (min, max) => {
    return submissionData?.filter((sub) => sub.score >= min && sub.score <= max)
      .length;
  };

  // Create chart effect
  useEffect(() => {
    if (
      activeTab === "overview" &&
      testData &&
      chartRef.current &&
      submissionData
    ) {
      // Destroy existing chart if it exists
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      // Create scores distribution data
      // This is sample data - you would need to calculate this from actual submission data
      const scoreDistribution = {
        labels: [
          "Score 0-2",
          "Score 3-4",
          "Score 5-6",
          "Score 7-8",
          "Score 9-10",
        ],
        datasets: [
          {
            label: "Number of students",
            data: [
              numStudentsByScore(0, 2),
              numStudentsByScore(3, 4),
              numStudentsByScore(5, 6),
              numStudentsByScore(7, 8),
              numStudentsByScore(9, 10),
            ], // Example data, replace with actual distribution
            backgroundColor: [
              "rgba(52, 211, 153, 0.2)", // green-300 with transparency
              "rgba(52, 211, 153, 0.4)",
              "rgba(52, 211, 153, 0.6)",
              "rgba(52, 211, 153, 0.8)",
              "rgba(52, 211, 153, 1.0)",
            ],
            borderColor: [
              "rgb(16, 185, 129)", // green-500
              "rgb(16, 185, 129)",
              "rgb(16, 185, 129)",
              "rgb(16, 185, 129)",
              "rgb(16, 185, 129)",
            ],
            borderWidth: 1,
          },
        ],
      };

      // Create chart
      const ctx = chartRef.current.getContext("2d");
      chartInstance.current = new Chart(ctx, {
        type: "bar",
        data: scoreDistribution,
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false,
            },
            title: {
              display: true,
              text: "Score Distribution",
              font: {
                size: 16,
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0,
                stepSize: 1,
              },
              title: {
                display: true,
                text: "Number of students",
              },
            },
            x: {
              title: {
                display: true,
                text: "Score range",
              },
            },
          },
        },
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [activeTab, submissionData, testData]);

  // Format date function
  const formatDate = (dateString) => {
    console.log(dateString);
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Sample submission data

  // Function to export data to Excel
  const exportToExcel = () => {
    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();

    // Format data for excel
    const excelData = submissionData.map((item, index) => ({
      "No.": index + 1,
      "Student ID": item.studentId,
      "Student Name": item.userName,
      Score: item.score,
      "Submission Time": formatDate(item.createdAt),
    }));

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const widths = [
      { wch: 5 }, // No.
      { wch: 10 }, // Student ID
      { wch: 25 }, // Student Name
      { wch: 10 }, // Score
      { wch: 20 }, // Submission Time
    ];
    worksheet["!cols"] = widths;

    // Add test information at the top
    XLSX.utils.sheet_add_aoa(
      worksheet,
      [
        [`Test: ${testData?.testName || "N/A"}`],
        [`Class: ${testData?.className || "N/A"}`],
        [`Room: ${testData?.roomId || "N/A"}`],
        [`Start Time: ${formatDate(testData?.startTime) || "N/A"}`],
        [`End Time: ${formatDate(testData?.endTime) || "N/A"}`],
        [`Average Score: ${testData?.averageScore || "N/A"}`],
        [`Highest Score: ${testData?.highestScore || "N/A"}`],
        [`Lowest Score: ${testData?.lowestScore || "N/A"}`],
        [],
        [],
      ],
      { origin: "A1" }
    );

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Score Sheet");

    // Generate Excel file and trigger download
    const fileName = `Score_Sheet_${testData?.testName || "test"}_${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className="bg-green-50 min-h-screen">
      {/* Header */}
      <div className="bg-green-400 p-4 shadow-md">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => {
                  navigate("/home/test_history");
                }}
                className="p-2 rounded-full hover:bg-green-500 mr-2"
              >
                <ChevronLeft className="text-white" size={24} />
              </button>
              <h1 className="text-white text-xl font-bold">Test Details</h1>
            </div>
            <button
              onClick={exportToExcel}
              className="flex items-center bg-white text-green-600 px-4 py-2 rounded-lg shadow hover:bg-green-50"
            >
              <FileDown size={18} className="mr-2" />
              Export to Excel
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto p-4">
        {/* Test info card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-green-700 mb-4">
            {testData?.testName}
          </h2>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center">
              <Book className="text-green-500 mr-2" size={20} />
              <div>
                <p className="text-gray-600 text-sm">Class</p>
                <p className="font-medium">{testData?.className}</p>
              </div>
            </div>
            <div className="flex items-center">
              <School className="text-green-500 mr-2" size={20} />
              <div>
                <p className="text-gray-600 text-sm">Room</p>
                <p className="font-medium">{testData?.roomId}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Clock className="text-green-500 mr-2" size={20} />
              <div>
                <p className="text-gray-600 text-sm">Start Time</p>
                <p className="font-medium">{formatDate(testData?.startTime)}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Clock className="text-green-500 mr-2" size={20} />
              <div>
                <p className="text-gray-600 text-sm">End Time</p>
                <p className="font-medium">{formatDate(testData?.endTime)}</p>
              </div>
            </div>
            <div className="flex items-center">
              <User className="text-green-500 mr-2" size={20} />
              <div>
                <p className="text-gray-600 text-sm">Number of Submissions</p>
                <p className="font-medium">{testData?.numberOfSubmissions}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Clock className="text-green-500 mr-2" size={20} />
              <div>
                <p className="text-gray-600 text-sm">Test Duration</p>
                <p className="font-medium">
                  {calculateDuration(testData?.startTime, testData?.endTime)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b">
            <button
              className={`px-6 py-3 text-center flex-1 font-medium ${
                activeTab === "overview"
                  ? "text-green-600 border-b-2 border-green-500"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </button>
            <button
              className={`px-6 py-3 text-center flex-1 font-medium ${
                activeTab === "submissions"
                  ? "text-green-600 border-b-2 border-green-500"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("submissions")}
            >
              Submissions List
            </button>
          </div>

          {activeTab === "overview" && (
            <div className="p-6">
              {/* Statistics cards */}
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-sm text-gray-600 mb-1">Average Score</p>
                  <p className="text-2xl font-bold text-green-700">
                    {testData?.averageScore}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-sm text-gray-600 mb-1">Highest Score</p>
                  <p className="text-2xl font-bold text-green-700">
                    {testData?.highestScore}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-sm text-gray-600 mb-1">Lowest Score</p>
                  <p className="text-2xl font-bold text-green-700">
                    {testData?.lowestScore}
                  </p>
                </div>
              </div>

              {/* Chart.js Score distribution chart */}
              <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Score Distribution
                </h3>
                <div className="h-64">
                  <canvas ref={chartRef}></canvas>
                </div>
              </div>

              {/* Additional statistics */}
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Detailed Statistics
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Completion Rate</p>
                    <div className="mt-2 h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500"
                        style={{ width: "100%" }}
                      ></div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      3/3 students (100%)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "submissions" && (
            <div className="p-6">
              <div className="mb-4 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">
                  Submissions List ({submissionData.length})
                </h3>
                <button
                  onClick={exportToExcel}
                  className="flex items-center bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600"
                >
                  <FileDown size={16} className="mr-1" />
                  Export to Excel
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                        No.
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                        Student ID
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                        Student Name
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                        Score
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                        Submission Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {submissionData.map((submission, index) => (
                      <tr key={submission._id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-800">
                          {index + 1}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-800">
                          {submission.studentId}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-800">
                          {submission.userName}
                        </td>
                        <td className="py-3 px-4 text-sm font-medium text-green-600">
                          {submission.score}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-800">
                          {formatDate(submission.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
