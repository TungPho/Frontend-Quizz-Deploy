import HomeNavBar from "../components/HomeNavBar";
import { FaSchool } from "react-icons/fa";
import { FaEdit } from "react-icons/fa";
import { LiaUserEditSolid } from "react-icons/lia";
import SideBar from "../components/SideBar";
import { useEffect, useState } from "react";
import axios from "axios";

const Profile = () => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    school_name: "",
    role: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // For edit form
  const [formName, setFormName] = useState("");
  const [formSchool, setFormSchool] = useState("");

  const userID = localStorage.getItem("userID");

  // Fetch user data function
  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:3000/api/v1/users/${userID}`
      );

      // Get user data from response
      const user = response.data.metadata;

      // Update state with fetched data
      setUserData({
        name: user.user_attributes?.name || "",
        email: user.email || "",
        school_name: user.user_attributes?.school_name || "",
        role: user.role || "",
      });

      // Also update form fields
      setFormName(user.user_attributes?.name || "");
      setFormSchool(user.user_attributes?.school_name || "");

      setLoading(false);
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError("Failed to load user data");
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (userID) {
      fetchUserData();
    }
  }, [userID]);

  const handleOpenModal = () => {
    // Set form values to current user data
    setFormName(userData.name);
    setFormSchool(userData.school_name);
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
  };

  const handleSaveChanges = async () => {
    try {
      const response = await axios.put(
        `http://localhost:3000/api/v1/users/${userID}`,
        {
          name: formName,
          school_name: formSchool,
        }
      );

      console.log("Update response:", response.data);

      // Fetch updated user data to refresh the display
      fetchUserData();

      setShowEditModal(false);
    } catch (err) {
      console.error("Error updating user:", err);
      alert("Failed to update profile. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-100">
        <HomeNavBar />
        <div className="flex flex-grow">
          <SideBar />
          <div className="flex-grow flex items-center justify-center">
            <p>Loading profile data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-100">
        <HomeNavBar />
        <div className="flex flex-grow">
          <SideBar />
          <div className="flex-grow flex items-center justify-center">
            <p className="text-red-500">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-100">
      <HomeNavBar />
      <div className="flex flex-grow">
        <SideBar />
        <div className="flex-grow px-4 py-6 md:px-8">
          {/* Profile Card */}
          <div className="bg-white w-full md:w-4/5 lg:w-3/5 mx-auto p-4 md:p-6 rounded-2xl shadow-sm">
            <div className="flex flex-col md:flex-row md:justify-between">
              <div className="flex flex-col md:flex-row items-center md:items-start">
                <img
                  className="rounded-full w-20 h-20 md:w-24 md:h-24 mr-0 md:mr-5 mb-3 md:mb-0 cursor-pointer hover:opacity-75"
                  src="/images/avatar.png"
                  alt="Profile avatar"
                />
                <div className="flex flex-col text-center md:text-left">
                  <div className="flex flex-col md:flex-row items-center md:items-start">
                    <p className="font-sans font-medium text-lg">
                      {userData.name}
                    </p>
                    <p className="md:ml-3 mt-1 md:mt-0 rounded-full px-3 py-1 text-xs text-white bg-green-500">
                      {userData.role.charAt(0).toUpperCase() +
                        userData.role.slice(1)}
                    </p>
                  </div>
                  <p className="font-sans text-gray-600 text-sm mt-1">
                    {userData.email}
                  </p>
                  <div className="mt-2">
                    <p className="font-sans font-medium">Mathematics</p>
                    <p className="flex items-center justify-center md:justify-start text-sm mt-1">
                      <FaSchool className="mr-2 text-green-500" />
                      {userData.school_name}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4 md:mt-0 flex justify-center md:justify-end">
                <button
                  className="flex items-center font-sans border border-slate-300 p-2 rounded hover:bg-slate-50 transition-colors"
                  onClick={handleOpenModal}
                >
                  <FaEdit className="mr-1" />
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <LiaUserEditSolid className="mr-2 text-xl" />
                <p className="font-medium">Edit profile</p>
              </div>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={handleCloseModal}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Edit Your Name
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                School / Organization
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                value={formSchool}
                onChange={(e) => setFormSchool(e.target.value)}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                onClick={handleCloseModal}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                onClick={handleSaveChanges}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
