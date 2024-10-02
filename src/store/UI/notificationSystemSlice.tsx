import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { isEqual } from "lodash";
import { ReactNode } from "react";
import { ValidationErrorsArr } from "../../components/UI/FormWithErrorHandling";
import Header from "../../components/UI/headers/Header";
import { DEFAULT_NOTIFICATION_DURATION_IN_SECONDS } from "../../lib/config";

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
  "cartTotalPrice",
  "placingTheOrder",
  "addReview",
  "removeReview",
  "curAccountOrdersUserPanelLoading",
  "curAccountContactInformationLoading",
  "curAccountChangeActiveContactInformation",
  "editOrAddContactInformationEntry",
  "registerAnAccount",
] as const;
export type possibleApplicationFunctionalitiesIdentifiers =
  (typeof possibleApplicationFunctionalitiesIdentifiersArr)[number];
export interface INotificationPropertiesRequiredWhenAddingOne {
  contentComponentId: notificationContentComponentsIds;
  type: notificationTypes;
  relatedApplicationFunctionalityIdentifier: possibleApplicationFunctionalitiesIdentifiers;
  visibilityDurationInSeconds?: number;
}
export interface INotification
  extends INotificationPropertiesRequiredWhenAddingOne {
  createdAtMiliseconds: number;
  id: number;
  relatedContentComponentProps: allPossibleNotificationContentComponentsProps;
}
export const initialState: INotification[] = [];

type notificationContentComponent<propsType> = (props: propsType) => ReactNode;
const notificationContentComponentsIds = [
  "default",
  "headerNotification",
  "validationErrors",
] as const;
export type notificationContentComponentsIds =
  (typeof notificationContentComponentsIds)[number];
export const notificationContentComponentsIdsToComponentsMap: {
  [key in notificationContentComponentsIds]: notificationContentComponent<
    INotificationContentComponentIdToNotificationComponentProps[key]
  >;
} = {
  default: ({ text }: defaultComponentProps) => text,
  headerNotification: ({ header, text }: headerNotificationComponentProps) => (
    <>
      <Header size="small" colorTailwindClass="text-defaultFont">
        {header}
      </Header>
      <p>{text}</p>
    </>
  ),
  validationErrors: ({
    validationErrors,
    validationErrorHeader,
  }: validationErrorsComponentProps) => (
    <>
      <Header usePaddingBottom={false} colorTailwindClass="text-defaultFont">
        {validationErrorHeader}
      </Header>
      <section className="notification-validation-errors flex flex-col gap-2 font-normal">
        {validationErrors.map((validationError) => (
          <span key={validationError.message}>
            •&nbsp;{validationError.message}
          </span>
        ))}
      </section>
    </>
  ),
};
type defaultComponentProps = { text: string };
type headerNotificationComponentProps = { text: string; header: string };
type validationErrorsComponentProps = {
  validationErrors: ValidationErrorsArr;
  validationErrorHeader: string;
};
export type allPossibleNotificationContentComponentsProps =
  | defaultComponentProps
  | headerNotificationComponentProps
  | validationErrorsComponentProps;
export type INotificationContentComponentIdToNotificationComponentProps = {
  default: defaultComponentProps;
  validationErrors: validationErrorsComponentProps;
  headerNotification: headerNotificationComponentProps;
};
type addSuffixToObjectKeys<T extends object, suffix extends string> = {
  [key in keyof T as `${key & string}${suffix}`]?: T[key];
};
type INotificationContentComponentPossiblePropsPayloadAddition =
  addSuffixToObjectKeys<
    INotificationContentComponentIdToNotificationComponentProps,
    "ComponentProps"
  >;
export const getNotificationComponentPropsKeyBasedOnItsId = (
  contentComponentId: notificationContentComponentsIds
) =>
  `${contentComponentId}ComponentProps` as keyof INotificationContentComponentPossiblePropsPayloadAddition;

const notificationSystemSlice = createSlice({
  name: "notificationSystem",
  initialState,
  reducers: {
    ADD_NOTIFICATION: (
      S,
      A: PayloadAction<
        INotificationPropertiesRequiredWhenAddingOne &
          INotificationContentComponentPossiblePropsPayloadAddition
      >
    ) => {
      const {
        payload: {
          contentComponentId,
          type,
          relatedApplicationFunctionalityIdentifier,
          visibilityDurationInSeconds = DEFAULT_NOTIFICATION_DURATION_IN_SECONDS,
          ...contentComponentsPropsObjs
        },
      } = A;
      const contentComponentPropsBasedOnContentComponentId =
        contentComponentsPropsObjs[
          getNotificationComponentPropsKeyBasedOnItsId(contentComponentId)
        ];
      if (!contentComponentPropsBasedOnContentComponentId) return;
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
            notification.contentComponentId === contentComponentId &&
            isEqual(
              notification.relatedContentComponentProps,
              contentComponentPropsBasedOnContentComponentId
            )
        );
      if (possibleSameNotification) {
        possibleSameNotification.createdAtMiliseconds = +new Date();
        return S;
      }
      const newNotification: INotification = {
        contentComponentId,
        type,
        id: (S.at(-1)?.id ?? -1) + 1,
        createdAtMiliseconds: +new Date(),
        visibilityDurationInSeconds,
        relatedApplicationFunctionalityIdentifier,
        relatedContentComponentProps:
          contentComponentPropsBasedOnContentComponentId,
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
          notification.visibilityDurationInSeconds!
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
