import { useContext, useState } from "react";
import { QuizzContext } from "../../context/ContextProvider";
import { Link, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import { toast } from "react-toastify";
import axios from "axios";
const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { setSocket } = useContext(QuizzContext);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const navigate = useNavigate();
  const BACK_END_LOCAL_URL = import.meta.env.VITE_LOCAL_API_CALL_URL;
  const BACK_END_SOCKET_URL = import.meta.env.BACK_END_SOCKET_URL;

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [resetEmail, setResetEmail] = useState("");

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${BACK_END_LOCAL_URL}/login`, {
        email: formData.email,
        password: formData.password,
      });

      const res = response.data;
      const role = res.role;

      // Remember to set token
      localStorage.setItem("role", role);
      localStorage.setItem("userID", res.id);
      localStorage.setItem("userEmail", res.email);
      localStorage.setItem("userName", res.username);
      localStorage.setItem("studentId", res.student_id);

      setSocket(
        io(`https://backend-quizz-deploy.onrender.com`, {
          query: { userId: res.id, role },
          withCredentials: true,
          extraHeaders: {
            "my-custom-header": "abcd",
          },
        })
      );

      toast.success(`Login Successful!`);
      role === "student"
        ? navigate("/home/my_submission")
        : navigate("/home/library");
    } catch (error) {
      console.log(error);
      toast.error("Error Login");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      // Gọi API để gửi yêu cầu reset password
      const result = await fetch(
        `${BACK_END_LOCAL_URL}/users/request-password-reset`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({
            email: resetEmail,
          }),
        }
      );

      if (result.ok) {
        toast.success("Reset password link has been sent to your email");
        setIsForgotPassword(false); // Trở về màn hình đăng nhập
      } else {
        toast.error("Failed to send reset password email");
      }
    } catch (error) {
      console.log(error);
      toast.error("An error occurred. Please try again later.");
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full bg-white">
      {/* Left Panel - Login Form or Forgot Password Form */}
      <div className="w-full md:w-1/2 p-4 sm:p-8 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full">
          <h1 className="text-xl sm:text-2xl font-bold mb-2 text-gray-800">
            Welcome to <span className="text-green-400">Quizzes</span> Community
          </h1>

          {!isForgotPassword ? (
            <>
              <p className="mb-4 sm:mb-6 text-sm text-gray-600">
                Don't have an account?{" "}
                <Link
                  to={"/signup"}
                  href="#"
                  className="text-green-600 hover:underline"
                >
                  Sign up
                </Link>
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm mb-1 text-gray-700"
                  >
                    Email
                  </label>
                  <input
                    type="text"
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

                {/* Remember Me & Forgot Password */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-600">Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(true)}
                    className="text-sm text-green-600 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-colors"
                >
                  Log in
                </button>

                {/* Signup Link for smaller screens */}
                <div className="sm:hidden text-center text-sm text-gray-600">
                  New to Design Community?{" "}
                  <a href="#" className="text-green-600 hover:underline">
                    Create an account
                  </a>
                </div>
              </form>
            </>
          ) : (
            <>
              <p className="mb-4 sm:mb-6 text-sm text-gray-600">
                Enter your email address and we'll send you a link to your email
                to reset your password.
              </p>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label
                    htmlFor="resetEmail"
                    className="block text-sm mb-1 text-gray-700"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="resetEmail"
                    name="resetEmail"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-300"
                    required
                  />
                </div>

                {/* Reset Password Button */}
                <button
                  type="submit"
                  className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-colors"
                >
                  Send Reset Link
                </button>

                {/* Back to Login */}
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(false)}
                  className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 transition-colors"
                >
                  Back to Login
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Right Panel - Background Image with Green Overlay */}
      <div className="hidden md:block md:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 opacity-60 z-10"></div>
        <img
          src="images/new_background.png"
          alt="3D geometric shapes"
          className="w-full h-full object-cover object-center absolute inset-0"
        />
      </div>
    </div>
  );
};

export default Login;
