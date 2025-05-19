import { useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { QuizzContext } from "../context/ContextProvider";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const { state } = useContext(QuizzContext);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, state]); // Mỗi khi pathname thay đổi, cuộn lên đầu

  return null;
};

export default ScrollToTop;
