import { createContext, ReactNode, useCallback, useMemo } from "react";

import createDateNoTakingTimezoneIntoAccount from "../../helpers/createDateNoTakingTimezoneIntoAccount";
import { IFormInputField } from "../../components/UI/FormWithErrorHandling";
import useCompareComplexForUseMemo from "../../hooks/useCompareComplexForUseMemo";

const nowDate = createDateNoTakingTimezoneIntoAccount({});
export type IDatePickerInputFieldElementConfigurationContextProps = {
  latestPossibleDate?: Date;
  oldestPossibleDate?: Date;
  inputFieldObjFromProps?: IFormInputField;
};
export const DatePickerInputFieldElementConfigurationContext = createContext<
  IDatePickerInputFieldElementConfigurationContextProps & {
    dateInPossibleRangeStable?: (date: Date) => boolean;
    changeDateYearStable?: (
      curSelectedDateObj: Date,
      yearsArrIndex: number
    ) => number;
    availableYearsToChoose: string[];
  }
>({
  availableYearsToChoose: [],
});

export default function DatePickerInputFieldElementConfigurationContextProvider({
  latestPossibleDate = nowDate,
  oldestPossibleDate = createDateNoTakingTimezoneIntoAccount({
    year: nowDate.getFullYear() - 150,
    month: 0,
    day: 1,
  }),
  children,
  ...restCtxData
}: IDatePickerInputFieldElementConfigurationContextProps & {
  children?: ReactNode;
}) {
  const latestPossibleDateStable =
    useCompareComplexForUseMemo(latestPossibleDate);
  const oldestPossibleYear = oldestPossibleDate?.getFullYear();
  const availableYearsToChoose = useMemo(
    () =>
      Array.from(
        {
          length:
            latestPossibleDateStable.getFullYear() - oldestPossibleYear + 1,
        },
        (_, i) => oldestPossibleYear + i + ""
      ),
    [oldestPossibleYear, latestPossibleDateStable]
  );

  const dateInPossibleRangeStable = useCallback(
    (date: Date) => {
      const oldestPossibleDate = createDateNoTakingTimezoneIntoAccount({
        year: +availableYearsToChoose[0],
        month: 0,
        day: 1,
      });
      return date >= oldestPossibleDate && date <= latestPossibleDateStable;
    },
    [availableYearsToChoose, latestPossibleDateStable]
  );

  const changeDateYearStable = useCallback(
    (curSelectedDateObj: Date, yearsArrIndex: number) =>
      curSelectedDateObj.setUTCFullYear(+availableYearsToChoose[yearsArrIndex]),
    [availableYearsToChoose]
  );

  return (
    <DatePickerInputFieldElementConfigurationContext.Provider
      value={{
        latestPossibleDate,
        oldestPossibleDate,
        dateInPossibleRangeStable,
        changeDateYearStable,
        availableYearsToChoose,
        ...restCtxData,
      }}
    >
      {children}
    </DatePickerInputFieldElementConfigurationContext.Provider>
  );
}
