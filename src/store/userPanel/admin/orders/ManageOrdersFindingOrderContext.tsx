/* eslint-disable react-refresh/only-export-components */
import { createContext, ReactNode } from "react";

import { useInput } from "../../../../hooks/useInput";
import { useQuery } from "@tanstack/react-query";
import {
  IRetrieveAvailableUsersPossibleReceivedData,
  retrieveAvailableUsersBasedOnLoginOrEmailAddress,
} from "../../../../lib/fetch";
import {
  FormActionBackendErrorResponse,
  ValidationErrorsArr,
} from "../../../../components/UI/FormWithErrorHandling";

const manageOrdersFindingInputsEntriesNames = [
  "orderFindingUser",
  "orderFindingOrderId",
] as const;
type manageOrdersFindingInputsEntriesNames =
  (typeof manageOrdersFindingInputsEntriesNames)[number];
export const manageOrdersFindingInputsPlaceholdersFromEntriesNames: {
  [key in manageOrdersFindingInputsEntriesNames]: string;
} = {
  orderFindingUser: "Orderer's login or e-mail address",
  orderFindingOrderId: "Order identificator",
};

type IManyInputsEntry<T extends string> = {
  handleInputChange: (newValue: string) => void;
  setQueryDebouncingState: React.Dispatch<React.SetStateAction<string>>;
  queryDebouncingState: string;
  inputValue: string;
  name: T;
};

type IManyInputsEntries<T extends string> = IManyInputsEntry<T>[];

const manyInputsEntryDefaultValue: IManyInputsEntry<string> = {
  handleInputChange: () => {},
  queryDebouncingState: "",
  setQueryDebouncingState: () => {},
  inputValue: "",
  name: "",
};
const generateManyInputsEntriesDefaultValue = <T extends string>(
  entriesNames: T[] | readonly T[]
) =>
  [...entriesNames].map(
    () => manyInputsEntryDefaultValue
  ) as IManyInputsEntries<T>;

type IOrdersFindingCtxQueryDataObj<fetchFnDecompressedData> = {
  isLoading: boolean;
  data: fetchFnDecompressedData | undefined;
  validationErrors: false | ValidationErrorsArr;
  differentError: false | null | Error;
};

const defaultOrdersFindingCtxQueryDataObj = {
  isLoading: false,
  data: undefined,
  validationErrors: false as const,
  differentError: null,
};

export const ManageOrdersFindingOrderContext = createContext<
  {
    ordersFindingCredentials: IManyInputsEntries<manageOrdersFindingInputsEntriesNames>;
  } & {
    retrieveUsersQueryData: IOrdersFindingCtxQueryDataObj<IRetrieveAvailableUsersPossibleReceivedData>;
  }
>({
  ordersFindingCredentials: generateManyInputsEntriesDefaultValue(
    manageOrdersFindingInputsEntriesNames
  ),
  retrieveUsersQueryData: defaultOrdersFindingCtxQueryDataObj,
});

type receivedUsersFetchFnResult = {
  data: IRetrieveAvailableUsersPossibleReceivedData;
};

export default function ManageOrdersFindingOrderContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const orderFindingUser = useInput<string>({
    searchParamName: manageOrdersFindingInputsEntriesNames[0],
    defaultStateValueInCaseOfCreatingStateHere: "",
    saveDebouncedStateInSearchParams: false,
  });
  const orderFindingOrderId = useInput<string>({
    searchParamName: manageOrdersFindingInputsEntriesNames[1],
    defaultStateValueInCaseOfCreatingStateHere: "",
    saveDebouncedStateInSearchParams: false,
  });

  const {
    data: retrieveUsersData,
    error: retrieveUsersError,
    isLoading: retrieveUsersIsLoading,
  } = useQuery<receivedUsersFetchFnResult, FormActionBackendErrorResponse>({
    queryKey: ["retrieve-users", orderFindingUser.queryDebouncingState],
    queryFn: ({ queryKey, signal }) =>
      retrieveAvailableUsersBasedOnLoginOrEmailAddress(
        queryKey[1] as string,
        signal
      ),
    enabled: orderFindingUser.queryDebouncingState?.trim() !== "",
  });
  const retrieveUsersArr = retrieveUsersData?.data;
  const retrieveUsersValidationErrors =
    Array.isArray(retrieveUsersError) &&
    retrieveUsersError.length > 0 &&
    retrieveUsersError;
  const retrieveUsersDifferentError =
    !retrieveUsersValidationErrors && (retrieveUsersError as Error | null);

  return (
    <ManageOrdersFindingOrderContext.Provider
      value={{
        ordersFindingCredentials: [orderFindingUser, orderFindingOrderId].map(
          (orderFindingEntry, i) => ({
            ...orderFindingEntry,
            name: manageOrdersFindingInputsEntriesNames[i],
            inputValue: orderFindingEntry.inputValueInCaseOfCreatingStateHere!,
          })
        ),
        retrieveUsersQueryData: {
          isLoading: retrieveUsersIsLoading,
          data: retrieveUsersArr,
          differentError: retrieveUsersDifferentError,
          validationErrors: retrieveUsersValidationErrors,
        },
      }}
    >
      {children}
    </ManageOrdersFindingOrderContext.Provider>
  );
}
