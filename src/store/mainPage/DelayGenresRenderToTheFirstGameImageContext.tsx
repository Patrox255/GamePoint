import { createContext, ReactNode, useState } from "react";

export const DelayGenresAppearanceToTheFirstGameImageContext = createContext<{
  finishedLoading: boolean;
  setFinishedLoading?: React.Dispatch<React.SetStateAction<boolean>>;
}>({
  finishedLoading: false,
  setFinishedLoading: undefined,
});

export default function DelayGenresAppearanceToTheFirstGameImageContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [finishedLoading, setFinishedLoading] = useState<boolean>(false);

  return (
    <DelayGenresAppearanceToTheFirstGameImageContext.Provider
      value={{ finishedLoading, setFinishedLoading }}
    >
      {children}
    </DelayGenresAppearanceToTheFirstGameImageContext.Provider>
  );
}
