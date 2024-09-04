import { useContext, useMemo, useState } from "react";

import { useInput } from "../../../../hooks/useInput";
import Error from "../../../UI/Error";
import OrdersFindingCredentialsAndUsersFindingInputFieldElement from "../OrdersFindingCredentialsAndUsersFindingInputFieldElement";
import LoadingFallback from "../../../UI/LoadingFallback";
import useRetrieveFoundUsersDataBasedOnProvidedSearchQuery from "../../../../hooks/adminPanelRelated/useRetrieveFoundUsersDataBasedOnProvidedSearchQuery";
import { retrieveFilledValidationErrorsArr } from "../../../../store/userPanel/admin/orders/ManageOrdersFindingOrderContext";
import Header from "../../../UI/headers/Header";
import PagesElement from "../../../UI/PagesElement";
import { MAX_USERS_PER_PAGE } from "../../../../lib/config";
import { PagesManagerContext } from "../../../../store/products/PagesManagerContext";
import ListItems, {
  IListItemEntriesWithAccessToTheListItemItself,
} from "../../../structure/ListItems";
import { IRetrieveAvailableUsersPossibleReceivedDataObj } from "../../../../lib/fetch";
import { ListItemLoginAndEmailEntriesContentFnResultComponent } from "../orders/OrderFindingMainTab";
import SelectedUserManagement from "./SelectedUserManagement";

const usersDetailsEntries: IListItemEntriesWithAccessToTheListItemItself<
  IRetrieveAvailableUsersPossibleReceivedDataObj,
  "loginAndEmail"
> = {
  loginAndEmail: {
    contentClassName: "login-and-email",
    contentFn: (retrievedUserObj) => (
      <ListItemLoginAndEmailEntriesContentFnResultComponent
        email={retrievedUserObj.email}
        login={retrievedUserObj.login}
      />
    ),
  },
};

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

  const [selectedUserFromList, setSelectedUserFromList] = useState<string>("");

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

  const { pageNr } = useContext(PagesManagerContext);

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
    retrieveUsersAmount !== undefined && retrieveUsersAmount > 0,
    pageNr
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

  console.log(retrieveUsersArr);

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
        <ListItems
          listItems={retrieveUsersArr}
          listItemKeyGeneratorFn={(retrievedUserEntry) =>
            retrievedUserEntry.login
          }
          overAllListItemsIdentificator="user"
          listItemOnClick={(retrievedUserEntry) =>
            setSelectedUserFromList(retrievedUserEntry.login)
          }
          listItemEntriesBasedOnListItemObjItselfStable={usersDetailsEntries}
        />
        <PagesElement
          amountOfElementsPerPage={MAX_USERS_PER_PAGE}
          totalAmountOfElementsToDisplayOnPages={retrieveUsersAmount}
        />
      </>
    );
  else if (!queryDebouncingState || !queryDebouncingState.trim())
    manageUsersListContent = (
      <Header>
        Please provide us with appropriate login or e-mail to proceed searching
      </Header>
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
        {selectedUserFromList !== "" ? (
          <SelectedUserManagement selectedUserLogin={selectedUserFromList} />
        ) : (
          manageUsersListContent
        )}
      </section>
    </>
  );
}
