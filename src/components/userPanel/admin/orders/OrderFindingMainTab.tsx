import { useContext, useMemo } from "react";
import { motion } from "framer-motion";

import {
  manageOrdersFindingInputsPlaceholdersFromEntriesNames,
  ManageOrdersFindingOrderContext,
} from "../../../../store/userPanel/admin/orders/ManageOrdersFindingOrderContext";
import InputFieldElement from "../../../UI/InputFieldElement";
import {
  FormWithErrorHandlingContext,
  ValidationErrorsArr,
} from "../../../UI/FormWithErrorHandling";
import LoadingFallback from "../../../UI/LoadingFallback";
import Error from "../../../UI/Error";
import { dropdownListElementsMotionConfigurationGenerator } from "../../../main/nav/GamesResults";
import OrdersList from "../../orders/OrdersList";
import Header from "../../../UI/headers/Header";

export default function OrderFindingMainTab() {
  const {
    ordersFindingCredentials,
    retrieveUsersQueryData,
    stateInformation: { selectedUserFromList, setSelectedUserFromList },
    retrieveOrdersQueryData,
  } = useContext(ManageOrdersFindingOrderContext);
  const {
    data: retrieveUsersData,
    isLoading: retrieveUsersIsLoading,
    differentError: retrieveUsersDifferentError,
    validationErrors: retrieveUsersValidationErrors,
  } = retrieveUsersQueryData;

  const foundUserEntryElementMotionConfiguration = useMemo(
    () => dropdownListElementsMotionConfigurationGenerator(),
    []
  );

  const {
    data: retrieveOrdersArr,
    differentError: retrieveOrdersError,
    validationErrors: retrieveOrdersValidationErrors,
    isLoading: retrieveOrdersIsLoading,
  } = retrieveOrdersQueryData;

  let availableOrdersContent;

  if (retrieveOrdersIsLoading)
    availableOrdersContent = (
      <LoadingFallback customText="Loading orders to choose from..." />
    );
  if (retrieveOrdersArr && retrieveOrdersArr.length > 0)
    availableOrdersContent = <OrdersList />;
  if (retrieveOrdersArr && retrieveOrdersArr.length === 0)
    availableOrdersContent = (
      <Header>
        Failed to find any order which suites provided properties!
      </Header>
    );
  if (retrieveOrdersError)
    availableOrdersContent = (
      <Error smallVersion message={retrieveOrdersError.message} />
    );

  const inputsValidationErrors = useMemo(() => {
    const arr: ValidationErrorsArr = [];
    if (retrieveUsersValidationErrors)
      arr.push(...retrieveUsersValidationErrors);
    if (retrieveOrdersValidationErrors)
      retrieveOrdersValidationErrors.forEach(
        (retrieveOrdersValidationError) =>
          !arr.some(
            (validationError) =>
              validationError.errInputName ===
              retrieveOrdersValidationError.errInputName
          ) && arr.push(retrieveOrdersValidationError)
      );
    return arr;
  }, [retrieveOrdersValidationErrors, retrieveUsersValidationErrors]);

  return (
    <>
      <section className="order-finding-control-section-wrapper flex flex-col gap-4">
        <section className="order-finding-control-section flex gap-4">
          {ordersFindingCredentials.map((ordersFindingCredentialsEntry) => {
            const {
              inputValue,
              name,
              setQueryDebouncingState,
              handleInputChange,
            } = ordersFindingCredentialsEntry;
            return (
              <FormWithErrorHandlingContext.Provider
                value={{
                  lightTheme: true,
                  isPending: false,
                  errorsRelatedToValidation: inputsValidationErrors,
                }}
                key={name}
              >
                <InputFieldElement
                  inputFieldObjFromProps={{
                    name,
                    placeholder:
                      manageOrdersFindingInputsPlaceholdersFromEntriesNames[
                        name
                      ],
                    omitMovingTheInputFieldUponSelecting: true,
                    ...(name === "orderFindingUser" && {
                      allowForDropDownMenuImplementation: true,
                      dropDownMenuContent: (
                        <>
                          {retrieveUsersIsLoading && (
                            <LoadingFallback customText="Loading appropriate users to choose from..." />
                          )}
                          {retrieveUsersData &&
                            (retrieveUsersData.length > 0 ? (
                              <ul className="w-full flex flex-col items-center text-wrap gap-4 h-full">
                                {retrieveUsersData.map(
                                  (retrieveUsersDataUserEntry) => (
                                    <motion.li
                                      key={retrieveUsersDataUserEntry.login}
                                      className="flex gap-4 text-wrap flex-wrap bg-darkerBg rounded-xl p-4 w-full cursor-pointer justify-center"
                                      {...foundUserEntryElementMotionConfiguration}
                                      onClick={() => {
                                        const login =
                                          retrieveUsersDataUserEntry.login;
                                        setSelectedUserFromList(login);
                                        setQueryDebouncingState(login);
                                        handleInputChange(login);
                                      }}
                                    >
                                      <p className="text-wrap break-all">
                                        {retrieveUsersDataUserEntry.login}
                                      </p>
                                      <p className="text-wrap break-all">
                                        {retrieveUsersDataUserEntry.email}
                                      </p>
                                    </motion.li>
                                  )
                                )}
                              </ul>
                            ) : (
                              <p>
                                Haven't found any users according to provided
                                data!
                              </p>
                            ))}
                        </>
                      ),
                      showDropDownElementsToAvoidUnnecessaryPadding:
                        (retrieveUsersIsLoading || retrieveUsersData) &&
                        selectedUserFromList === ""
                          ? true
                          : false,
                    }),
                  }}
                  onChange={
                    ordersFindingCredentialsEntry.name !== "orderFindingUser"
                      ? ordersFindingCredentialsEntry.handleInputChange
                      : (newValue: string) => {
                          ordersFindingCredentialsEntry.handleInputChange(
                            newValue
                          );
                          selectedUserFromList && setSelectedUserFromList("");
                        }
                  }
                  value={inputValue}
                />
              </FormWithErrorHandlingContext.Provider>
            );
          })}
        </section>
        <section className="order-finding-control-section-errors">
          {retrieveUsersDifferentError && (
            <Error message={retrieveUsersDifferentError.message} smallVersion />
          )}
        </section>
      </section>
      <section className="order-finding-available-orders-wrapper">
        {availableOrdersContent}
      </section>
    </>
  );
}
