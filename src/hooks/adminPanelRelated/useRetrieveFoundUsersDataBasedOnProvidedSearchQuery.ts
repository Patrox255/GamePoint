import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { FormActionBackendErrorResponse } from "../../components/UI/FormWithErrorHandling";
import {
  IRetrieveAvailableUsersPossibleReceivedData,
  retrieveAvailableUsersBasedOnLoginOrEmailAddress,
} from "../../lib/fetch";

type receivedUsersFetchFnResult = {
  data: IRetrieveAvailableUsersPossibleReceivedData;
};

export default function useRetrieveFoundUsersDataBasedOnProvidedSearchQuery<
  T extends boolean
>(
  debouncedSearchQuery: string,
  forOrders: boolean,
  onlyAmount: T,
  selectedUserFromList?: string,
  additionalEnabledCondition: boolean = true,
  pageNr?: number
) {
  const {
    data: retrieveUsersData,
    error: retrieveUsersError,
    isLoading: retrieveUsersIsLoading,
  } = useQuery<receivedUsersFetchFnResult, FormActionBackendErrorResponse>({
    queryKey: [
      "retrieve-users",
      forOrders,
      debouncedSearchQuery,
      onlyAmount,
      onlyAmount ? undefined : pageNr,
    ],
    queryFn: ({ queryKey, signal }) =>
      retrieveAvailableUsersBasedOnLoginOrEmailAddress(
        queryKey[2] as string,
        signal,
        queryKey[1] as boolean,
        queryKey[3] as boolean,
        queryKey[4] as number | undefined
      ),
    enabled:
      debouncedSearchQuery?.trim() &&
      !selectedUserFromList &&
      additionalEnabledCondition
        ? true
        : false,
  });
  const retrieveUsersArr = useMemo(
    () => retrieveUsersData?.data,
    [retrieveUsersData]
  ) as
    | (T extends true ? number : IRetrieveAvailableUsersPossibleReceivedData)
    | undefined;
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

  return {
    retrieveUsersArr,
    retrieveUsersDifferentError,
    retrieveUsersValidationErrors,
    retrieveUsersIsLoading,
  };
}
