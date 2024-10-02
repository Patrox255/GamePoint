import { useCallback, useMemo } from "react";

import {
  getNotificationComponentPropsKeyBasedOnItsId,
  INotificationContentComponentIdToNotificationComponentProps,
  notificationContentComponentsIds,
  notificationSystemActions,
  notificationTypes,
  possibleApplicationFunctionalitiesIdentifiers,
} from "../../store/UI/notificationSystemSlice";
import { useAppDispatch } from "../reduxStore";
import { ValidationErrorsArr } from "../../components/UI/FormWithErrorHandling";

const validationErrorHeader =
  "You have encountered some validation errors based on the provided data!";
const defaultErrorMessage = "An error occurred!";

export type contentComponentPropsGeneratorForNormalErrorNotificationFn<
  contentComponentId extends notificationContentComponentsIds
> = (
  errorMessage?: string,
  validationErrors?: ValidationErrorsArr
) => INotificationContentComponentIdToNotificationComponentProps[contentComponentId];

export type IPossibleNotificationsTypesVisibilityDurationInSecondsMap<
  possibleMessages extends string
> = {
  [key in possibleMessages as `${key}NotificationDuration`]?: number;
};

export type IPossibleErrorsAndValidationErrosNotificationsDurationInSecondsObjStable =
  IPossibleNotificationsTypesVisibilityDurationInSecondsMap<
    "errorMessage" | "validationErrorMessage"
  >;

export default function useCreateHelperFunctionsRelatedToNotificationManagement(
  relatedApplicationFunctionalityIdentifier: possibleApplicationFunctionalitiesIdentifiers,
  possibleErrorsAndValidationErrosNotificationsDurationInSecondsObjStable?: IPossibleErrorsAndValidationErrosNotificationsDurationInSecondsObjStable
) {
  const dispatch = useAppDispatch();

  const generateNotificationBasicFunctionGeneratorStable = useCallback(
    (type: notificationTypes) =>
      <contentComponentId extends notificationContentComponentsIds>(
        contentComponentId: contentComponentId,
        contentComponentProps: INotificationContentComponentIdToNotificationComponentProps[contentComponentId],
        visibilityDurationInSeconds?: number
      ) =>
        dispatch(
          notificationSystemActions.ADD_NOTIFICATION({
            type,
            relatedApplicationFunctionalityIdentifier,
            contentComponentId,
            [getNotificationComponentPropsKeyBasedOnItsId(contentComponentId)]:
              contentComponentProps,
            visibilityDurationInSeconds,
          })
        ),
    [dispatch, relatedApplicationFunctionalityIdentifier]
  );

  const generateErrorNotification = useMemo(
    () => generateNotificationBasicFunctionGeneratorStable("error"),
    [generateNotificationBasicFunctionGeneratorStable]
  );

  const generateValidationErrorsNotification = useMemo(
    () => generateNotificationBasicFunctionGeneratorStable("validationErrors"),
    [generateNotificationBasicFunctionGeneratorStable]
  );

  // this function also returns true in case error object or array really meets the requirements of such variables and false otherwise
  const generateErrorNotificationInCaseOfQueryErrStable = useCallback(
    <contentComponentId extends notificationContentComponentsIds = "default">(
      possibleErrObjOrArr: unknown,
      contentComponentIdForNormalErrorNotification: contentComponentId = "default" as contentComponentId,
      checkWhetherItIsAnError: boolean = true,
      overrideDefaultErrorMessage?: string,
      contentComponentPropsGeneratorForNormalErrorNotification: contentComponentPropsGeneratorForNormalErrorNotificationFn<contentComponentId> = (
        message
      ) =>
        ({
          text: message,
        } as INotificationContentComponentIdToNotificationComponentProps[contentComponentId])
    ) => {
      if (
        Array.isArray(possibleErrObjOrArr) &&
        (possibleErrObjOrArr as ValidationErrorsArr).every(
          (possibleValidationErrorsObj) =>
            possibleValidationErrorsObj.message !== undefined
        )
      ) {
        generateValidationErrorsNotification(
          "validationErrors",
          {
            validationErrors: possibleErrObjOrArr,
            validationErrorHeader,
          },
          possibleErrorsAndValidationErrosNotificationsDurationInSecondsObjStable?.validationErrorMessageNotificationDuration
        );
        return true;
      }
      if (
        typeof possibleErrObjOrArr === "object" &&
        (possibleErrObjOrArr as Error).message !== undefined
      ) {
        const errorMesg = (possibleErrObjOrArr as Error).message;
        generateErrorNotification(
          contentComponentIdForNormalErrorNotification,
          contentComponentPropsGeneratorForNormalErrorNotification(
            overrideDefaultErrorMessage
              ? overrideDefaultErrorMessage
              : errorMesg
          ),
          possibleErrorsAndValidationErrosNotificationsDurationInSecondsObjStable?.errorMessageNotificationDuration
        );
        return true;
      }
      if (!checkWhetherItIsAnError) {
        generateErrorNotification(
          contentComponentIdForNormalErrorNotification,
          contentComponentPropsGeneratorForNormalErrorNotification(
            overrideDefaultErrorMessage
              ? overrideDefaultErrorMessage
              : defaultErrorMessage
          ),
          possibleErrorsAndValidationErrosNotificationsDurationInSecondsObjStable?.errorMessageNotificationDuration
        );
        return true;
      }
      return false;
    },
    [
      generateErrorNotification,
      generateValidationErrorsNotification,
      possibleErrorsAndValidationErrosNotificationsDurationInSecondsObjStable?.errorMessageNotificationDuration,
      possibleErrorsAndValidationErrosNotificationsDurationInSecondsObjStable?.validationErrorMessageNotificationDuration,
    ]
  );

  const generateLoadingInformationNotificationStable = useMemo(
    () => generateNotificationBasicFunctionGeneratorStable("information"),
    [generateNotificationBasicFunctionGeneratorStable]
  );

  const generateSuccessNotificationStable = useMemo(
    () => generateNotificationBasicFunctionGeneratorStable("success"),
    [generateNotificationBasicFunctionGeneratorStable]
  );

  return {
    generateErrorNotificationInCaseOfQueryErrStable,
    generateSuccessNotificationStable,
    generateLoadingInformationNotificationStable,
    generateErrorNotification,
    generateValidationErrorsNotification,
  };
}
