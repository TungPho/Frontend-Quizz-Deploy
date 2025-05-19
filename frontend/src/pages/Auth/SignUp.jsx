import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const SignUp = () => {
  const [formStep, setFormStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "",
    firstName: "",
    lastName: "",
    school: "",
    studentId: "",
    receiveEmails: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    let user;
    if (formData.role === "student") {
      user = {
        email: formData.email,
        password: formData.password,
        role: "student",
        user_attributes: {
          name: formData.firstName + formData.lastName,
          student_id: formData.studentId,
          school_name: formData.school,
        },
      };
    } else {
      user = {
        email: formData.email,
        password: formData.password,
        role: "teacher",
        user_attributes: {
          name: formData.firstName + formData.lastName,
          school_name: formData.school,
        },
      };
    }

    const result = await fetch("http://localhost:3000/api/v1/users", {
      body: JSON.stringify(user),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    const res = await result.json();
    if (result.status !== 200) {
      toast.error(res.error);
      return;
    }
    toast.success("Sign Up Success, Please login to continue!");
    navigate("/login");
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleContinue = (e) => {
    e.preventDefault();
    if (formData.role) {
      setFormStep(2);
    }
  };

  const handleBack = () => {
    setFormStep(1);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full bg-white">
      {/* Left Panel - Form */}
      <div className="w-full md:w-1/2 p-4 sm:p-8 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full">
          <h1 className="text-xl sm:text-2xl font-bold mb-2 text-gray-800">
            Welcome to Design Community
          </h1>
          <p className="mb-4 sm:mb-6 text-sm text-gray-600">
            Already have an account?{" "}
            <Link to={"/login"} className="text-green-600 hover:underline">
              Log in
            </Link>
          </p>

          {formStep === 1 ? (
            <form onSubmit={handleContinue} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm mb-1 text-gray-700"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-300"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm mb-1 text-gray-700"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-300"
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-600"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              <div className="text-xs text-gray-600">
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span>Use 8 or more characters</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span>One uppercase character</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span>One special character</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span>One number</span>
                  </li>
                </ul>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm mb-2 text-gray-700">
                  Choose your role
                </label>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                  <label
                    className={`flex-1 p-3 border rounded-lg cursor-pointer flex flex-col items-center ${
                      formData.role === "teacher"
                        ? "border-green-500 bg-green-50"
                        : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="teacher"
                      checked={formData.role === "teacher"}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className="w-10 h-10 mb-2 flex items-center justify-center bg-green-100 rounded-full">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-green-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                    </div>
                    <span className="font-medium">Teacher</span>
                  </label>

                  <label
                    className={`flex-1 p-3 border rounded-lg cursor-pointer flex flex-col items-center ${
                      formData.role === "student"
                        ? "border-green-500 bg-green-50"
                        : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="student"
                      checked={formData.role === "student"}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className="w-10 h-10 mb-2 flex items-center justify-center bg-green-100 rounded-full">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-green-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
                        />
                      </svg>
                    </div>
                    <span className="font-medium">Student</span>
                  </label>
                </div>
                {formData.role === "" && (
                  <p className="text-xs text-red-500 mt-1">
                    Please select a role to continue
                  </p>
                )}
              </div>

              {/* Checkbox */}
              <div>
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    name="receiveEmails"
                    checked={formData.receiveEmails}
                    onChange={handleChange}
                    className="mt-1 mr-2"
                  />
                  <span className="text-sm text-gray-600">
                    I want to receive emails about the product, feature updates,
                    events, and marketing promotions.
                  </span>
                </label>
              </div>

              {/* Terms Agreement */}
              <div className="text-sm text-gray-600">
                <p>
                  By creating an account, you agree to the{" "}
                  <a href="#" className="text-green-600 hover:underline">
                    Terms of Use
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-green-600 hover:underline">
                    Privacy Policy
                  </a>
                  .
                </p>
              </div>

              {/* Continue Button */}
              <button
                type="submit"
                className={`w-full py-2 px-4 rounded transition-colors ${
                  formData.role
                    ? "bg-green-500 text-white hover:bg-green-600"
                    : "bg-gray-300 text-gray-700 hover:bg-gray-400"
                }`}
                disabled={!formData.role}
              >
                Continue
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm mb-1 text-gray-700"
                >
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-300"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm mb-1 text-gray-700"
                >
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-300"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="school"
                  className="block text-sm mb-1 text-gray-700"
                >
                  School
                </label>
                <input
                  type="text"
                  id="school"
                  name="school"
                  value={formData.school}
                  onChange={handleChange}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-300"
                  required
                />
              </div>

              {formData.role === "student" && (
                <div>
                  <label
                    htmlFor="studentId"
                    className="block text-sm mb-1 text-gray-700"
                  >
                    Student ID
                  </label>
                  <input
                    type="text"
                    id="studentId"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-300"
                    required
                  />
                </div>
              )}

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mt-6">
                <button
                  type="button"
                  onClick={handleBack}
                  className="w-full sm:w-1/2 bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-1/2 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-colors"
                >
                  Create account
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Right Panel - Background Image with Green Overlay */}
      <div className="hidden md:block md:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0  opacity-60 z-10"></div>
        <img
          src="images/new_background.png"
          alt="3D geometric shapes"
          className="w-full h-full object-cover object-center absolute inset-0"
        />
      </div>
    </div>
  );
};

export default SignUp;
