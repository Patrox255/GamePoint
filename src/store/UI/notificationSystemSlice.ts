import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ReactNode } from "react";

export type notificationTypes =
  | "information"
  | "error"
  | "success"
  | "validationErrors";
const possibleApplicationFunctionalitiesIdentifiersArr = [
  "login",
  "logout",
  "fetchingProductsBasedOnProvidedData",
  "fetchingProductBasedOnProvidedData",
  "manageCartContent",
] as const;
export type possibleApplicationFunctionalitiesIdentifiers =
  (typeof possibleApplicationFunctionalitiesIdentifiersArr)[number];
export interface INotificationPropertiesRequiredWhenAddingOne {
  content: ReactNode;
  type: notificationTypes;
  relatedApplicationFunctionalityIdentifier: possibleApplicationFunctionalitiesIdentifiers;
  rawInformationToRecognizeSameNotifications?: string;
}
export interface INotification
  extends INotificationPropertiesRequiredWhenAddingOne {
  createdAtMiliseconds: number;
  id: number;
  visibilityDurationInSeconds: number;
}
export const initialState: INotification[] = [];

const notificationSystemSlice = createSlice({
  name: "notificationSystem",
  initialState,
  reducers: {
    ADD_NOTIFICATION(
      S,
      A: PayloadAction<INotificationPropertiesRequiredWhenAddingOne>
    ) {
      const {
        payload: {
          content,
          type,
          relatedApplicationFunctionalityIdentifier,
          rawInformationToRecognizeSameNotifications,
        },
      } = A;
      const alreadyExistentNotificationsRelatedToProvidedFunctionalityIdentifierAndOfTheSameType =
        S.filter(
          (notification) =>
            notification.relatedApplicationFunctionalityIdentifier ===
              relatedApplicationFunctionalityIdentifier &&
            notification.type === type
        );
      const possibleSameNotification =
        alreadyExistentNotificationsRelatedToProvidedFunctionalityIdentifierAndOfTheSameType.find(
          (notification) =>
            notification.rawInformationToRecognizeSameNotifications !==
              undefined &&
            rawInformationToRecognizeSameNotifications ===
              notification.rawInformationToRecognizeSameNotifications
        );
      if (possibleSameNotification) {
        possibleSameNotification.createdAtMiliseconds = +new Date();
        return S;
      }
      const newNotification = {
        content,
        type,
        id: (S.at(-1)?.id ?? -1) + 1,
        createdAtMiliseconds: +new Date(),
        visibilityDurationInSeconds: 5,
        relatedApplicationFunctionalityIdentifier,
        rawInformationToRecognizeSameNotifications,
      };
      return [
        ...S.filter(
          (notification) =>
            !alreadyExistentNotificationsRelatedToProvidedFunctionalityIdentifierAndOfTheSameType.some(
              (
                alreadyExistentNotificationRelatedToProvidedFunctionalityIdentifierAndOfTheSameType
              ) =>
                alreadyExistentNotificationRelatedToProvidedFunctionalityIdentifierAndOfTheSameType ===
                notification
            )
        ),
        newNotification,
      ];
    },
    REFRESH_NOTIFICATIONS(S) {
      const curDate = +new Date();
      return S.filter(
        (notification) =>
          (curDate - notification.createdAtMiliseconds) / 1000 <=
          notification.visibilityDurationInSeconds
      );
    },
    REMOVE_SPECIFIC_NOTIFICATION(S, A: PayloadAction<number>) {
      const relatedNotificationIndex = S.findIndex(
        (notification) => notification.id === A.payload
      );
      if (relatedNotificationIndex !== -1)
        S.splice(relatedNotificationIndex, 1);
    },
    SET_STATE(_, A: PayloadAction<INotification[]>) {
      return A.payload;
    },
  },
});

export default notificationSystemSlice.reducer;
export const notificationSystemActions = notificationSystemSlice.actions;
