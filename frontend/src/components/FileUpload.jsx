import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
const FileUpload = ({ onFileUpload }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const userID = localStorage.getItem("userID");
  const [classes, setClasses] = useState();
  const [selectedClass, setSelectedClass] = useState("");

  //fetch all classes by userid
  useEffect(() => {
    const fetchClasses = async () => {
      const req = await fetch(
        `http://localhost:3000/api/v1/teacher_get_classes/${userID}`
      );
      const res = await req.json();
      setClasses(res.metadata);
    };
    fetchClasses();
  }, [userID]);

  // teacher's info
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setError("");
    } else if (selectedFile) {
      setError("Chỉ hỗ trợ file PDF");
      setFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Vui lòng chọn file PDF");
      return;
    }
    if (!selectedClass) {
      setError("Please Select Class To Upload The Document");
      return;
    }
    const formData = new FormData();
    formData.append("pdf", file);
    formData.append("teacherId", userID);
    formData.append("classId", selectedClass);

    setLoading(true);
    setError("");
    try {
      const response = await fetch("http://localhost:3000/api/v1/documents", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Lỗi khi tải file lên");
      }
      toast.success("Upload File Success");
      const data = await response.json();
      console.log("newDoc", data.metadata);
      onFileUpload(data.metadata);
      setFile(null);
      // Reset file input
      document.getElementById("file-input").value = "";
      setSelectedClass("");
    } catch (err) {
      setError(err.message || "Đã xảy ra lỗi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-green-400 p-6 rounded-lg relative bottom-8 shadow-md max-w-md mx-auto my-8">
      <h2 className="text-2xl font-bold text-white mb-4 text-center">
        Upload PDF documents
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input
            type="file"
            id="file-input"
            onChange={handleFileChange}
            accept="application/pdf"
            disabled={loading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <label
            htmlFor="file-input"
            className="block w-full py-3 px-4 text-center rounded-md border-2 border-dashed border-white bg-green-300 hover:bg-green-200 transition duration-300 text-green-800 font-medium cursor-pointer"
          >
            {file ? file.name : "Chọn file PDF"}
          </label>
        </div>
        <select
          onChange={(e) => {
            console.log(e.target.value);
            setSelectedClass(e.target.value);
          }}
          className="block w-full py-3 px-4 text-center rounded-md border-2"
          value={selectedClass}
          name=""
          id=""
        >
          <option value="">Select Class</option>
          {classes?.map((c, index) => {
            return (
              <option key={index} value={c._id}>
                {c.name}
              </option>
            );
          })}
        </select>
        {file && (
          <div className="bg-white bg-opacity-20 p-3 rounded-md text-white">
            <p className="text-sm">Tên file: {file.name}</p>
            <p className="text-sm">
              Kích thước: {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        )}

        {error && (
          <p className="text-red-700 bg-red-100 p-2 rounded-md text-sm font-medium">
            {error}
          </p>
        )}

        <button
          type="submit"
          className={`w-full py-3 rounded-md font-medium transition duration-300 ${
            !file || loading
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-green-600 text-white hover:bg-green-700"
          }`}
          disabled={!file || loading}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Đang tải lên...
            </span>
          ) : (
            "Tải lên"
          )}
        </button>
      </form>
    </div>
  );
};
FileUpload.propTypes = {
  onFileUpload: PropTypes.func,
};
export default FileUpload;
