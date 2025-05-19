import { NavLink, useNavigate } from "react-router-dom";
import { FaPlus } from "react-icons/fa";
import { IoLibrary } from "react-icons/io5";
import { TbReportSearch } from "react-icons/tb";
import { MdClass } from "react-icons/md";
import { GoChecklist } from "react-icons/go";
import { RiMenuFoldLine, RiMenuUnfoldLine } from "react-icons/ri";
import { IoMdClose } from "react-icons/io";
import { useContext, useEffect, useRef, useState } from "react";
import { QuizzContext } from "../context/ContextProvider";
import { toast } from "react-toastify";

const SideBar = () => {
  const role = localStorage.getItem("role");
  const modal = useRef(null);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { collapsed, setCollapsed } = useContext(QuizzContext);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isCreatingClass, setIsCreatingClass] = useState(false);
  const [className, setClassName] = useState("");
  const BACK_END_LOCAL_URL = import.meta.env.VITE_LOCAL_API_CALL_URL;
  const userID = localStorage.getItem("userID");
  const showModal = () => {
    setIsOpen(true);
    setIsCreatingClass(false);
  };

  const closeModal = () => {
    setIsOpen(false);
    setIsCreatingClass(false);
    setClassName("");
  };

  const handleCreateClass = async () => {
    const req = await fetch(`${BACK_END_LOCAL_URL}/classes`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        name: className,
        teacherId: userID,
      }),
    });

    const res = await req.json();
    console.log(res);
    if (req.status !== 200) {
      toast.error(res.error);
      return;
    }
    toast.success("Create a class success");
    // Refresh classes after creating a new one

    closeModal();
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"; // Disable scroll
    } else {
      document.body.style.overflow = "auto"; // Enable scroll
    }

    const handleResize = () => {
      const newIsMobile = window.innerWidth <= 768;
      setIsMobile(newIsMobile);

      // Auto-collapse on mobile but don't auto-expand on desktop
      if (newIsMobile && !collapsed) {
        setCollapsed(true);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      document.body.style.overflow = "auto"; // Cleanup when unmount
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen, collapsed, setCollapsed]);

  // Calculate sidebar width classes
  const sidebarWidthClass = collapsed
    ? "w-0 lg:w-20 overflow-hidden"
    : "w-72 lg:w-64";

  // Calculate content margin
  const contentMarginClass = collapsed ? "ml-0 lg:ml-20" : "ml-0 lg:ml-64";

  return (
    <div className="relative">
      {/* Mobile hamburger - only visible when sidebar is collapsed on mobile */}
      {collapsed && isMobile && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 bg-white p-2 rounded-full shadow-lg text-gray-600 hover:bg-gray-100 transition-all duration-300 flex items-center justify-center w-10 h-10 lg:hidden"
          aria-label="Open menu"
        >
          <RiMenuUnfoldLine size={20} />
        </button>
      )}

      {/* Sidebar */}
      <div
        className={`flex flex-col justify-between h-screen border-r border-gray-300 fixed top-0 left-0 text-gray-700 bg-white z-40 shadow-lg transition-all duration-300 ease-in-out ${sidebarWidthClass}`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Area with Toggle */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <NavLink
              className="text-[#31cd63] text-3xl font-bold flex items-center"
              to={"/"}
            >
              {collapsed && !isMobile ? "Q" : "Quizzes"}
            </NavLink>

            {/* Toggle button next to logo */}
            <button
              onClick={toggleSidebar}
              className="text-gray-500 hover:text-gray-700 p-1 rounded-md hover:bg-gray-100 transition-colors duration-200"
              aria-label="Toggle sidebar"
            >
              {collapsed ? (
                <RiMenuUnfoldLine size={22} />
              ) : (
                <RiMenuFoldLine size={22} />
              )}
            </button>
          </div>

          {/* University Name */}
          {!collapsed && (
            <div className="mx-4 my-4 p-2 border border-gray-300 rounded-lg text-xs text-center bg-gray-50 shadow-sm">
              University Of Transport And Communication
            </div>
          )}

          {/* Create/Join Button */}
          <div
            className={`${role === "student" ? "hidden" : ""} px-4 mb-6 mt-2`}
          >
            <button
              onClick={showModal}
              className={`flex justify-center items-center bg-[#31cd63] rounded-lg text-white py-2 px-4 w-full hover:bg-green-500 shadow-sm transition-all duration-200 ${
                collapsed && !isMobile ? "p-2" : ""
              }`}
            >
              <FaPlus
                className={collapsed && !isMobile ? "" : "mr-2"}
                size={collapsed && !isMobile ? 16 : 14}
              />
              Create
            </button>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 px-2">
            {/*để kiểm tra giao diện mobile hay không ? có thì ẩn chữ, còn không thì hiện*/}
            <NavLink
              to={"/home/library"}
              className={({ isActive }) =>
                `${
                  role === "student" ? "hidden" : ""
                } flex items-center py-3 px-4 my-1.5 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? "text-[#31cd63] bg-green-50 font-medium shadow-sm"
                    : "hover:bg-gray-100"
                } ${collapsed && !isMobile ? "justify-center" : ""}`
              }
            >
              <IoLibrary
                className={`${collapsed && !isMobile ? "" : "mr-3"}`}
                size={18}
              />
              {collapsed && !isMobile ? "" : "Library"}
            </NavLink>

            <NavLink
              to={
                role === "student"
                  ? "/home/my_submission"
                  : "/home/test_history"
              }
              className={({ isActive }) =>
                `flex items-center py-3 px-4 my-1.5 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? "text-[#31cd63] bg-green-50 font-medium shadow-sm"
                    : "hover:bg-gray-100"
                } ${collapsed && !isMobile ? "justify-center" : ""}`
              }
            >
              <TbReportSearch
                className={`${collapsed && !isMobile ? "" : "mr-3"}`}
                size={18}
              />
              {collapsed && !isMobile
                ? ""
                : role === "student"
                ? "My Submission"
                : "Test History"}
            </NavLink>

            <NavLink
              to={"/home/my_classes"}
              className={({ isActive }) =>
                `flex items-center py-3 px-4 my-1.5 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? "text-[#31cd63] bg-green-50 font-medium shadow-sm"
                    : "hover:bg-gray-100"
                } ${collapsed && !isMobile ? "justify-center" : ""}`
              }
            >
              <MdClass
                className={`${collapsed && !isMobile ? "" : "mr-3"}`}
                size={18}
              />
              {collapsed && !isMobile ? "" : "My Classes"}
            </NavLink>
          </nav>
        </div>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {!collapsed && isMobile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity duration-300 ease-in-out"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Create Options Modal */}
      <div ref={modal} className="flex justify-center z-50">
        {!isCreatingClass && (
          <div
            className={`${
              isOpen ? "flex" : "hidden"
            } fixed inset-0 z-50 bg-black bg-opacity-50 items-center justify-center`}
          >
            <div className="bg-white rounded-lg p-6 w-full max-w-3xl mx-4 animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Create</h3>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={closeModal}
                >
                  <IoMdClose size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  onClick={() => {
                    navigate("/question_type_choosing");
                    closeModal();
                  }}
                  className="flex flex-col items-center justify-center p-6 border border-gray-300 rounded-lg hover:border-[#31cd63] hover:shadow-md transition-all duration-200 cursor-pointer"
                >
                  <GoChecklist className="text-3xl mb-3 text-[#31cd63]" />
                  <span>Create Assessments</span>
                </div>

                <div
                  onClick={() => {
                    setIsCreatingClass(true);
                  }}
                  className="flex flex-col items-center justify-center p-6 border border-gray-300 rounded-lg hover:border-[#31cd63] hover:shadow-md transition-all duration-200 cursor-pointer"
                >
                  <MdClass className="text-3xl mb-3 text-[#31cd63]" />
                  <span>Create Classes</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Class Modal */}
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${
            isOpen && isCreatingClass ? "" : "hidden"
          }`}
        >
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Create Class
              </h2>
              <button
                onClick={closeModal}
                className="border border-slate-500 rounded-full p-2 text-gray-400 hover:bg-slate-300"
              >
                <IoMdClose />
              </button>
            </div>

            <p className="text-sm text-slate-500 font-sans">Enter class name</p>
            <input
              onChange={(e) => setClassName(e.target.value)}
              value={className}
              className="w-full mb-4 mt-2 border rounded-md border-slate-400 text-sm font-sans focus:outline-none p-2"
              type="text"
              placeholder="Try 'CNTT-2' Or 'Math Class'"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={closeModal}
                className="border border-gray-300 bg-white text-gray-700 px-4 py-2 rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateClass}
                className="bg-green-400 text-white px-4 py-2 rounded-md hover:bg-green-500"
                disabled={!className.trim()}
              >
                Create Class
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content padding when sidebar is open */}
      <div
        className={`transition-all duration-300 ease-in-out ${contentMarginClass}`}
      ></div>
    </div>
  );
};

export default SideBar;
