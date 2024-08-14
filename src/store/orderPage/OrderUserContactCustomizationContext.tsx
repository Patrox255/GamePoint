import { createContext } from "react";

export const OrderUserContactCustomizationContext = createContext<{
  curSelectedContactInformationOverviewId?: string;
  setCurSelectedContactInformationOverviewId: React.Dispatch<
    React.SetStateAction<string>
  >;
}>({
  curSelectedContactInformationOverviewId: undefined,
  setCurSelectedContactInformationOverviewId: () => {},
});
