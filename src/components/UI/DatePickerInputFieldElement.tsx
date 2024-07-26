import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { motion } from "framer-motion";

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

type datePickerState = "" | "start";

export const DatePickerInputFieldElementCtx = createContext<{
  datePickerState: datePickerState;
  setDatePickerState:
    | ((newDatePickerState: datePickerState) => void)
    | undefined;
  setSelectedDate: React.Dispatch<React.SetStateAction<Date | string>>;
  selectedDate: Date | string;
}>({
  datePickerState: "",
  setDatePickerState: undefined,
  setSelectedDate: () => {},
  selectedDate: "",
});

const nowDate = new Date();
const oldestPossibleYear = nowDate.getFullYear() - 150;
const availableMonthsToChoose = Array.from({ length: 12 }, (_, i) => {
  const nowDateCpy = new Date();
  nowDateCpy.setMonth(i);
  return nowDateCpy.toLocaleDateString(navigator.language, { month: "long" });
});
const availableYearsToChoose = Array.from(
  { length: nowDate.getFullYear() - oldestPossibleYear + 1 },
  (_, i) => oldestPossibleYear + i + ""
);

const changeDateYear = (curSelectedDateObj: Date, yearsArrIndex: number) =>
  curSelectedDateObj.setFullYear(+availableYearsToChoose[yearsArrIndex]);
const changeDateMonth = (curSelectedDateObj: Date, monthsArrIndex: number) =>
  curSelectedDateObj.setMonth(monthsArrIndex);

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
  const daysInCurrentMonth = new Date(curYear, curMonth + 1, 0).getDate();
  const datesGrid: datesGridArr = Array.from(
    { length: daysInCurrentMonth },
    (_, i) => ({
      day: i + 1,
      month: curMonth,
      year: curYear,
    })
  );
  const firstDayInCurrentMonth = new Date(curYear, curMonth, 1);
  const firstDayWeekDay = getDayOfWeekInMyFormat(firstDayInCurrentMonth);
  const addDatesBeforeToFulfillWeekRow = firstDayWeekDay !== 0;

  const addDatesToCompleteARowOrAddOneFn = (
    rowPlacement: "before" | "after"
  ) => {
    const firstOrLastDateGridEntry =
      datesGrid[rowPlacement === "before" ? 0 : datesGrid.length - 1];
    const firstOrLastDate = new Date(
      firstOrLastDateGridEntry.year,
      firstOrLastDateGridEntry.month,
      firstOrLastDateGridEntry.day
    );
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
        const dateToAdd = new Date(
          firstOrLastDate.getFullYear(),
          firstOrLastDate.getMonth(),
          firstOrLastDate.getDate() +
            (rowPlacement === "before" ? -(i + 1) : i + 1)
        );
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
  const lastDayInCurrentMonth = new Date(curYear, curMonth + 1, 0);
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
  const { datePickerState, setDatePickerState, selectedDate, setSelectedDate } =
    useContext(DatePickerInputFieldElementCtx);
  const { forceInputFieldBlur, forceInputFieldFocus, inputFieldObj } =
    useContext(InputFieldElementChildrenCtx);

  useEffect(() => {
    const clickOutsideFn = (e: MouseEvent) => {
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

  const renderDatePicker = datePickerState !== "";

  useEffect(() => {
    if (datePickerState === "") forceInputFieldBlur();
  }, [datePickerState, forceInputFieldBlur]);

  const sliderProductElementChildrenFnStable = useCallback(
    (element: unknown, key: number) => (
      <p key={key} className="block min-w-36">
        {element as string}
      </p>
    ),
    []
  );

  const selectedDateObj =
    typeof selectedDate === "string" ? nowDate : selectedDate;

  const changeDatePropertyAfterPlayingWithIndividualSliderStable = useCallback(
    (
      sliderElementIndex: number,
      changePropertyFn: (
        curSelectedDateObj: Date,
        sliderElementIndex: number
      ) => number
    ) => {
      setSelectedDate((curSelectedDate) => {
        const curSelectedDateObj = getSelectedDate(curSelectedDate);
        changePropertyFn(curSelectedDateObj, sliderElementIndex);
        return curSelectedDateObj;
      });
    },
    [setSelectedDate]
  );

  const changeYearAfterPlayingWithYearsSliderStable = useCallback(
    (sliderElementIndex: number) =>
      changeDatePropertyAfterPlayingWithIndividualSliderStable(
        sliderElementIndex,
        changeDateYear
      ),
    [changeDatePropertyAfterPlayingWithIndividualSliderStable]
  );

  const changeMonthAfterPlayingWithMonthsSliderStable = useCallback(
    (sliderElementIndex: number) =>
      changeDatePropertyAfterPlayingWithIndividualSliderStable(
        sliderElementIndex,
        changeDateMonth
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

  if (!inputFieldObj || !setDatePickerState)
    return <p>Must be called using the date picker input field element!</p>;

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
          console.log("B");
        }}
      >
        <div className="px-24 py-18 flex justify-center items-center flex-col">
          <DataSlider
            elements={availableYearsToChoose}
            manageExternalStateInsteadOfTheOneHereFn={
              manageYearStateInDataSliderFnStable
            }
            externalState={selectedDateObj.getFullYear() + ""}
          >
            <SliderProductElement
              elements={availableYearsToChoose}
              lessInvasiveArrowAnimation
            >
              {sliderProductElementChildrenFnStable}
            </SliderProductElement>
          </DataSlider>
          <ul className="date-picker-dates-grid grid grid-cols-7 gap-3">
            {datesGrid.map((dateGridObj) => {
              const isActive =
                dateGridObj.day === selectedDateObj.getDate() &&
                dateGridObj.month === selectedDateObj.getMonth() &&
                dateGridObj.year === selectedDateObj.getFullYear();
              return (
                <motion.li
                  key={`${dateGridObj.month}-${dateGridObj.day}`}
                  className={`w-full justify-center flex ${
                    !isActive ? "cursor-pointer" : ""
                  }`}
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: isActive ? 1 : 0.7,
                    color: isActive ? properties.highlightRed : undefined,
                  }}
                  whileHover={{ opacity: 1, color: properties.highlightRed }}
                  onClick={
                    !isActive
                      ? () => {
                          const clickedDateObj = new Date(
                            dateGridObj.year,
                            dateGridObj.month,
                            dateGridObj.day
                          );
                          setSelectedDate(clickedDateObj);
                        }
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
          >
            <SliderProductElement
              lessInvasiveArrowAnimation
              elements={availableMonthsToChoose}
            >
              {sliderProductElementChildrenFnStable}
            </SliderProductElement>
          </DataSlider>
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
  const [datePickerState, setDatePickerState] = useState<"" | "start">("");
  const [selectedDate, setSelectedDate] = useState<Date | string>(nowDate);

  return (
    <InputFieldElement
      inputFieldObjFromProps={inputFieldObjFromProps}
      value={selectedDate}
      onChange={setSelectedDate}
    >
      <DatePickerInputFieldElementCtx.Provider
        value={{
          datePickerState,
          setDatePickerState,
          setSelectedDate,
          selectedDate,
        }}
      >
        <DatePicker />
      </DatePickerInputFieldElementCtx.Provider>
    </InputFieldElement>
  );
}
