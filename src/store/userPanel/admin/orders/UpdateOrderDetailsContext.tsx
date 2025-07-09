import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  IReceivedOrdersDocumentWhenRetrievingThemAsAnAdmin,
  ManageOrdersFindingOrderContext,
} from "./ManageOrdersFindingOrderContext";
import {
  FetchedGamesQuantityModificationAdditionalInformationContextProvider,
  onModifyGameQuantityFnStable,
} from "../../../../components/products/FetchedGamesQuantityModificationAdditionalInformation";
import useCompareComplexForUseMemo from "../../../../hooks/useCompareComplexForUseMemo";
import { useStateWithSearchParams } from "../../../../hooks/useStateWithSearchParams";

export type OrderItemsQuantityModificationEntries = {
  id: string;
  newQuantity: number;
}[];

export const adminSelectedOrderSessionStorageAndSearchParamsEntryName =
  "adminSelectedOrder";

export const UpdateOrderDetailsContext = createContext<{
  selectedOrderFromList: string;
  setSelectedOrderFromList: (newSelectedOrder: string) => void;
  handleGoBackFromOrderSummary: undefined | (() => void);
  orderEntryOnClick: (
    order: IReceivedOrdersDocumentWhenRetrievingThemAsAnAdmin
  ) => void;
  selectedContactInformationEntryIdToChangeTheOrderOneTo: string | undefined;
  setSelectedContactInformationEntryIdToChangeTheOrderOneTo: React.Dispatch<
    React.SetStateAction<string | undefined>
  >;
  orderItemsQuantityModificationEntriesStable:
    | OrderItemsQuantityModificationEntries
    | undefined;
  setOrderItemsQuantityModificationEntries: React.Dispatch<
    React.SetStateAction<OrderItemsQuantityModificationEntries>
  >;
  orderModificationTotalPrice?: number;
  setOrderModificationTotalPrice: React.Dispatch<
    React.SetStateAction<number | undefined>
  >;
}>({
  selectedOrderFromList: "",
  setSelectedOrderFromList: () => {},
  handleGoBackFromOrderSummary: undefined,
  orderEntryOnClick: () => {},
  selectedContactInformationEntryIdToChangeTheOrderOneTo: undefined,
  setSelectedContactInformationEntryIdToChangeTheOrderOneTo: () => {},
  orderItemsQuantityModificationEntriesStable: undefined,
  setOrderItemsQuantityModificationEntries: () => {},
  orderModificationTotalPrice: undefined,
  setOrderModificationTotalPrice: () => {},
});

export default function UpdateOrderDetailsContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const {
    state: selectedOrderFromList,
    setStateWithSearchParams: setSelectedOrderFromList,
  } = useStateWithSearchParams({
    initialStateStable: "",
    searchParamName: adminSelectedOrderSessionStorageAndSearchParamsEntryName,
    storeEvenInitialValue: false,
    useDebouncingTimeout: false,
  });
  const {
    stateInformation: { setSelectedUserFromList },
    ordersFindingCredentials,
  } = useContext(ManageOrdersFindingOrderContext);
  const ordersFindingCredentialsStable = useCompareComplexForUseMemo(
    ordersFindingCredentials
  );
  const userFindingInputCredentialsStable = useMemo(
    () =>
      ordersFindingCredentialsStable.find(
        (ordersFindingCredentialsEntry) =>
          ordersFindingCredentialsEntry.name === "orderFindingUser"
      )!,
    [ordersFindingCredentialsStable]
  );

  const handleGoBackFromOrderSummary = useCallback(() => {
    setSelectedOrderFromList("");
  }, [setSelectedOrderFromList]);

  const orderEntryOnClick = useCallback(
    (order: IReceivedOrdersDocumentWhenRetrievingThemAsAnAdmin) => {
      const login = order.userId?.login;
      setSelectedOrderFromList(order._id);
      if (!login) return;
      setSelectedUserFromList(login);
      userFindingInputCredentialsStable.handleInputChange(login);
      userFindingInputCredentialsStable.setQueryDebouncingState(login);
    },
    [
      setSelectedOrderFromList,
      setSelectedUserFromList,
      userFindingInputCredentialsStable,
    ]
  );

  const [
    selectedContactInformationEntryIdToChangeTheOrderOneTo,
    setSelectedContactInformationEntryIdToChangeTheOrderOneTo,
  ] = useState<undefined | string>(undefined);

  const [
    orderItemsQuantityModificationEntries,
    setOrderItemsQuantityModificationEntries,
  ] = useState<OrderItemsQuantityModificationEntries>([]);
  const orderItemsQuantityModificationEntriesStable =
    useCompareComplexForUseMemo(orderItemsQuantityModificationEntries);

  const [orderModificationTotalPrice, setOrderModificationTotalPrice] =
    useState<number | undefined>(undefined);

  const onModifyGameQuantityOrderItemsFnStable =
    useCallback<onModifyGameQuantityFnStable>(
      (
        newGameQuantity,
        gameInfo,
        unmodifiedGameInfoEntryForOrderModification
      ) => {
        const { _id } = gameInfo;
        const orderItemsQuantityModificationRelatedEntryIndex =
          orderItemsQuantityModificationEntriesStable.findIndex(
            (orderItemsQuantityModificationEntry) =>
              orderItemsQuantityModificationEntry.id === _id
          );
        const handleUpdateTotalPrice = (quantityChange: number) => {
          setOrderModificationTotalPrice((oldTotalPrice) => {
            if (oldTotalPrice === undefined) return oldTotalPrice;
            return oldTotalPrice + quantityChange * gameInfo.finalPrice;
          });
        };

        if (orderItemsQuantityModificationRelatedEntryIndex === -1) {
          if (unmodifiedGameInfoEntryForOrderModification)
            handleUpdateTotalPrice(
              newGameQuantity -
                unmodifiedGameInfoEntryForOrderModification.quantity
            );
          return setOrderItemsQuantityModificationEntries(
            (oldOrderItemsQuantityModificationEntries) => [
              ...oldOrderItemsQuantityModificationEntries,
              { id: _id, newQuantity: newGameQuantity },
            ]
          );
        }
        handleUpdateTotalPrice(
          newGameQuantity -
            orderItemsQuantityModificationEntriesStable[
              orderItemsQuantityModificationRelatedEntryIndex
            ].newQuantity
        );
        setOrderItemsQuantityModificationEntries(
          (oldOrderItemsQuantityModificationEntries) => {
            const newOrderItemsQuantityModificationEntries = [
              ...oldOrderItemsQuantityModificationEntries,
            ];
            const relatedEntryToChangeCurOneTo = {
              ...newOrderItemsQuantityModificationEntries[
                orderItemsQuantityModificationRelatedEntryIndex
              ],
              newQuantity: newGameQuantity,
            };
            newOrderItemsQuantityModificationEntries[
              orderItemsQuantityModificationRelatedEntryIndex
            ] = relatedEntryToChangeCurOneTo;
            return newOrderItemsQuantityModificationEntries;
          }
        );
      },
      [orderItemsQuantityModificationEntriesStable]
    );

  useEffect(() => {
    if (selectedOrderFromList !== "") return;
    setOrderItemsQuantityModificationEntries([]);
    setOrderModificationTotalPrice(undefined);
  }, [selectedOrderFromList]);

  return (
    <UpdateOrderDetailsContext.Provider
      value={{
        selectedOrderFromList,
        setSelectedOrderFromList,
        handleGoBackFromOrderSummary,
        orderEntryOnClick,
        selectedContactInformationEntryIdToChangeTheOrderOneTo,
        setSelectedContactInformationEntryIdToChangeTheOrderOneTo,
        orderItemsQuantityModificationEntriesStable,
        setOrderItemsQuantityModificationEntries,
        orderModificationTotalPrice,
        setOrderModificationTotalPrice,
      }}
    >
      <FetchedGamesQuantityModificationAdditionalInformationContextProvider
        onModifyGameQuantityFnStable={onModifyGameQuantityOrderItemsFnStable}
      >
        {children}
      </FetchedGamesQuantityModificationAdditionalInformationContextProvider>
    </UpdateOrderDetailsContext.Provider>
  );
}
