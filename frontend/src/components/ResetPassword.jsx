import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import RoomNotExist from "./RoomNotExist";
import { useParams } from "react-router-dom";
// Giả định rằng id và token được truyền vào như props thay vì useParams
const ResetPassword = () => {
  const [isVerify, setIsVerify] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [success, setSuccess] = useState(false);
  const BACK_END_LOCAL_URL = "http://localhost:3000/api/v1"; // Giả định URL backend

  const { id, token } = useParams();
  // fetch to verify user then render this page else show 404
  useEffect(() => {
    const verifyUser = async () => {
      setIsLoading(true);
      try {
        const reqVerify = await fetch(
          `http://localhost:3000/api/v1/users/verify`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: id,
              token,
            }),
          }
        );

        console.log(reqVerify);
        if (reqVerify.status === 200) {
          toast.success("Verified");
          setIsVerify(true);
        }
      } catch (error) {
        console.error("Verification error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    verifyUser();
  }, [id, token, BACK_END_LOCAL_URL]);

  const validatePassword = () => {
    if (newPassword.length < 6) {
      setPasswordError("Mật khẩu phải có ít nhất 6 ký tự");
      return false;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Mật khẩu không khớp");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) {
      return;
    }

    setIsLoading(true);
    try {
      const reqChangePassword = await fetch(
        `${BACK_END_LOCAL_URL}/users/reset-password/${id}/${token}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({
            password: newPassword,
          }),
        }
      );
      const res = await reqChangePassword.json();
      if (reqChangePassword.ok) {
        setSuccess(true);
      } else {
        setPasswordError(res.message || "Đã xảy ra lỗi khi đổi mật khẩu");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      setPasswordError("Đã xảy ra lỗi khi kết nối đến máy chủ");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !isVerify) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-400">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
          <p className="text-center mt-4 text-gray-600">Đang xác thực...</p>
        </div>
      </div>
    );
  }
  if (!isVerify && !isLoading) {
    return <RoomNotExist />;
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-green-400 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        {success ? (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Đổi mật khẩu thành công!
            </h2>
            <p className="text-gray-600 mb-6">
              Bạn có thể đăng nhập với mật khẩu mới ngay bây giờ.
            </p>
            <button
              onClick={() => (window.location.href = "/login")}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
            >
              Đăng nhập
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
              Đặt lại mật khẩu
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Mật khẩu mới
                </label>
                <input
                  id="password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  placeholder="Nhập mật khẩu mới"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Xác nhận mật khẩu
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  placeholder="Nhập lại mật khẩu mới"
                />
              </div>

              {passwordError && (
                <div className="text-red-500 text-sm">{passwordError}</div>
              )}

              <button
                onClick={handleChangePassword}
                disabled={isLoading}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                    Đang xử lý...
                  </>
                ) : (
                  "Đổi mật khẩu"
                )}
              </button>

              <div className="text-center mt-4">
                <a
                  href="/login"
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  Quay lại trang đăng nhập
                </a>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
