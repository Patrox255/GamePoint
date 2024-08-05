import {
  createContext,
  MouseEvent,
  MouseEventHandler,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";

import { IFormInputField } from "./FormWithErrorHandling";
import InputFieldElement, {
  InputFieldElementChildrenCtx,
} from "./InputFieldElement";
import Button from "./Button";
import DataSlider from "../main/slider/DataSlider";
import SliderProductElement from "../main/slider/SliderProductElement";
import {
  manageExternalStateInsteadOfTheOneInUseSliderFn,
  newStateIndexOrFnRelyingOnCurState,
} from "../../hooks/useSlider";
import properties from "../../styles/properties";
import createDateNoTakingTimezoneIntoAccount from "../../helpers/createDateNoTakingTimezoneIntoAccount";
import { useInput } from "../../hooks/useInput";
import useCompareComplexForUseMemo from "../../hooks/useCompareComplexForUseMemo";
import Table, { tableCellIsDisabledFn, tableOnCellClickFn } from "./Table";

export const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

type sliderProductElementChildrenFn = (
  element: unknown,
  key: number
) => ReactNode;

type datePickerState = "" | "start" | "yearsList" | "monthsList";

type setSelectedDateImmediatelyArg = Date | ((curDate: Date) => Date);
type setSelectedDateImmediatelyFn = (
  arg: setSelectedDateImmediatelyArg
) => void;

const nowDate = createDateNoTakingTimezoneIntoAccount({});

export const DatePickerInputFieldElementCtx = createContext<{
  datePickerState: datePickerState;
  setDatePickerState: React.Dispatch<React.SetStateAction<datePickerState>>;
  setSelectedDateImmediately: setSelectedDateImmediatelyFn;
  selectedDateObj: Date;
}>({
  datePickerState: "",
  setDatePickerState: () => {},
  setSelectedDateImmediately: () => {},
  selectedDateObj: nowDate,
});

const oldestPossibleYear = nowDate.getFullYear() - 150;
const generateMonthsToChoose = (
  monthFormat: "numeric" | "2-digit" | "long" | "short" | "narrow"
) =>
  Array.from({ length: 12 }, (_, i) => {
    const nowDateCpy = createDateNoTakingTimezoneIntoAccount({});
    nowDateCpy.setUTCMonth(i);
    return nowDateCpy.toLocaleDateString(navigator.language, {
      month: monthFormat,
    });
  });

const availableMonthsToChoose = generateMonthsToChoose("long");
const availableYearsToChoose = Array.from(
  { length: nowDate.getFullYear() - oldestPossibleYear + 1 },
  (_, i) => oldestPossibleYear + i + ""
);

const dateInPossibleRange = (date: Date) => {
  const oldestPossibleDate = createDateNoTakingTimezoneIntoAccount({
    year: +availableYearsToChoose[0],
    month: 0,
    day: 1,
  });
  const latestPossibleDate = createDateNoTakingTimezoneIntoAccount({});
  return date >= oldestPossibleDate && date <= latestPossibleDate;
};

const changeDateYear = (curSelectedDateObj: Date, yearsArrIndex: number) =>
  curSelectedDateObj.setUTCFullYear(+availableYearsToChoose[yearsArrIndex]);
const changeDateMonth = (curSelectedDateObj: Date, monthsArrIndex: number) =>
  curSelectedDateObj.setUTCMonth(monthsArrIndex);

const getSelectedDate = (selectedDateState: Date | string) =>
  typeof selectedDateState === "string"
    ? nowDate
    : new Date(selectedDateState.getTime());

const getDayOfWeekInMyFormat = (date: Date) =>
  date.getDay() === 0 ? 6 : date.getDay() - 1;
// I believe format 0-mon, 6-sun works better in my implementation

type datesGridArr = {
  day: number;
  month: number;
  year: number;
  isActive?: boolean;
}[];

const generateDatesToChooseGrid = (curMonth: number, curYear: number) => {
  const daysInCurrentMonth = createDateNoTakingTimezoneIntoAccount({
    year: curYear,
    month: curMonth + 1,
    day: 0,
  }).getDate();
  const datesGrid: datesGridArr = Array.from(
    { length: daysInCurrentMonth },
    (_, i) => ({
      day: i + 1,
      month: curMonth,
      year: curYear,
    })
  );
  const firstDayInCurrentMonth = createDateNoTakingTimezoneIntoAccount({
    year: curYear,
    month: curMonth,
    day: 1,
  });
  const firstDayWeekDay = getDayOfWeekInMyFormat(firstDayInCurrentMonth);
  const addDatesBeforeToFulfillWeekRow = firstDayWeekDay !== 0;

  const addDatesToCompleteARowOrAddOneFn = (
    rowPlacement: "before" | "after"
  ) => {
    const firstOrLastDateGridEntry =
      datesGrid[rowPlacement === "before" ? 0 : datesGrid.length - 1];
    const firstOrLastDate = createDateNoTakingTimezoneIntoAccount({
      year: firstOrLastDateGridEntry.year,
      month: firstOrLastDateGridEntry.month,
      day: firstOrLastDateGridEntry.day,
    });
    const firstOrLastDateWeekDay = getDayOfWeekInMyFormat(firstOrLastDate);
    const datesBeforeArr = Array.from(
      {
        length:
          rowPlacement === "before"
            ? firstOrLastDateWeekDay === 0
              ? 7
              : firstOrLastDateWeekDay
            : firstOrLastDateWeekDay === 6
            ? 7
            : 6 - firstOrLastDateWeekDay,
      },
      (_, i) => {
        const dateToAdd = createDateNoTakingTimezoneIntoAccount({
          year: firstOrLastDate.getFullYear(),
          month: firstOrLastDate.getMonth(),
          day:
            firstOrLastDate.getDate() +
            (rowPlacement === "before" ? -(i + 1) : i + 1),
        });
        return {
          day: dateToAdd.getDate(),
          month: dateToAdd.getMonth(),
          year: dateToAdd.getFullYear(),
        };
      }
    );
    rowPlacement === "before"
      ? datesGrid.unshift(...datesBeforeArr.reverse())
      : datesGrid.push(...datesBeforeArr);
  };

  if (addDatesBeforeToFulfillWeekRow) {
    addDatesToCompleteARowOrAddOneFn("before");
  }
  const lastDayInCurrentMonth = createDateNoTakingTimezoneIntoAccount({
    year: curYear,
    month: curMonth + 1,
    day: 0,
  });
  const lastDayWeekDay = getDayOfWeekInMyFormat(lastDayInCurrentMonth);

  const addDatesAfterToFulfillWeekRow = lastDayWeekDay !== 6;
  if (addDatesAfterToFulfillWeekRow) {
    addDatesToCompleteARowOrAddOneFn("after");
  }

  while (datesGrid.length !== 42)
    addDatesToCompleteARowOrAddOneFn(
      Math.round(Math.random()) === 1 ? "before" : "after"
    );

  return datesGrid;
};

function DatePicker() {
  const {
    datePickerState,
    setDatePickerState,
    selectedDateObj,
    setSelectedDateImmediately,
  } = useContext(DatePickerInputFieldElementCtx);
  const { forceInputFieldBlur, forceInputFieldFocus, inputFieldObj } =
    useContext(InputFieldElementChildrenCtx);

  const activeYearCellElement = useRef<HTMLTableCellElement>(null);

  useEffect(() => {
    const clickOutsideFn: EventListenerOrEventListenerObject = (e) => {
      const target = e.target as Element;
      target &&
        !target.closest(".date-picker-control") &&
        !target.closest(".date-picker") &&
        datePickerState !== "" &&
        setDatePickerState?.("");
    };

    document.addEventListener("click", clickOutsideFn);

    return () => document.removeEventListener("click", clickOutsideFn);
  }, [datePickerState, setDatePickerState]);

  useEffect(() => {
    if (datePickerState === "") forceInputFieldBlur();
  }, [datePickerState, forceInputFieldBlur]);

  const sliderProductElementChildrenFnStable = useCallback<
    (onClick?: MouseEventHandler) => sliderProductElementChildrenFn
  >(
    (onClick) => (element, key) =>
      (
        <AnimatePresence mode="wait">
          <motion.p
            key={key}
            className="block min-w-36 bg-bodyBg py-3 rounded-xl cursor-pointer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            whileHover={{ opacity: 1 }}
            onClick={onClick}
          >
            {element as string}
          </motion.p>
        </AnimatePresence>
      ),
    []
  );

  const sliderProductElementChildrenYearsRelatedFnStable =
    useCallback<sliderProductElementChildrenFn>(
      (element, key) =>
        sliderProductElementChildrenFnStable((e) => {
          setDatePickerState("yearsList");
          e.stopPropagation();
        })(element, key),
      [sliderProductElementChildrenFnStable, setDatePickerState]
    );

  const sliderProductElementChildrenMonthsRelatedFnStable =
    useCallback<sliderProductElementChildrenFn>(
      (element, key) =>
        sliderProductElementChildrenFnStable((e) => {
          setDatePickerState("monthsList");
          e.stopPropagation();
        })(element, key),
      [sliderProductElementChildrenFnStable, setDatePickerState]
    );

  const changeDatePropertyAfterPlayingWithIndividualSliderStable = useCallback(
    (
      sliderElementIndex: number,
      changePropertyFn: (
        curSelectedDateObj: Date,
        sliderElementIndex: number
      ) => number,
      type: "year" | "month"
    ) => {
      setSelectedDateImmediately((curSelectedDate) => {
        const curSelectedDateCopy = getSelectedDate(curSelectedDate);
        changePropertyFn(curSelectedDateCopy, sliderElementIndex);
        if (!dateInPossibleRange(curSelectedDateCopy)) {
          if (type === "month") return curSelectedDate;
          return nowDate;
        }
        return curSelectedDateCopy;
      });
    },
    [setSelectedDateImmediately]
  );

  const changeYearAfterPlayingWithYearsSliderStable = useCallback(
    (sliderElementIndex: number) =>
      changeDatePropertyAfterPlayingWithIndividualSliderStable(
        sliderElementIndex,
        changeDateYear,
        "year"
      ),
    [changeDatePropertyAfterPlayingWithIndividualSliderStable]
  );

  const changeMonthAfterPlayingWithMonthsSliderStable = useCallback(
    (sliderElementIndex: number) =>
      changeDatePropertyAfterPlayingWithIndividualSliderStable(
        sliderElementIndex,
        changeDateMonth,
        "month"
      ),
    [changeDatePropertyAfterPlayingWithIndividualSliderStable]
  );

  const manageDatePropertyInDataSliderFnStableCreator = useCallback(
    (dateProperty: "year" | "month", selectedDateObj: Date) => {
      const fn: manageExternalStateInsteadOfTheOneInUseSliderFn = (
        newPropertyArrIndexOrFnRelyingOnOldPropertyIndex
      ) => {
        let newPropertyIndex = newPropertyArrIndexOrFnRelyingOnOldPropertyIndex;
        if (
          typeof newPropertyArrIndexOrFnRelyingOnOldPropertyIndex !== "number"
        )
          newPropertyIndex = newPropertyArrIndexOrFnRelyingOnOldPropertyIndex(
            dateProperty === "year"
              ? availableYearsToChoose.findIndex(
                  (availableYear) =>
                    selectedDateObj.getFullYear() === +availableYear
                )
              : selectedDateObj.getMonth()
          );

        dateProperty === "year"
          ? changeYearAfterPlayingWithYearsSliderStable(
              newPropertyIndex as number
            )
          : changeMonthAfterPlayingWithMonthsSliderStable(
              newPropertyIndex as number
            );
      };
      return fn;
    },
    [
      changeMonthAfterPlayingWithMonthsSliderStable,
      changeYearAfterPlayingWithYearsSliderStable,
    ]
  );

  const manageYearStateInDataSliderFnStable = useCallback(
    (
      newPropertyArrIndexOrFnRelyingOnOldPropertyIndex: newStateIndexOrFnRelyingOnCurState
    ) =>
      manageDatePropertyInDataSliderFnStableCreator(
        "year",
        selectedDateObj
      )(newPropertyArrIndexOrFnRelyingOnOldPropertyIndex),
    [manageDatePropertyInDataSliderFnStableCreator, selectedDateObj]
  );

  const manageMonthStateInDataSliderFnStable = useCallback(
    (
      newPropertyArrIndexOrFnRelyingOnOldPropertyIndex: newStateIndexOrFnRelyingOnCurState
    ) =>
      manageDatePropertyInDataSliderFnStableCreator(
        "month",
        selectedDateObj
      )(newPropertyArrIndexOrFnRelyingOnOldPropertyIndex),
    [manageDatePropertyInDataSliderFnStableCreator, selectedDateObj]
  );

  const curMonth = selectedDateObj.getMonth();
  const curYear = selectedDateObj.getFullYear();

  const datesGrid = useMemo(
    () => generateDatesToChooseGrid(curMonth, curYear),
    [curMonth, curYear]
  );

  const monthsOrYearsListTableOnCellClick = useCallback<
    (listProperty: "months" | "years") => tableOnCellClickFn<string>
  >(
    (listProperty) => (e: MouseEvent<HTMLTableCellElement>) => {
      e.stopPropagation();
      return (element, index) => {
        listProperty === "months"
          ? manageMonthStateInDataSliderFnStable(index)
          : manageYearStateInDataSliderFnStable(
              availableYearsToChoose.findIndex((year) => year === element)
            );
      };
    },
    [manageMonthStateInDataSliderFnStable, manageYearStateInDataSliderFnStable]
  );

  const monthsTableOnCellClickFnStable = useCallback<
    tableOnCellClickFn<string>
  >(
    (e) => monthsOrYearsListTableOnCellClick("months")(e),
    [monthsOrYearsListTableOnCellClick]
  );

  const yearsTableOnCellClickFnStable = useCallback<tableOnCellClickFn<string>>(
    (e) => monthsOrYearsListTableOnCellClick("years")(e),
    [monthsOrYearsListTableOnCellClick]
  );

  const MonthsOrYearsListControl = useCallback(
    () => (
      <Button
        onClick={(e) => {
          setDatePickerState("start");
          e.stopPropagation();
        }}
      >
        Go Back
      </Button>
    ),
    [setDatePickerState]
  );

  const monthsOrYearsListIsDisabled = useCallback<
    (
      operationToGetPossibleNewDate: (
        curDate: Date,
        element: string,
        index: number
      ) => void
    ) => tableCellIsDisabledFn<string>
  >(
    (operationToGetPossibleNewDate) => (element, index) => {
      const curYear = selectedDateObj.getFullYear();
      if (
        curYear < +availableYearsToChoose.at(-1)! &&
        curYear > +availableYearsToChoose[0]
      )
        return false;
      const dateToChangeCurDateToAfterClick = getSelectedDate(selectedDateObj);
      operationToGetPossibleNewDate(
        dateToChangeCurDateToAfterClick,
        element,
        index
      );
      return !dateInPossibleRange(dateToChangeCurDateToAfterClick);
    },
    [selectedDateObj]
  );

  const monthsListIsDisabled = useCallback<tableCellIsDisabledFn<string>>(
    (element, index) =>
      monthsOrYearsListIsDisabled((curDate, _, index) =>
        curDate.setUTCMonth(index)
      )(element, index),
    [monthsOrYearsListIsDisabled]
  );

  useEffect(() => {
    if (datePickerState === "yearsList")
      activeYearCellElement.current?.scrollIntoView({ behavior: "smooth" });
  }, [datePickerState]);

  if (!inputFieldObj || !setDatePickerState)
    return <p>Must be called using the date picker input field element!</p>;

  const renderDatePicker = datePickerState !== "";

  let datePickerContent;

  if (datePickerState === "start")
    datePickerContent = (
      <>
        <DataSlider
          elements={availableYearsToChoose}
          manageExternalStateInsteadOfTheOneHereFn={
            manageYearStateInDataSliderFnStable
          }
          externalState={selectedDateObj.getFullYear() + ""}
          findCurrentElementsIndexBasedOnCurrentExternalState={(curYear) =>
            (year: string) =>
              year === curYear}
        >
          <SliderProductElement
            elements={availableYearsToChoose}
            lessInvasiveArrowAnimation
          >
            {sliderProductElementChildrenYearsRelatedFnStable}
          </SliderProductElement>
        </DataSlider>
        <ul className="date-picker-dates-grid grid grid-cols-7 gap-3">
          {datesGrid.map((dateGridObj) => {
            const isActive =
              dateGridObj.day === selectedDateObj.getDate() &&
              dateGridObj.month === selectedDateObj.getMonth() &&
              dateGridObj.year === selectedDateObj.getFullYear();
            const dateGridDateObj = createDateNoTakingTimezoneIntoAccount({
              year: dateGridObj.year,
              month: dateGridObj.month,
              day: dateGridObj.day,
            });
            const disabled = !dateInPossibleRange(dateGridDateObj);
            return (
              <motion.li
                key={`${dateGridObj.month}-${dateGridObj.day}
                ${isActive ? "-active" : ""}`}
                className={`w-full justify-center flex ${
                  !isActive && !disabled ? "cursor-pointer" : ""
                }`}
                variants={{
                  initial: { opacity: 0, color: properties.defaultFont },
                  default: { opacity: 0.7 },
                  highlight: {
                    opacity: 1,
                    color: properties.highlightRed,
                  },
                  disabled: {
                    opacity: 0.5,
                  },
                }}
                initial="initial"
                animate={
                  isActive ? "highlight" : disabled ? "disabled" : "default"
                }
                whileHover={!isActive && !disabled ? "highlight" : undefined}
                onClick={
                  !isActive && !disabled
                    ? () => setSelectedDateImmediately(dateGridDateObj)
                    : undefined
                }
              >
                {dateGridObj.day}
              </motion.li>
            );
          })}
        </ul>
        <DataSlider
          elements={availableMonthsToChoose}
          manageExternalStateInsteadOfTheOneHereFn={
            manageMonthStateInDataSliderFnStable
          }
          externalState={selectedDateObj.getMonth()}
          findCurrentElementsIndexBasedOnCurrentExternalState={(
              curExternalState
            ) =>
            (_, index) =>
              curExternalState === index}
          additionalActionUponReachingTheBeginningByGoingForwardInTheEnd={() => {
            manageYearStateInDataSliderFnStable((curYearIndex) =>
              curYearIndex === availableYearsToChoose.length - 1
                ? 0
                : curYearIndex + 1
            );
          }}
          additionalActionUponReachingTheEndByGoingBackwardsInTheBeginning={() => {
            manageYearStateInDataSliderFnStable((curYearIndex) =>
              curYearIndex === 0
                ? availableYearsToChoose.length - 1
                : curYearIndex - 1
            );
          }}
        >
          <SliderProductElement
            lessInvasiveArrowAnimation
            elements={availableMonthsToChoose}
          >
            {sliderProductElementChildrenMonthsRelatedFnStable}
          </SliderProductElement>
        </DataSlider>
      </>
    );

  if (datePickerState === "monthsList")
    datePickerContent = (
      <>
        <MonthsOrYearsListControl />
        <Table
          elements={availableMonthsToChoose}
          getIndex={(element) => `months-list-${element}`}
          isActive={(_, index) => index === selectedDateObj.getMonth()}
          elementsPerRow={3}
          onCellClick={monthsTableOnCellClickFnStable}
          isDisabled={monthsListIsDisabled}
          additionalTailwindClasses="mt-3"
        >
          {(element) => element}
        </Table>
      </>
    );

  if (datePickerState === "yearsList") {
    const reversedYearsToChoose = [...availableYearsToChoose].reverse();
    datePickerContent = (
      <>
        <MonthsOrYearsListControl />
        <Table
          elements={reversedYearsToChoose}
          getIndex={(element) => `years-list-${element}`}
          isActive={(element) => selectedDateObj.getFullYear() === +element}
          elementsPerRow={1}
          onCellClick={yearsTableOnCellClickFnStable}
          additionalTailwindClasses="mt-3"
          additionalTableBodyTailwindClasses="overflow-y-auto max-h-[30vh] block"
          activeTableCellRef={activeYearCellElement}
        >
          {(element) => element}
        </Table>
      </>
    );
  }
  return (
    <>
      <div className="date-picker-control">
        <Button
          type="button"
          onClick={() => {
            forceInputFieldFocus();
            datePickerState === "" && setDatePickerState("start");
          }}
        >
          Select Date
        </Button>
      </div>
      <motion.div
        className="date-picker absolute top-[100%] left-0 bg-darkerBg overflow-hidden rounded-xl"
        initial={{ opacity: 0, height: 0 }}
        animate={{
          opacity: renderDatePicker ? 1 : 0,
          height: renderDatePicker ? "auto" : 0,
        }}
        exit={{ opacity: 0, height: 0 }}
        onClick={() => {
          forceInputFieldFocus();
        }}
      >
        <div className="px-24 py-4 flex justify-center items-center flex-col">
          {datePickerContent}
        </div>
      </motion.div>
    </>
  );
}

export default function DatePickerInputFieldElement({
  inputFieldObjFromProps,
}: {
  inputFieldObjFromProps: IFormInputField;
}) {
  const [datePickerState, setDatePickerState] = useState<datePickerState>("");
  const [selectedDate, setSelectedDate] = useState<Date | string>("");

  const {
    queryDebouncingState: selectedDateDebounced,
    setQueryDebouncingState: setSelectedDateDebounced,
    handleInputChange,
  } = useInput({
    searchParamName: "birthDate",
    saveDebouncedStateInSearchParamsAndSessionStorage: false,
    debouncingTime: 1000,
    stateValue: selectedDate,
    setStateValue: setSelectedDate,
  });

  const selectedDateDebouncedStable = useCompareComplexForUseMemo(
    selectedDateDebounced
  );

  const selectedDateObj = useMemo(() => {
    if (typeof selectedDateDebouncedStable !== "string")
      return selectedDateDebouncedStable;
    if (!dateRegex.test(selectedDateDebouncedStable)) return nowDate;

    const dateToCheck = createDateNoTakingTimezoneIntoAccount(
      selectedDateDebouncedStable
        .match(dateRegex)![0]
        .split("-")
        .map((dateEntry, i) => (i != 1 ? +dateEntry : +dateEntry - 1))
        .reduce<{ year?: number; month?: number; day?: number }>(
          (acc, dateEntry, i) => {
            acc[i === 0 ? "year" : i === 1 ? "month" : "day"] = dateEntry;
            return acc;
          },
          {}
        )
    );
    if (!dateInPossibleRange(dateToCheck)) return nowDate;
    return dateToCheck;
  }, [selectedDateDebouncedStable]);

  const setSelectedDateImmediatelyStable =
    useCallback<setSelectedDateImmediatelyFn>(
      (newDateOrGetNewDateFnRelyingOnOldOne: setSelectedDateImmediatelyArg) => {
        let dateToSet: Date;
        if (typeof newDateOrGetNewDateFnRelyingOnOldOne === "function")
          dateToSet = newDateOrGetNewDateFnRelyingOnOldOne(selectedDateObj);
        else dateToSet = newDateOrGetNewDateFnRelyingOnOldOne;
        setSelectedDateDebounced(dateToSet);
        setSelectedDate(dateToSet);
      },
      [selectedDateObj, setSelectedDateDebounced]
    );

  return (
    <InputFieldElement
      inputFieldObjFromProps={inputFieldObjFromProps}
      value={selectedDate}
      onChange={handleInputChange}
    >
      <DatePickerInputFieldElementCtx.Provider
        value={{
          datePickerState,
          setDatePickerState,
          setSelectedDateImmediately: setSelectedDateImmediatelyStable,
          selectedDateObj,
        }}
      >
        <DatePicker />
      </DatePickerInputFieldElementCtx.Provider>
    </InputFieldElement>
  );
}
