import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";
import {
  IReceivedOrdersDocumentWhenRetrievingThemAsAnAdmin,
  ManageOrdersFindingOrderContext,
} from "./ManageOrdersFindingOrderContext";

export const UpdateOrderDetailsContext = createContext<{
  selectedOrderFromList: string;
  setSelectedOrderFromList: React.Dispatch<React.SetStateAction<string>>;
  handleGoBackFromOrderSummary: undefined | (() => void);
  orderEntryOnClick: (
    order: IReceivedOrdersDocumentWhenRetrievingThemAsAnAdmin
  ) => void;
  selectedContactInformationEntryIdToChangeTheOrderOneTo: string | undefined;
  setSelectedContactInformationEntryIdToChangeTheOrderOneTo: React.Dispatch<
    React.SetStateAction<string | undefined>
  >;
}>({
  selectedOrderFromList: "",
  setSelectedOrderFromList: () => {},
  handleGoBackFromOrderSummary: undefined,
  orderEntryOnClick: () => {},
  selectedContactInformationEntryIdToChangeTheOrderOneTo: undefined,
  setSelectedContactInformationEntryIdToChangeTheOrderOneTo: () => {},
});

export default function UpdateOrderDetailsContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [selectedOrderFromList, setSelectedOrderFromList] = useState("");
  const {
    stateInformation: { setSelectedUserFromList },
  } = useContext(ManageOrdersFindingOrderContext);

  const handleGoBackFromOrderSummary = useCallback(() => {
    setSelectedOrderFromList("");
  }, []);

  const orderEntryOnClick = useCallback(
    (order: IReceivedOrdersDocumentWhenRetrievingThemAsAnAdmin) => {
      const login = order.userId?.login;
      if (login) setSelectedUserFromList(login);
      setSelectedOrderFromList(order._id);
    },
    [setSelectedUserFromList]
  );

  const [
    selectedContactInformationEntryIdToChangeTheOrderOneTo,
    setSelectedContactInformationEntryIdToChangeTheOrderOneTo,
  ] = useState<undefined | string>(undefined);

  return (
    <UpdateOrderDetailsContext.Provider
      value={{
        selectedOrderFromList,
        setSelectedOrderFromList,
        handleGoBackFromOrderSummary,
        orderEntryOnClick,
        selectedContactInformationEntryIdToChangeTheOrderOneTo,
        setSelectedContactInformationEntryIdToChangeTheOrderOneTo,
      }}
    >
      {children}
    </UpdateOrderDetailsContext.Provider>
  );
}
