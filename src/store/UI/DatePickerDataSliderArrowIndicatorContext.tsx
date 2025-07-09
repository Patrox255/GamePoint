import { createContext, ReactNode } from "react";

type DatePickerDataSliderArrowIndicatorContextVal =
  | "upper"
  | "lower"
  | undefined;
export const DatePickerDataSliderArrowIndicatorContext =
  createContext<DatePickerDataSliderArrowIndicatorContextVal>(undefined);

export default function DatePickerDataSliderArrowIndicatorContextProvider({
  children,
  DatePickerDataSliderArrowIndicatorContextVal,
}: {
  children: ReactNode;
  DatePickerDataSliderArrowIndicatorContextVal: DatePickerDataSliderArrowIndicatorContextVal;
}) {
  return (
    <DatePickerDataSliderArrowIndicatorContext.Provider
      value={DatePickerDataSliderArrowIndicatorContextVal}
    >
      {children}
    </DatePickerDataSliderArrowIndicatorContext.Provider>
  );
}
