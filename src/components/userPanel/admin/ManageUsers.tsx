import { useMemo, useState } from "react";
import { motion } from "framer-motion";

import { useInput } from "../../../hooks/useInput";
import Error from "../../UI/Error";
import OrdersFindingCredentialsAndUsersFindingInputFieldElement from "./OrdersFindingCredentialsAndUsersFindingInputFieldElement";
import LoadingFallback from "../../UI/LoadingFallback";
import useRetrieveFoundUsersDataBasedOnProvidedSearchQuery from "../../../hooks/adminPanelRelated/useRetrieveFoundUsersDataBasedOnProvidedSearchQuery";
import { retrieveFilledValidationErrorsArr } from "../../../store/userPanel/admin/orders/ManageOrdersFindingOrderContext";
import Header from "../../UI/headers/Header";
import PagesElement from "../../UI/PagesElement";
import { MAX_USERS_PER_PAGE } from "../../../lib/config";
import { listItemMotionProperties } from "../orders/OrdersList";

export default function ManageUsers() {
  const {
    handleInputChange,
    queryDebouncingState,
    inputValueInCaseOfCreatingStateHere: userQueryInputValue,
  } = useInput<string>({
    searchParamName: "userQuery",
    saveDebouncedStateInSearchParams: false,
    saveDebouncedStateInSessionStorage: false,
    defaultStateValueInCaseOfCreatingStateHere: "",
  });

  const [selectedUserFromList] = useState<string>("");

  const {
    retrieveUsersArr: retrieveUsersAmount,
    retrieveUsersDifferentError: retrieveUsersAmountDifferentError,
    retrieveUsersIsLoading: retrieveUsersAmountIsLoading,
    retrieveUsersValidationErrors: retrieveUsersAmountValidationErrors,
  } = useRetrieveFoundUsersDataBasedOnProvidedSearchQuery(
    queryDebouncingState,
    false,
    true,
    selectedUserFromList
  );

  const {
    retrieveUsersArr,
    retrieveUsersDifferentError,
    retrieveUsersIsLoading,
    retrieveUsersValidationErrors,
  } = useRetrieveFoundUsersDataBasedOnProvidedSearchQuery(
    queryDebouncingState,
    false,
    false,
    selectedUserFromList,
    retrieveUsersAmount !== undefined && retrieveUsersAmount > 0
  );

  const retrieveUsersValidationErrorsTransformed = useMemo(() => {
    const onlyFilledValidationErrorsArrOrFalse =
      retrieveFilledValidationErrorsArr([
        retrieveUsersAmountValidationErrors,
        retrieveUsersValidationErrors,
      ]);
    if (!onlyFilledValidationErrorsArrOrFalse) return undefined;

    return onlyFilledValidationErrorsArrOrFalse.map(
      (retrieveUsersValidationError) => ({
        ...retrieveUsersValidationError,
        errInputName: "userFindingInput",
      })
    );
  }, [retrieveUsersAmountValidationErrors, retrieveUsersValidationErrors]);

  let manageUsersListContent;
  const differentErrorToDisplay = retrieveUsersAmountDifferentError
    ? retrieveUsersAmountDifferentError
    : retrieveUsersDifferentError
    ? retrieveUsersDifferentError
    : null;

  if (differentErrorToDisplay)
    manageUsersListContent = (
      <Error message={differentErrorToDisplay.message} smallVersion />
    );
  else if (retrieveUsersAmountIsLoading || retrieveUsersIsLoading)
    manageUsersListContent = (
      <LoadingFallback customText="Fetching users to choose from..." />
    );
  else if (retrieveUsersAmount === 0)
    manageUsersListContent = (
      <Header>
        There do not seem to be any users matching the provided query!
      </Header>
    );
  else if (retrieveUsersArr && retrieveUsersAmount)
    manageUsersListContent = (
      <>
        <ul className="w-full flex flex-col justify-center items-center gap-4">
          {retrieveUsersArr.map((retrieveUsersArrEntry) => (
            <motion.li
              {...listItemMotionProperties}
              className="w-full flex flex-wrap justify-center items-center text-wrap px-4 py-4 bg-bodyBg rounded-xl"
              key={retrieveUsersArrEntry.login}
            >
              <span>Login: {retrieveUsersArrEntry.login}&nbsp;</span>
              <span>E-mail: {retrieveUsersArrEntry.email}</span>
            </motion.li>
          ))}
        </ul>
        <PagesElement
          amountOfElementsPerPage={MAX_USERS_PER_PAGE}
          totalAmountOfElementsToDisplayOnPages={retrieveUsersAmount}
        />
      </>
    );

  return (
    <>
      <section id="manage-users-control-section">
        <OrdersFindingCredentialsAndUsersFindingInputFieldElement
          {...{
            handleInputChange,
            inputValue: userQueryInputValue!,
            name: "userFindingInput",
            placeholder: "Requested user's login or e-mail address",
            inputsValidationErrors: retrieveUsersValidationErrorsTransformed,
          }}
        />
      </section>
      <section id="manage-users-content" className="flex flex-col gap-8">
        {manageUsersListContent}
      </section>
    </>
  );
}
