import { createContext, ReactNode, useState } from "react";

export const PagesManagerContext = createContext<{
  pageNr: number;
  setPageNr: (newPageNr: number) => void;
}>({
  pageNr: -1,
  setPageNr: () => {},
});

export default function PagesManagerContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [pageNr, setPageNr] = useState<number>(0);

  return (
    <PagesManagerContext.Provider value={{ pageNr, setPageNr }}>
      {children}
    </PagesManagerContext.Provider>
  );
}
