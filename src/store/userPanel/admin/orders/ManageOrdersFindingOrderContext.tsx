/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useInput } from "../../../../hooks/useInput";
import { useQuery } from "@tanstack/react-query";
import {
  IRetrieveAvailableUsersPossibleReceivedData,
  retrieveAvailableOrdersBasedOnSelectedUserAndIdentificator,
  retrieveAvailableUsersBasedOnLoginOrEmailAddress,
} from "../../../../lib/fetch";
import {
  FormActionBackendErrorResponse,
  FormActionBackendResponse,
  ValidationErrorsArr,
} from "../../../../components/UI/FormWithErrorHandling";
import { IOrder } from "../../../../models/order.model";
import useExtractStableDataOrErrorsFromMyBackendUseQueryResponse from "../../../../hooks/queryRelated/useExtractStableDataOrErrorsFromMyBackendUseQueryResponse";
import { PagesManagerContext } from "../../../products/PagesManagerContext";
import {
  IOrdersSortOnlyDebouncedProperties,
  UserOrdersManagerOrdersDetailsContext,
} from "../../UserOrdersManagerOrdersDetailsContext";

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
  } & {
    stateInformation: {
      selectedUserFromList: string;
      setSelectedUserFromList: React.Dispatch<React.SetStateAction<string>>;
      selectedOrderFromList: string;
      setSelectedOrderFromList: React.Dispatch<React.SetStateAction<string>>;
    };
  } & {
    retrieveOrdersQueryData: IOrdersFindingCtxQueryDataObj<IOrder[]> & {
      orderEntryOnClick: (orderId: string) => void;
    };
  }
>({
  ordersFindingCredentials: generateManyInputsEntriesDefaultValue(
    manageOrdersFindingInputsEntriesNames
  ),
  retrieveUsersQueryData: defaultOrdersFindingCtxQueryDataObj,
  retrieveOrdersQueryData: {
    ...defaultOrdersFindingCtxQueryDataObj,
    orderEntryOnClick: () => {},
  },
  stateInformation: {
    selectedUserFromList: "",
    setSelectedUserFromList: () => {},
    selectedOrderFromList: "",
    setSelectedOrderFromList: () => {},
  },
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

  const [selectedUserFromList, setSelectedUserFromList] = useState<string>("");

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
    enabled:
      orderFindingUser.queryDebouncingState?.trim() &&
      selectedUserFromList === ""
        ? true
        : false,
  });
  const retrieveUsersArr = useMemo(
    () => retrieveUsersData?.data,
    [retrieveUsersData]
  );
  const retrieveUsersValidationErrors = useMemo(
    () =>
      Array.isArray(retrieveUsersError) &&
      retrieveUsersError.length > 0 &&
      retrieveUsersError,
    [retrieveUsersError]
  );
  const retrieveUsersDifferentError = useMemo(
    () =>
      !retrieveUsersValidationErrors && retrieveUsersError
        ? (retrieveUsersError as Error)
        : null,
    [retrieveUsersError, retrieveUsersValidationErrors]
  );

  const { pageNr, setPageNr } = useContext(PagesManagerContext);
  const { ordersSortPropertiesToSend } = useContext(
    UserOrdersManagerOrdersDetailsContext
  );

  const {
    data: retrieveOrdersData,
    isLoading: retrieveOrdersIsLoading,
    error: retrieveOrdersError,
  } = useQuery<
    FormActionBackendResponse<IOrder[]>,
    FormActionBackendErrorResponse
  >({
    queryKey: [
      "retrieve-orders",
      selectedUserFromList,
      orderFindingOrderId.queryDebouncingState,
      ordersSortPropertiesToSend,
      pageNr,
    ],
    queryFn: ({ signal, queryKey }) =>
      retrieveAvailableOrdersBasedOnSelectedUserAndIdentificator(
        queryKey[1] as string,
        queryKey[2] as string,
        queryKey[3] as IOrdersSortOnlyDebouncedProperties,
        queryKey[4] as number,
        signal
      ),
  });
  const {
    stableData: retrieveOrdersArr,
    stableOtherErrors: retrieveOrdersOtherErrors,
    stableValidationErrors: retrieveOrdersValidationErrors,
  } = useExtractStableDataOrErrorsFromMyBackendUseQueryResponse(
    retrieveOrdersData,
    retrieveOrdersError
  );

  useEffect(() => {
    if (!retrieveOrdersArr || retrieveOrdersArr.length > 0 || pageNr !== 0)
      return;
    setPageNr(0);
  }, [pageNr, retrieveOrdersArr, setPageNr]);

  const [selectedOrderFromList, setSelectedOrderFromList] = useState("");
  const orderEntryOnClick = useCallback(
    (orderId: string) => setSelectedOrderFromList(orderId),
    []
  );

  console.log(selectedOrderFromList);

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
        retrieveOrdersQueryData: {
          data: retrieveOrdersArr,
          differentError: retrieveOrdersOtherErrors,
          validationErrors: retrieveOrdersValidationErrors,
          isLoading: retrieveOrdersIsLoading,
          orderEntryOnClick,
        },
        stateInformation: {
          selectedUserFromList,
          setSelectedUserFromList,
          selectedOrderFromList,
          setSelectedOrderFromList,
        },
      }}
    >
      {children}
    </ManageOrdersFindingOrderContext.Provider>
  );
}
