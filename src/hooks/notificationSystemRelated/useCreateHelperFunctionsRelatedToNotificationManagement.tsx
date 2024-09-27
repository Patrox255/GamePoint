import { ReactNode, useCallback } from "react";

import {
  notificationSystemActions,
  possibleApplicationFunctionalitiesIdentifiers,
} from "../../store/UI/notificationSystemSlice";
import { useAppDispatch } from "../reduxStore";
import { ValidationErrorsArr } from "../../components/UI/FormWithErrorHandling";
import Header from "../../components/UI/headers/Header";

export default function useCreateHelperFunctionsRelatedToNotificationManagement(
  relatedApplicationFunctionalityIdentifier: possibleApplicationFunctionalitiesIdentifiers,
  checkWhetherItIsAnError: boolean = true
) {
  const dispatch = useAppDispatch();

  const generateErrorNotificationInCaseOfQueryErrStable = useCallback(
    (possibleErrObjOrArr: unknown) => {
      const errorNotificationGenerator = (
        content: ReactNode,
        rawInformationToRecognizeSameNotifications?: string,
        normalError: boolean = true
      ) =>
        dispatch(
          notificationSystemActions.ADD_NOTIFICATION({
            type: normalError ? "error" : "validationErrors",
            content,
            relatedApplicationFunctionalityIdentifier,
            rawInformationToRecognizeSameNotifications,
          })
        );
      const validationErrorHeader =
        "You have encountered some validation errors based on the provided data!";
      const defaultErrorMessage = "An error occurred!";
      if (
        Array.isArray(possibleErrObjOrArr) &&
        (possibleErrObjOrArr as ValidationErrorsArr).every(
          (possibleValidationErrorsObj) =>
            possibleValidationErrorsObj.message !== undefined
        )
      )
        return errorNotificationGenerator(
          <>
            <Header
              usePaddingBottom={false}
              colorTailwindClass="text-defaultFont"
            >
              {validationErrorHeader}
            </Header>
            <section className="notification-validation-errors flex flex-col gap-2 font-normal">
              {(possibleErrObjOrArr as ValidationErrorsArr).map(
                (validationError) => (
                  <span>•&nbsp;{validationError.message}</span>
                )
              )}
            </section>
          </>,
          `${validationErrorHeader}${(
            possibleErrObjOrArr as ValidationErrorsArr
          )
            .map((validationError) => validationError.message)
            .join("")}`,
          false
        );
      if (
        typeof possibleErrObjOrArr === "object" &&
        (possibleErrObjOrArr as Error).message !== undefined
      ) {
        const errorMesg = (possibleErrObjOrArr as Error).message;
        return errorNotificationGenerator(errorMesg, errorMesg);
      }
      if (!checkWhetherItIsAnError)
        return errorNotificationGenerator(
          defaultErrorMessage,
          defaultErrorMessage
        );
    },
    [
      checkWhetherItIsAnError,
      dispatch,
      relatedApplicationFunctionalityIdentifier,
    ]
  );

  const generateLoadingInformationNotificationStable = useCallback(
    (
      content: ReactNode,
      rawInformationToRecognizeSameNotifications:
        | string
        | undefined = typeof content === "string" ? content : undefined
    ) =>
      dispatch(
        notificationSystemActions.ADD_NOTIFICATION({
          type: "information",
          relatedApplicationFunctionalityIdentifier,
          content,
          rawInformationToRecognizeSameNotifications,
        })
      ),
    [dispatch, relatedApplicationFunctionalityIdentifier]
  );

  const generateSuccessNotificationStable = useCallback(
    (
      content: ReactNode,
      rawInformationToRecognizeSameNotifications:
        | string
        | undefined = typeof content === "string" ? content : undefined
    ) =>
      dispatch(
        notificationSystemActions.ADD_NOTIFICATION({
          type: "success",
          relatedApplicationFunctionalityIdentifier,
          content,
          rawInformationToRecognizeSameNotifications,
        })
      ),
    [dispatch, relatedApplicationFunctionalityIdentifier]
  );

  return {
    generateErrorNotificationInCaseOfQueryErrStable,
    generateSuccessNotificationStable,
    generateLoadingInformationNotificationStable,
  };
}
