import { createContext, ReactNode } from "react";
import { useStateWithSearchParams } from "../../../../hooks/useStateWithSearchParams";

export const ManageUsersContext = createContext<{
  selectedUserFromList?: string;
  setSelectedUserFromList?: (newSelectedUser: string) => void;
}>({ selectedUserFromList: undefined, setSelectedUserFromList: undefined });

export default function ManageUsersContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const {
    debouncingState: selectedUserFromList,
    setStateWithSearchParams: setSelectedUserFromList,
  } = useStateWithSearchParams(
    "",
    "adminSelectedUser",
    undefined,
    false,
    false
  );

  return (
    <ManageUsersContext.Provider
      value={{ selectedUserFromList, setSelectedUserFromList }}
    >
      {children}
    </ManageUsersContext.Provider>
  );
}
