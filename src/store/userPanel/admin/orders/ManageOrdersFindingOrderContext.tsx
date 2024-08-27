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
  retrieveAvailableUsersBasedOnLoginOrEmailAddress,
} from "../../../../lib/fetch";
import {
  FormActionBackendErrorResponse,
  ValidationErrorsArr,
} from "../../../../components/UI/FormWithErrorHandling";
import { IOrder } from "../../../../models/order.model";
import { PagesManagerContext } from "../../../products/PagesManagerContext";
import { UserOrdersManagerOrdersDetailsContext } from "../../UserOrdersManagerOrdersDetailsContext";
import useRetrieveOrdersData from "../../../../hooks/adminPanelRelated/useRetrieveOrdersData";
import { calcMaxPossiblePageNr } from "../../../../components/UI/PagesElement";
import { MAX_ORDERS_PER_PAGE } from "../../../../lib/config";
import { IUser } from "../../../../models/user.model";

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

const retrieveFilledValidationErrorsArr = (
  validationErrorsArrs: (ValidationErrorsArr | false)[]
) => {
  const foundArr = validationErrorsArrs.find(
    (validationErrorsArr) =>
      validationErrorsArr && validationErrorsArr.length > 0
  );
  return foundArr ? foundArr : false;
};

export type IReceivedOrdersDocumentWhenRetrievingThemAsAnAdmin = IOrder & {
  userId?: IUser;
};
type IReceivedOrdersDocumentsWhenRetrievingThemAsAnAdmin =
  IReceivedOrdersDocumentWhenRetrievingThemAsAnAdmin[];

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
    retrieveOrdersQueryData: IOrdersFindingCtxQueryDataObj<IReceivedOrdersDocumentsWhenRetrievingThemAsAnAdmin> & {
      orderEntryOnClick: (
        order: IReceivedOrdersDocumentWhenRetrievingThemAsAnAdmin
      ) => void;
      retrieveOrdersAmount: number | undefined;
    };
  } & {
    orderSummaryRelatedStateInformation: {
      handleGoBackFromOrderSummary: (() => void) | undefined;
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
    retrieveOrdersAmount: undefined,
  },
  stateInformation: {
    selectedUserFromList: "",
    setSelectedUserFromList: () => {},
    selectedOrderFromList: "",
    setSelectedOrderFromList: () => {},
  },
  orderSummaryRelatedStateInformation: {
    handleGoBackFromOrderSummary: undefined,
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

  const retrieveOrdersDataArgObj = {
    ordersSortPropertiesToSend,
    pageNr,
    providedOrderId: orderFindingOrderId.queryDebouncingState,
    selectedUserFromList,
  };

  const {
    retrieveOrdersArr: retrieveOrdersAmount,
    retrieveOrdersIsLoading: retrieveOrdersAmountIsLoading,
    retrieveOrdersOtherErrors: retrieveOrdersAmountOtherErrors,
    retrieveOrdersValidationErrors: retrieveOrdersAmountValidationErrors,
  } = useRetrieveOrdersData({ ...retrieveOrdersDataArgObj, onlyAmount: 1 });

  const {
    retrieveOrdersArr,
    retrieveOrdersIsLoading,
    retrieveOrdersOtherErrors,
    retrieveOrdersValidationErrors,
  } = useRetrieveOrdersData(retrieveOrdersDataArgObj);
  const retrieveOrdersArrTyped = retrieveOrdersArr as
    | IReceivedOrdersDocumentsWhenRetrievingThemAsAnAdmin
    | undefined; // had to type it like this as its type
  // wasn't inferenced correctly

  useEffect(() => {
    if (
      !retrieveOrdersArrTyped ||
      retrieveOrdersArrTyped.length > 0 ||
      !retrieveOrdersAmount ||
      pageNr <= calcMaxPossiblePageNr(retrieveOrdersAmount, MAX_ORDERS_PER_PAGE)
    )
      return;
    setPageNr(0);
  }, [pageNr, retrieveOrdersArrTyped, setPageNr, retrieveOrdersAmount]);

  const [selectedOrderFromList, setSelectedOrderFromList] = useState("");
  const orderEntryOnClick = useCallback(
    (order: IReceivedOrdersDocumentWhenRetrievingThemAsAnAdmin) => {
      const login = order.userId?.login;
      if (login) setSelectedUserFromList(login);
      setSelectedOrderFromList(order._id);
    },
    []
  );

  const ordersRelatedQueryValidationErrorsArrStable = useMemo(
    () =>
      retrieveFilledValidationErrorsArr([
        retrieveOrdersValidationErrors,
        retrieveOrdersAmountValidationErrors,
      ]),
    [retrieveOrdersAmountValidationErrors, retrieveOrdersValidationErrors]
  );

  const handleGoBackFromOrderSummary = useCallback(() => {
    setSelectedOrderFromList("");
  }, []);

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
          data: retrieveOrdersArrTyped,
          differentError:
            retrieveOrdersOtherErrors || retrieveOrdersAmountOtherErrors,
          validationErrors: ordersRelatedQueryValidationErrorsArrStable,
          isLoading: retrieveOrdersIsLoading || retrieveOrdersAmountIsLoading,
          orderEntryOnClick,
          retrieveOrdersAmount,
        },
        stateInformation: {
          selectedUserFromList,
          setSelectedUserFromList,
          selectedOrderFromList,
          setSelectedOrderFromList,
        },
        orderSummaryRelatedStateInformation: { handleGoBackFromOrderSummary },
      }}
    >
      {children}
    </ManageOrdersFindingOrderContext.Provider>
  );
}
