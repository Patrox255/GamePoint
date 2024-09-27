import { motion } from "framer-motion";
import { useCallback } from "react";

import {
  INotification,
  notificationSystemActions,
} from "../../../store/UI/notificationSystemSlice";
import Header from "../headers/Header";
import { useAppDispatch } from "../../../hooks/reduxStore";
import HeaderLinkOrHeaderAnimation from "../headers/HeaderLinkOrHeaderAnimation";

export default function Notification({
  notification,
}: {
  notification: INotification;
}) {
  const backgroundTailwindClass = `bg-highlight${
    notification.type === "error" || notification.type === "validationErrors"
      ? "Red"
      : notification.type === "success"
      ? "Green"
      : "Loading"
  }`;
  const dispatch = useAppDispatch();
  const { id } = notification;

  const handleRemoveNotification = useCallback(
    () => dispatch(notificationSystemActions.REMOVE_SPECIFIC_NOTIFICATION(id)),
    [dispatch, id]
  );

  return (
    <motion.section
      className={`notification ${backgroundTailwindClass} px-8 py-4 rounded-xl w-full flex justify-center items-center flex-col text-defaultFont font-bold text-wrap text-center gap-4 overflow-hidden`}
      initial={{ opacity: 0, translateX: "1rem", scale: 1.1 }}
      animate={{ opacity: 0.7, translateX: 0, scale: 1 }}
      whileHover={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      layout
    >
      <span className="notification-content w-full text-wrap">
        {notification.content}
      </span>
      <HeaderLinkOrHeaderAnimation
        onClick={handleRemoveNotification}
        onlyAnimation
        customWhileHoverColor="darkerBg"
      >
        <Header>Close</Header>
      </HeaderLinkOrHeaderAnimation>
    </motion.section>
  );
}
