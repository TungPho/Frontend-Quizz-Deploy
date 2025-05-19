/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import io from "socket.io-client";
const s = io(`ws://localhost:3000`);
export const QuizzContext = createContext();
const ContextProvider = (props) => {
  // role, token  and userID
  const [role, setRole] = useState("");
  const [state, setState] = useState("normal");
  const [socket, setSocket] = useState(s);
  // for submissions
  const [submissions, setSubmissions] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [examProgress, setExamProgress] = useState(null);
  const [isStartPermit, setIsStartPermit] = useState(false);
  // fetch notifications here
  const userID = localStorage.getItem("userID");

  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const reqNotifi = await fetch(
        `http://localhost:3000/api/v1/notification/${userID}`
      );
      const res = await reqNotifi.json();
      console.log(res.metadata);
      setNotifications(res.metadata);
    };
    fetchNotifications();
  }, [userID]);
  const value = {
    role,
    setRole,
    setState,
    state,
    socket,
    setSocket,
    collapsed,
    setCollapsed,
    submissions,
    setSubmissions,
    setTimeRemaining,
    timeRemaining,
    examProgress,
    setExamProgress,
    isStartPermit,
    setIsStartPermit,
    notifications,
    setNotifications,
  };
  return (
    <QuizzContext.Provider value={value}>
      {props.children}
    </QuizzContext.Provider>
  );
};
ContextProvider.propTypes = {
  children: PropTypes.any,
};
export default ContextProvider;
