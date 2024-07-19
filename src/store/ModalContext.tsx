import { createContext, ReactNode, useState } from "react";

export const ModalContext = createContext<{
  loginModalOpen: boolean;
  setLoginModalOpen: (newModalOpen: boolean) => void;
}>({ loginModalOpen: false, setLoginModalOpen: () => {} });

export default function ModalContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);

  return (
    <ModalContext.Provider value={{ loginModalOpen, setLoginModalOpen }}>
      {children}
    </ModalContext.Provider>
  );
}
