import { createContext, ReactNode } from "react";

export const OnCartPageContext = createContext<boolean | undefined>(undefined);

export default function OnCartPageContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <OnCartPageContext.Provider value={true}>
      {children}
    </OnCartPageContext.Provider>
  );
}
