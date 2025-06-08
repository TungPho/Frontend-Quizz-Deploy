import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify"; // hoặc thư viện toast khác bạn đang dùng
const BACK_END_LOCAL_URL = import.meta.env.VITE_LOCAL_API_CALL_URL;

// API function để kiểm tra user active
const checkUserActive = async (userID) => {
  console.log(userID);
  try {
    const response = await fetch(
      `${BACK_END_LOCAL_URL}/users/check-active/${userID}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Thêm authorization header nếu cần
          // 'Authorization': `Bearer ${token}`
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to check user status");
    }

    const data = await response.json();
    console.log(data);
    return data.isActive;
  } catch (error) {
    console.error("Error checking user active status:", error);
    return false;
  }
};

export default function ProtectedLayout() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const userID = localStorage.getItem("userID");
  const location = useLocation();
  const [isCheckingActive, setIsCheckingActive] = useState(false);

  // Kiểm tra nếu người dùng đang ở trang /login
  const isLoginPage = location.pathname === "/login";

  // Function để xử lý logout khi user bị ban
  const handleUserBanned = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("userID");
    // Xóa thêm các thông tin khác nếu có
    toast.error("You've been banned! Please contact admin");
    navigate("/login");
  };

  // Effect để kiểm tra user active trên mỗi route change
  useEffect(() => {
    const checkActiveStatus = async () => {
      // Nếu có role và userID, và không phải trang login
      if (role && userID && !isLoginPage) {
        setIsCheckingActive(true);

        try {
          const isActive = await checkUserActive(userID);
          console.log(isActive);
          if (!isActive) {
            handleUserBanned();
            return;
          }
        } catch (error) {
          console.error("Error checking user active:", error);
          // Có thể chọn cách xử lý khác tùy vào yêu cầu
        } finally {
          setIsCheckingActive(false);
        }
      }
    };

    checkActiveStatus();
  }, [location.pathname, role, userID]); // Chạy lại khi đổi trang

  // Effect cho logic redirect ban đầu
  useEffect(() => {
    if ((role || userID) && isLoginPage) {
      role === "student"
        ? navigate("/home/my_submission")
        : navigate("/home/library");
    }
    if (!role || !userID) {
      navigate("/login"); // Nếu chưa đăng nhập, chuyển hướng về trang đăng nhập
    }
  }, [role, userID, navigate, isLoginPage]);

  // Hiển thị loading khi đang check active status
  if (isCheckingActive) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex">
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}
