import { AnimatePresence } from "framer-motion";
import { isEqual } from "lodash";
import { useCallback, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "../../../hooks/reduxStore";
import Notification from "./Notification";
import {
  initialState,
  notificationSystemActions,
} from "../../../store/UI/notificationSystemSlice";
import generateInitialStateFromSearchParamsOrSessionStorage from "../../../helpers/generateInitialStateFromSearchParamsOrSessionStorage";

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

  const { search } = useLocation();
  const searchParams = useMemo(() => new URLSearchParams(search), [search]);
  const getNotificationsStateFromSessionStorage = useCallback(
    (returnFalseInCaseOfLuckOfSessionStorageValue?: boolean) =>
      generateInitialStateFromSearchParamsOrSessionStorage(
        initialState,
        searchParams,
        "notifications",
        false,
        false,
        returnFalseInCaseOfLuckOfSessionStorageValue ? false : undefined
      ),
    [searchParams]
  );

  // Setting initial state to the from session storage if such exists
  useEffect(() => {
    const notificationsStateFromSessionStorage =
      getNotificationsStateFromSessionStorage(true);
    if (
      !notificationsStateFromSessionStorage ||
      (Array.isArray(notificationsStateFromSessionStorage) &&
        notificationsStateFromSessionStorage.length === 0)
    )
      return;
    dispatch(
      notificationSystemActions.SET_STATE(notificationsStateFromSessionStorage)
    );
  }, [searchParams, dispatch, getNotificationsStateFromSessionStorage]);

  // Updating notifications session storage entry every time its state changes
  useEffect(() => {
    const notificationsStateFromSessionStorage =
      getNotificationsStateFromSessionStorage();
    if (!isEqual(notificationsStateFromSessionStorage, notifications))
      sessionStorage.setItem("notifications", JSON.stringify(notifications));
  }, [getNotificationsStateFromSessionStorage, notifications]);

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
