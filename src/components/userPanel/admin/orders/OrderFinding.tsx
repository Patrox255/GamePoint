import { useContext } from "react";

import {
  manageOrdersFindingInputsPlaceholdersFromEntriesNames,
  ManageOrdersFindingOrderContext,
} from "../../../../store/userPanel/admin/orders/ManageOrdersFindingOrderContext";
import InputFieldElement from "../../../UI/InputFieldElement";
import { FormWithErrorHandlingContext } from "../../../UI/FormWithErrorHandling";
import LoadingFallback from "../../../UI/LoadingFallback";
import Error from "../../../UI/Error";

export default function OrderFinding() {
  const { ordersFindingCredentials, retrieveUsersQueryData } = useContext(
    ManageOrdersFindingOrderContext
  );
  const {
    data: retrieveUsersData,
    isLoading: retrieveUsersIsLoading,
    differentError: retrieveUsersDifferentError,
    validationErrors: retrieveUsersValidationErrors,
  } = retrieveUsersQueryData;

  return (
    <>
      <section className="order-finding-control-section flex gap-4">
        {ordersFindingCredentials.map((ordersFindingCredentialsEntry) => {
          const { inputValue, name } = ordersFindingCredentialsEntry;
          return (
            <FormWithErrorHandlingContext.Provider
              value={{
                lightTheme: true,
                isPending: false,
                errorsRelatedToValidation: retrieveUsersValidationErrors || [],
              }}
              key={name}
            >
              <InputFieldElement
                inputFieldObjFromProps={{
                  name,
                  placeholder:
                    manageOrdersFindingInputsPlaceholdersFromEntriesNames[name],
                  omitMovingTheInputFieldUponSelecting: true,
                  ...(name === "orderFindingUser" && {
                    allowForDropDownMenuImplementation: true,
                    dropDownMenuContent: (
                      <>
                        {retrieveUsersIsLoading && (
                          <LoadingFallback customText="Loading appropriate users to choose from..." />
                        )}
                        {retrieveUsersData && (
                          <ul>
                            {retrieveUsersData.map(
                              (retrieveUsersDataUserEntry) => (
                                <li
                                  key={retrieveUsersDataUserEntry.login}
                                  className="flex gap-4 w-full text-wrap"
                                >
                                  <p>{retrieveUsersDataUserEntry.login}</p>
                                  <p>{retrieveUsersDataUserEntry.email}</p>
                                </li>
                              )
                            )}
                          </ul>
                        )}
                      </>
                    ),
                    // <h1>Content</h1>,
                  }),
                }}
                onChange={ordersFindingCredentialsEntry.handleInputChange}
                value={inputValue}
              />
            </FormWithErrorHandlingContext.Provider>
          );
        })}
      </section>
      {retrieveUsersDifferentError && (
        <Error message={retrieveUsersDifferentError.message} smallVersion />
      )}
    </>
  );
}
