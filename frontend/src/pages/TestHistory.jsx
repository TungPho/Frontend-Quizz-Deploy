import { useContext, useState, useEffect } from "react";
import HomeNavBar from "../components/HomeNavBar";
import SideBar from "../components/SideBar";
import { QuizzContext } from "../context/ContextProvider";
import { NavLink } from "react-router-dom";

const TestHistory = () => {
  const { collapsed } = useContext(QuizzContext);
  const [testHistory, setTestHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const userID = localStorage.getItem("userID");

  useEffect(() => {
    setTimeout(() => {
      const fetchTestHistory = async () => {
        const req = await fetch(
          `http://localhost:3000/api/v1/test_history/${userID}`
        );
        const res = await req.json();
        console.log(res);
        setTestHistory(res.metadata);
      };
      fetchTestHistory();

      setLoading(false);
    }, 1000);
  }, [userID]);

  return (
    <div className="bg-green-50 min-h-screen">
      <HomeNavBar />
      <SideBar />
      <div
        className={`transition-all duration-300 ease-in-out p-6 ${
          collapsed ? "ml-16" : "ml-64"
        }`}
      >
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-green-200">
          <div className="bg-green-400 text-white px-6 py-4">
            <h1 className="text-2xl font-bold">Test History</h1>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64 bg-white">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
          ) : testHistory.length === 0 ? (
            <div className="text-center py-20 bg-white">
              <div className="rounded-full bg-green-100 w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-green-500"
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
              </div>
              <p className="text-gray-500 text-lg">
                Your Test history is empty !
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto bg-white">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-green-50 text-green-700 text-sm">
                    <th className="py-3 px-6 text-left font-medium">
                      Test Name
                    </th>
                    <th className="py-3 px-6 text-left font-medium">RoomID</th>
                    <th className="py-3 px-6 text-left font-medium">
                      Class Name
                    </th>
                    <th className="py-3 px-6 text-left font-medium">
                      Start Time
                    </th>
                    <th className="py-3 px-6 text-left font-medium">
                      End Time
                    </th>
                    <th className="py-3 px-6 text-center font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 text-sm">
                  {testHistory.map((test, index) => (
                    <tr
                      key={test.id}
                      className={`border-b border-gray-100 hover:bg-green-50 ${
                        index % 2 === 0 ? "bg-white" : "bg-green-50"
                      }`}
                    >
                      <td className="py-4 px-6 text-left font-medium text-green-700">
                        {test.testName}
                      </td>
                      <td className="py-4 px-6 text-left">{test.roomId}</td>
                      <td className="py-4 px-6 text-left">{test.className}</td>
                      <td className="py-4 px-6 text-left">{test.startTime}</td>
                      <td className="py-4 px-6 text-left">{test.endTime}</td>
                      <td className="py-4 px-6 text-center">
                        <NavLink
                          to={`/home/test_history/${test._id}`}
                          className="bg-green-400 hover:bg-green-500 text-white py-1 px-4 rounded-full text-xs mr-2 transition-all"
                        >
                          Details
                        </NavLink>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="bg-white px-6 py-3 border-t border-green-100">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                1-{testHistory.length} in {testHistory.length} tests
              </div>
              <div className="flex space-x-1">
                <button className="px-3 py-1 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-all">
                  Previous
                </button>
                <button className="px-3 py-1 bg-green-400 text-white rounded hover:bg-green-500 transition-all">
                  1
                </button>
                <button className="px-3 py-1 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-all">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestHistory;
