import { useQuery } from "@tanstack/react-query";
import {
  FormActionBackendErrorResponse,
  FormActionBackendResponse,
} from "../../components/UI/FormWithErrorHandling";
import { IOrder } from "../../models/order.model";
import { IOrdersSortOnlyDebouncedProperties } from "../../store/userPanel/UserOrdersManagerOrdersDetailsContext";
import { retrieveAvailableOrdersBasedOnSelectedUserAndIdentificator } from "../../lib/fetch";
import useExtractStableDataOrErrorsFromMyBackendUseQueryResponse from "../queryRelated/useExtractStableDataOrErrorsFromMyBackendUseQueryResponse";

export default function useRetrieveOrdersData({
  selectedUserFromList,
  providedOrderId,
  ordersSortPropertiesToSend,
  pageNr,
  onlyAmount,
}: {
  selectedUserFromList: string;
  providedOrderId: string;
  ordersSortPropertiesToSend: IOrdersSortOnlyDebouncedProperties | undefined;
  pageNr: number;
  onlyAmount?: 1;
}) {
  type retrieveOrdersExpectedResponse = typeof onlyAmount extends undefined
    ? FormActionBackendResponse<IOrder[]>
    : FormActionBackendResponse<number>;

  const {
    data: retrieveOrdersData,
    isLoading: retrieveOrdersIsLoading,
    error: retrieveOrdersError,
  } = useQuery<retrieveOrdersExpectedResponse, FormActionBackendErrorResponse>({
    queryKey: [
      "retrieve-orders",
      selectedUserFromList,
      providedOrderId,
      ordersSortPropertiesToSend,
      pageNr,
      onlyAmount,
    ],
    queryFn: ({ signal, queryKey }) =>
      retrieveAvailableOrdersBasedOnSelectedUserAndIdentificator(
        queryKey[1] as string,
        queryKey[2] as string,
        queryKey[3] as IOrdersSortOnlyDebouncedProperties,
        queryKey[4] as number,
        signal,
        queryKey[5] as 1 | undefined
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

  return {
    retrieveOrdersArr: retrieveOrdersArr,
    retrieveOrdersValidationErrors,
    retrieveOrdersOtherErrors,
    retrieveOrdersIsLoading,
  };
}
