import { useEffect, useMemo } from "react";

import useCreateHelperFunctionsRelatedToNotificationManagement, {
  contentComponentPropsGeneratorForNormalErrorNotificationFn,
  IPossibleErrorsAndValidationErrosNotificationsDurationInSecondsObjStable,
} from "./useCreateHelperFunctionsRelatedToNotificationManagement";
import {
  notificationContentComponentsIds,
  possibleApplicationFunctionalitiesIdentifiers,
} from "../../store/UI/notificationSystemSlice";

type possibleMessages = "successMessage" | "loadingMessage";
type IPossibleMessagesObj = {
  [key in possibleMessages]?: string;
};

type IPossibleNotificationsTypesVisibilityDurationInSecondsMap = {
  [key in possibleMessages as `${key}NotificationDuration`]?: number;
} & IPossibleErrorsAndValidationErrosNotificationsDurationInSecondsObjStable;

export type IUseQueryManageNotificationsBasedOnResponseArg<
  contentComponentId extends notificationContentComponentsIds = "default"
> = {
  queryData?: unknown;
  queryError?: unknown;
  queryIsLoading?: boolean;
  relatedApplicationFunctionalityIdentifier: possibleApplicationFunctionalitiesIdentifiers;
  contentComponentIdForNormalErrorNotification?: contentComponentId;
  contentComponentPropsGeneratorForNormalErrorNotification?: contentComponentPropsGeneratorForNormalErrorNotificationFn<contentComponentId>;
  errorNotificationMessageToOverrideTheMessageInsideReceivedError?: string;
  enabled?: boolean;
} & IPossibleMessagesObj &
  IPossibleNotificationsTypesVisibilityDurationInSecondsMap;
export default function useQueryManageNotificationsBasedOnResponse<
  contentComponentId extends notificationContentComponentsIds
>({
  loadingMessage = "",
  successMessage = "",
  queryData,
  queryError,
  queryIsLoading,
  relatedApplicationFunctionalityIdentifier,
  errorNotificationMessageToOverrideTheMessageInsideReceivedError,
  contentComponentIdForNormalErrorNotification,
  contentComponentPropsGeneratorForNormalErrorNotification,
  loadingMessageNotificationDuration,
  successMessageNotificationDuration,
  errorMessageNotificationDuration,
  validationErrorMessageNotificationDuration,
  enabled = true,
}: IUseQueryManageNotificationsBasedOnResponseArg<contentComponentId>) {
  const errorAndValidationErrorsNotificationsDurationObj = useMemo(
    () => ({
      errorMessageNotificationDuration,
      validationErrorMessageNotificationDuration,
    }),
    [
      errorMessageNotificationDuration,
      validationErrorMessageNotificationDuration,
    ]
  );
  const {
    generateErrorNotificationInCaseOfQueryErrStable,
    generateLoadingInformationNotificationStable,
    generateSuccessNotificationStable,
  } = useCreateHelperFunctionsRelatedToNotificationManagement(
    relatedApplicationFunctionalityIdentifier,
    errorAndValidationErrorsNotificationsDurationObj
  );

  useEffect(() => {
    if (!enabled) return;
    if (queryData && !queryError) {
      if (generateErrorNotificationInCaseOfQueryErrStable(queryData)) return;
      // do not show success notifcation in case an error occurred
      generateSuccessNotificationStable(
        "default",
        { text: successMessage },
        successMessageNotificationDuration
      );
    }
  }, [
    generateSuccessNotificationStable,
    queryData,
    successMessage,
    generateErrorNotificationInCaseOfQueryErrStable,
    queryError,
    successMessageNotificationDuration,
    enabled,
  ]);

  useEffect(() => {
    if (!enabled) return;
    if (queryError)
      generateErrorNotificationInCaseOfQueryErrStable(
        queryError,
        contentComponentIdForNormalErrorNotification,
        true,
        errorNotificationMessageToOverrideTheMessageInsideReceivedError,
        contentComponentPropsGeneratorForNormalErrorNotification
      );
  }, [
    contentComponentIdForNormalErrorNotification,
    contentComponentPropsGeneratorForNormalErrorNotification,
    enabled,
    errorNotificationMessageToOverrideTheMessageInsideReceivedError,
    generateErrorNotificationInCaseOfQueryErrStable,
    queryError,
  ]);

  useEffect(() => {
    if (!enabled) return;
    if (queryIsLoading)
      generateLoadingInformationNotificationStable(
        "default",
        {
          text: loadingMessage,
        },
        loadingMessageNotificationDuration
      );
  }, [
    enabled,
    generateLoadingInformationNotificationStable,
    loadingMessage,
    loadingMessageNotificationDuration,
    queryIsLoading,
  ]);

  return;
}
