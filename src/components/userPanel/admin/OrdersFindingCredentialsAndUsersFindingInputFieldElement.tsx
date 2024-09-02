import { motion } from "framer-motion";
import { useMemo } from "react";

import InputFieldElement from "../../UI/InputFieldElement";
import { IRetrieveAvailableUsersPossibleReceivedData } from "../../../lib/fetch";
import LoadingFallback from "../../UI/LoadingFallback";
import { dropdownListElementsMotionConfigurationGenerator } from "../../main/nav/GamesResults";
import {
  FormWithErrorHandlingContext,
  ValidationErrorsArr,
} from "../../UI/FormWithErrorHandling";

const inputFieldObjsRelatedToUserFindingNames = ["orderFindingUser"];

export default function OrdersFindingCredentialsAndUsersFindingInputFieldElement({
  name,
  placeholder,
  handleInputChange,
  inputValue,
  inputsValidationErrors,
  retrieveUsersArr,
  retrieveUsersIsLoading,
  selectedUserFromList,
  setSelectedUserFromList,
  setQueryDebouncingState,
}: {
  name: string;
  placeholder: string;
  handleInputChange: (newValue: string) => void;
  inputValue: string;
  inputsValidationErrors: ValidationErrorsArr | undefined | null;
  retrieveUsersArr?: IRetrieveAvailableUsersPossibleReceivedData;
  retrieveUsersIsLoading?: boolean;
  selectedUserFromList?: string;
  setSelectedUserFromList?: React.Dispatch<React.SetStateAction<string>>;
  setQueryDebouncingState?: React.Dispatch<React.SetStateAction<string>>;
}) {
  const isRelatedToUserFinding =
    inputFieldObjsRelatedToUserFindingNames.includes(name);

  const foundUserEntryElementMotionConfiguration = useMemo(
    () => dropdownListElementsMotionConfigurationGenerator(),
    []
  );

  return (
    <section className="flex self-stretch items-end">
      <FormWithErrorHandlingContext.Provider
        value={{
          lightTheme: true,
          isPending: false,
          errorsRelatedToValidation: inputsValidationErrors,
        }}
      >
        <InputFieldElement
          inputFieldObjFromProps={{
            name,
            placeholder,
            omitMovingTheInputFieldUponSelecting: true,
            ...(isRelatedToUserFinding && {
              allowForDropDownMenuImplementation: true,
              dropDownMenuContent: (
                <>
                  {retrieveUsersIsLoading && (
                    <LoadingFallback customText="Loading appropriate users to choose from..." />
                  )}
                  {retrieveUsersArr &&
                    (retrieveUsersArr.length > 0 ? (
                      <ul className="w-full flex flex-col items-center text-wrap gap-4 h-full">
                        {retrieveUsersArr.map((retrieveUsersDataUserEntry) => (
                          <motion.li
                            key={retrieveUsersDataUserEntry.login}
                            className="flex gap-4 text-wrap flex-wrap bg-darkerBg rounded-xl p-4 w-full cursor-pointer justify-center"
                            {...foundUserEntryElementMotionConfiguration}
                            onClick={() => {
                              const login = retrieveUsersDataUserEntry.login;
                              setSelectedUserFromList!(login);
                              setQueryDebouncingState!(login);
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
                        ))}
                      </ul>
                    ) : (
                      <p>Haven't found any users according to provided data!</p>
                    ))}
                </>
              ),
              showDropDownElementsToAvoidUnnecessaryPadding:
                (retrieveUsersIsLoading || retrieveUsersArr) &&
                selectedUserFromList === ""
                  ? true
                  : false,
            }),
          }}
          onChange={
            !isRelatedToUserFinding
              ? handleInputChange
              : (newValue: string) => {
                  handleInputChange(newValue);
                  selectedUserFromList && setSelectedUserFromList!("");
                }
          }
          value={inputValue}
        />
      </FormWithErrorHandlingContext.Provider>
    </section>
  );
}
