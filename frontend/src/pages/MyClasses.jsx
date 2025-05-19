import { useContext, useEffect, useState } from "react";
import { CiSearch } from "react-icons/ci";
import { FaCirclePlus } from "react-icons/fa6";
import { IoMdClose } from "react-icons/io";
import { CiMenuKebab } from "react-icons/ci";
import { Link } from "react-router-dom";
import HomeNavBar from "../components/HomeNavBar";
import SideBar from "../components/SideBar";
import { toast } from "react-toastify";
import { QuizzContext } from "../context/ContextProvider";
const MyClasses = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [className, setClassName] = useState("");
  // remember to get all classes from teacher's id
  const [classes, setClasses] = useState([]);
  const [isEditClass, setIsEditClass] = useState(false);
  const [currentClassId, setCurrentClassId] = useState(null);
  const userID = localStorage.getItem("userID");
  const [activeMenu, setActiveMenu] = useState(null);
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userID");
  const BACK_END_LOCAL_URL = import.meta.env.VITE_LOCAL_API_CALL_URL;
  const { collapsed } = useContext(QuizzContext);
  const [searchValue, setSearchValue] = useState("");
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
    fetchClasses();
  };

  const handleEditClass = async () => {
    if (!currentClassId) return;
    const req = await fetch(`${BACK_END_LOCAL_URL}/classes/${currentClassId}`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "PUT",
      body: JSON.stringify({
        class_name: className,
      }),
    });
    const res = await req.json();
    console.log(res);
    if (req.status !== 200) {
      toast.error(res.error);
      return;
    }
    // Refresh classes after editing
    fetchClasses();
  };

  const handleDeleteClass = async (classId) => {
    if (!classId) return;
    if (window.confirm("Are you sure you want to delete this class?")) {
      const req = await fetch(`${BACK_END_LOCAL_URL}/classes/${classId}`, {
        method: "DELETE",
      });
      const res = await req.json();
      console.log(res);
      if (req.status !== 200) {
        toast.error(res.error);
        return;
      }
      // Refresh classes after deleting
      toast.success("Delete class success");
      fetchClasses();
    }
  };

  const handleOpenMenu = (index) => {
    if (activeMenu === index) {
      setActiveMenu(null);
    } else {
      setActiveMenu(index);
    }
  };

  const fetchClasses = async () => {
    const req =
      role === "teacher"
        ? await fetch(`${BACK_END_LOCAL_URL}/teacher_get_classes/${userId}`)
        : await fetch(`${BACK_END_LOCAL_URL}/student_get_classes/${userId}`);
    const classes = await req.json();
    setClasses(classes?.metadata);
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        !event.target.closest(".kebab-menu") &&
        !event.target.closest(".menu-content")
      ) {
        setActiveMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <SideBar />
      <HomeNavBar />
      {/* Modal for creating/editing class */}
      <div
        className={`transition-all duration-300 ease-in-out p-6 ${
          collapsed ? "ml-16" : "ml-64"
        }`}
      >
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50   ${
            isOpen ? "" : "hidden"
          } `}
        >
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {isEditClass ? "Edit class details" : "Create Class"}
              </h2>
              <button
                onClick={() => setIsOpen(false)}
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
                onClick={() => setIsOpen(false)}
                className="border border-gray-300 bg-white text-gray-700 px-4 py-2 rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (isEditClass) {
                    handleEditClass();
                  } else {
                    handleCreateClass();
                  }
                  setIsOpen(false);
                  setClassName("");
                }}
                className={`bg-green-400 text-white px-4 py-2 rounded-md hover:bg-green-500 `}
                disabled={!className.trim()}
              >
                {isEditClass ? "Save Changes" : "Create Class"}
              </button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className=" px-4 pt-6 pb-12 transition-all duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h1 className="text-2xl font-semibold text-gray-800 mb-4 sm:mb-0">
              My Classes
            </h1>

            <button
              onClick={() => {
                setIsOpen(true);
                setClassName("");
                setIsEditClass(false);
                setCurrentClassId(null);
              }}
              className={`${
                role === "student" ? "hidden" : ""
              } flex items-center justify-center w-full sm:w-auto bg-green-400 text-white rounded-md hover:bg-green-500 py-2 px-4 transition-colors`}
            >
              <FaCirclePlus className="mr-2" />
              Create a class
            </button>
          </div>

          <div className="w-full flex flex-col sm:flex-row items-center gap-4 mb-6">
            <div className="flex w-full sm:w-1/2 md:w-1/3 items-center text-slate-500 font-sans">
              <div className="flex items-center border-solid border-slate-400 border-[1px] rounded-3xl p-2 w-full">
                <CiSearch className="ml-2 text-lg" />
                <input
                  onChange={(e) => {
                    setSearchValue(e.target.value);
                  }}
                  className="w-full ml-2 focus:outline-none bg-transparent"
                  type="text"
                  placeholder="Search for a class"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes
              ?.filter((className) => {
                if (!searchValue) return className;
                return className.name
                  .toLowerCase()
                  .includes(searchValue.toLowerCase());
              })
              .map((c, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="h-2 bg-green-400"></div>
                  <div className="p-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium text-gray-800 mb-2">
                          {c.name}
                        </h3>
                        <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                          {c.students?.length || 0} students
                        </span>
                      </div>

                      <div className="relative">
                        <button
                          className={`p-2 rounded-full hover:bg-gray-100 transition kebab-menu ${
                            role === "student" ? "hidden" : ""
                          }`}
                          onClick={() => handleOpenMenu(index)}
                          aria-label="Menu"
                        >
                          <CiMenuKebab className="text-gray-600 text-xl" />
                        </button>

                        {activeMenu === index && (
                          <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-50 menu-content border border-gray-100 py-1 flex flex-col">
                            <button
                              onClick={() => {
                                setIsOpen(true);
                                setIsEditClass(true);
                                setClassName(c.name);
                                setCurrentClassId(c._id);
                                setActiveMenu(null);
                              }}
                              className="flex w-full text-left items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-500 border-b border-gray-100"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                handleDeleteClass(c._id);
                                setActiveMenu(null);
                              }}
                              className="flex w-full text-left items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 font-medium"
                            >
                              Delete class
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 flex justify-between items-center">
                      <Link
                        to={
                          role === "student"
                            ? `/student_class/${c._id}`
                            : `/teacher_class/${c._id}`
                        }
                        className="inline-flex items-center text-green-500 hover:text-green-600 text-sm font-medium"
                      >
                        Go to classroom
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 ml-1"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {classes?.length === 0 && role !== "student" && (
            <div
              className={`bg-white border border-gray-200 rounded-lg p-8 text-center shadow-sm`}
            >
              <div className="text-gray-500 mb-4">No classes yet</div>
              <button
                onClick={() => {
                  setIsOpen(true);
                  setClassName("");
                  setIsEditClass(false);
                }}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-400 text-white rounded-md hover:bg-green-500 transition-colors"
              >
                <FaCirclePlus />
                Create your first class
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyClasses;
