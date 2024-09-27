import { AnimatePresence } from "framer-motion";

import { useAppDispatch, useAppSelector } from "../../../hooks/reduxStore";
import Notification from "./Notification";
import { useEffect } from "react";
import { notificationSystemActions } from "../../../store/UI/notificationSystemSlice";

export default function NotificationsWrapper() {
  const notifications = useAppSelector((state) => state.notificationSystem);
  const dispatch = useAppDispatch();

  // useEffect(() => {
  //   const timer = setTimeout(
  //     () => {
  //       for (let i = 0; i < 10; i++) {
  //         dispatch(
  //           notificationSystemActions.ADD_NOTIFICATION({
  //             content:
  //               "Loading...Loading...Loading...Loading...Loading...Loading...Loading...Loading...Loading...Loading...",
  //             type:
  //               i % 3 === 0 ? "success" : i % 3 === 1 ? "information" : "error",
  //           })
  //         );
  //       }
  //     }
  //     // 2000
  //   );

  //   return () => clearTimeout(timer);
  // }, [dispatch]);

  useEffect(() => {
    const notificationsRefreshInterval = setInterval(
      () => dispatch(notificationSystemActions.REFRESH_NOTIFICATIONS()),
      100
    );

    return () => clearInterval(notificationsRefreshInterval);
  }, [dispatch]);

  return (
    <section className="flex flex-col fixed left-0 bottom-0 gap-4 z-40 px-4 py-4 w-[30vw] transition-all">
      <AnimatePresence>
        {notifications.map((notification) => (
          <Notification notification={notification} key={notification.id} />
        ))}
      </AnimatePresence>
    </section>
  );
}
