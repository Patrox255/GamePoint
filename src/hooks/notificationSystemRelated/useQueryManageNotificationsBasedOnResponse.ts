import { ReactNode, useEffect } from "react";

import useCreateHelperFunctionsRelatedToNotificationManagement from "./useCreateHelperFunctionsRelatedToNotificationManagement";
import { possibleApplicationFunctionalitiesIdentifiers } from "../../store/UI/notificationSystemSlice";

type possibleMessages = "successMessage" | "loadingMessage";
type IPossibleMessagesObj = {
  [key in possibleMessages]?: ReactNode;
};
type generatePossibleRawInformationKeys<possibleMessages extends string> =
  `${possibleMessages}PossibleRawInformation`;
type IPossibleRawInformationObj = {
  [key in generatePossibleRawInformationKeys<possibleMessages>]?: string;
};
export interface IUseQueryManageNotificationsBasedOnResponseArg
  extends IPossibleMessagesObj,
    IPossibleRawInformationObj {
  queryData?: unknown;
  queryError?: unknown;
  queryIsLoading?: boolean;
  relatedApplicationFunctionalityIdentifier: possibleApplicationFunctionalitiesIdentifiers;
}
export default function useQueryManageNotificationsBasedOnResponse({
  loadingMessage = "",
  successMessage = "",
  queryData,
  queryError,
  queryIsLoading,
  relatedApplicationFunctionalityIdentifier,
  loadingMessagePossibleRawInformation,
  successMessagePossibleRawInformation,
}: IUseQueryManageNotificationsBasedOnResponseArg) {
  const {
    generateErrorNotificationInCaseOfQueryErrStable,
    generateLoadingInformationNotificationStable,
    generateSuccessNotificationStable,
  } = useCreateHelperFunctionsRelatedToNotificationManagement(
    relatedApplicationFunctionalityIdentifier
  );

  useEffect(() => {
    if (queryData) {
      generateErrorNotificationInCaseOfQueryErrStable(queryData);
      generateSuccessNotificationStable(
        successMessage,
        successMessagePossibleRawInformation
      );
    }
  }, [
    generateSuccessNotificationStable,
    queryData,
    successMessage,
    successMessagePossibleRawInformation,
    generateErrorNotificationInCaseOfQueryErrStable,
  ]);

  useEffect(() => {
    if (queryError) generateErrorNotificationInCaseOfQueryErrStable(queryError);
  });

  useEffect(() => {
    if (queryIsLoading)
      generateLoadingInformationNotificationStable(
        loadingMessage,
        loadingMessagePossibleRawInformation
      );
  }, [
    generateLoadingInformationNotificationStable,
    loadingMessage,
    loadingMessagePossibleRawInformation,
    queryIsLoading,
  ]);

  return;
}
