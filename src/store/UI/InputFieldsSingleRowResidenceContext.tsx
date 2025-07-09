import { createContext, ReactNode } from "react";

export const InputFieldsSingleRowResidenceContext =
  createContext<boolean>(false);

export default function InputFieldsSingleRowResidenceContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <InputFieldsSingleRowResidenceContext.Provider value={true}>
      {children}
    </InputFieldsSingleRowResidenceContext.Provider>
  );
}
