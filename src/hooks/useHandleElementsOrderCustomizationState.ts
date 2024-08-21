import { Reducer, useCallback, useMemo, useReducer } from "react";
import generateInitialStateFromSearchParamsOrSessionStorage from "../helpers/generateInitialStateFromSearchParamsOrSessionStorage";
import { useLocation, useNavigate } from "react-router-dom";
import useChangeSearchParamsAndSessionStorageWhenUseReducerChanges from "./useChangeSearchParamsWhenUseReducerChanges";
import { isEqual } from "lodash";
import useCompareComplexForUseMemo from "./useCompareComplexForUseMemo";

export type IOrderCustomizationPropertyValues = "" | "1" | "-1";

export interface IOrderCustomizationProperty {
  value: IOrderCustomizationPropertyValues;
  order: number;
}

export type IOrderCustomizationStateObj<fieldsNames extends string = string> = {
  [key in fieldsNames]: IOrderCustomizationProperty;
};

// for context declaration
export type IOrderCustomizationStateObjWithDebouncedFields<
  fieldsNames extends string
> = IOrderCustomizationStateObj<fieldsNames> &
  IObjWithPropertiesTransformedToDebouncedOnes<
    IOrderCustomizationStateObj<fieldsNames>
  >;

export type IOrderCustomizationReducer = {
  type: orderCustomizationReducerActionTypes;
  payload: {
    fieldName: string;
    newState:
      | IOrderCustomizationPropertyValues
      | IOrderCustomizationStateWithoutDetailedFieldsNamesAsNowCantAccessThem;
    debouncingExecution?: boolean;
  };
};

type IOrderCustomizationStateWithoutDetailedFieldsNamesAsNowCantAccessThem =
  IOrderCustomizationStateObj;

type orderCustomizationReducerActionTypes =
  | "CHANGE_PROPERTY_VALUE"
  | "CHANGE_STATE";

const generateDebouncedVariableNameFromNormalOne = (name: string) =>
  `debounced${name.replace(name[0], name[0].toUpperCase())}`;

const orderCustomizationReducer: Reducer<
  IOrderCustomizationStateWithoutDetailedFieldsNamesAsNowCantAccessThem,
  IOrderCustomizationReducer
> = function (state, action) {
  const { fieldName, debouncingExecution = false, newState } = action.payload;
  const debouncedFieldName = `debounced${fieldName.replace(
    fieldName[0],
    fieldName[0].toUpperCase()
  )}`;
  const currentStateProperty = debouncingExecution
    ? state[debouncedFieldName]
    : state[fieldName];
  switch (action.type) {
    case "CHANGE_PROPERTY_VALUE": {
      const removeStateProperty = newState === "";
      const usedStateProperties = [...Object.entries(state)].filter(
        (entry) =>
          (!debouncingExecution
            ? !entry[0].startsWith("debounced")
            : entry[0].startsWith("debounced")) &&
          (!debouncingExecution
            ? entry[0] !== fieldName
            : entry[0] !==
              `debounced${fieldName.replace(
                fieldName[0],
                fieldName[0].toUpperCase()
              )}`) &&
          !isNaN(entry[1].order)
      );
      const orderedPropertiesToOverrideOldOnesIfRemovingProperty =
        Object.fromEntries(
          usedStateProperties
            .sort((a, b) => a[1].order - b[1].order)
            .map((entry, i) => [entry[0], { ...entry[1], order: i }])
        );
      const newPropertyObj = {
        value: newState as IOrderCustomizationPropertyValues,
        order: removeStateProperty
          ? NaN
          : isNaN(currentStateProperty.order)
          ? usedStateProperties.length
          : currentStateProperty.order,
      };
      const updatedStateProperties = {
        ...(debouncingExecution
          ? { [debouncedFieldName]: newPropertyObj }
          : { [fieldName]: newPropertyObj }),
        ...(removeStateProperty
          ? orderedPropertiesToOverrideOldOnesIfRemovingProperty
          : undefined),
      };
      const updatedState = {
        ...state,
        ...updatedStateProperties,
      };
      return updatedState;
    }
    case "CHANGE_STATE": {
      const updatedState = Object.entries(newState).reduce(
        (acc, [newStateKey, newStateValue]) => {
          const debouncedStateKey =
            generateDebouncedVariableNameFromNormalOne(newStateKey);
          return !newStateKey.startsWith("debounced") &&
            !isEqual(
              !debouncingExecution
                ? state[newStateKey]
                : state[debouncedStateKey],
              newStateValue
            )
            ? {
                ...acc,
                [debouncingExecution ? debouncedStateKey : newStateKey]:
                  newStateValue,
              }
            : acc;
        },
        {}
      ) as IOrderCustomizationStateWithoutDetailedFieldsNamesAsNowCantAccessThem;
      return {
        ...state,
        ...updatedState,
      };
    }
    default:
      return state;
  }
};

const defaultOrderCustomizationProperty = {
  value: "",
  order: NaN,
};

const defaultOrderCustomizationStateGeneratorFn = <T>(
  orderCustomizationFieldsNames: string[] | readonly string[]
) =>
  [...orderCustomizationFieldsNames].reduce(
    (acc, curFieldName) => ({
      ...acc,
      [curFieldName]: defaultOrderCustomizationProperty,
      [generateDebouncedVariableNameFromNormalOne(curFieldName)]:
        defaultOrderCustomizationProperty,
    }),
    {}
  ) as T;

export type IObjWithPropertiesTransformedToDebouncedOnes<T> = {
  [K in keyof T as `debounced${Capitalize<string & K>}`]: T[K];
};

type IOrderCustomizationDefaultStateFieldsValuesEntry = {
  defaultValue: IOrderCustomizationPropertyValues;
  defaultOrder?: number;
};

export default function useHandleElementsOrderCustomizationState<
  orderCustomizationFieldsNames extends string
>({
  orderCustomizationFieldsNamesStable,
  orderCustomizationSearchParamAndSessionStorageEntryName,
  orderCustomizationDefaultStateFieldsValuesStable,
  omitChangingSearchParams,
}: {
  orderCustomizationFieldsNamesStable:
    | orderCustomizationFieldsNames[]
    | readonly orderCustomizationFieldsNames[];
  orderCustomizationSearchParamAndSessionStorageEntryName: string;
  orderCustomizationDefaultStateFieldsValuesStable?: {
    [key in orderCustomizationFieldsNames]?: IOrderCustomizationDefaultStateFieldsValuesEntry;
  };
  omitChangingSearchParams?: boolean;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { search } = location;
  const searchParams = useMemo(() => new URLSearchParams(search), [search]);
  type IOrderCustomizationNormalFieldsPartOfState =
    IOrderCustomizationStateObj<orderCustomizationFieldsNames>;
  type IOrderCustomizationState = IOrderCustomizationNormalFieldsPartOfState &
    IObjWithPropertiesTransformedToDebouncedOnes<IOrderCustomizationNormalFieldsPartOfState>;
  const initialOrderCustomizationState = useMemo(() => {
    const stateFromSearchParamsOrSessionStorage =
      generateInitialStateFromSearchParamsOrSessionStorage(
        {},
        searchParams,
        orderCustomizationSearchParamAndSessionStorageEntryName,
        true
      );
    if (
      orderCustomizationDefaultStateFieldsValuesStable &&
      [...Object.entries(stateFromSearchParamsOrSessionStorage)].length === 0
    ) {
      const defaultFieldsValuesEntries = [
        ...Object.entries(orderCustomizationDefaultStateFieldsValuesStable),
      ] as [
        orderCustomizationFieldsNames,
        IOrderCustomizationDefaultStateFieldsValuesEntry
      ][];
      if (defaultFieldsValuesEntries.length !== 0)
        defaultFieldsValuesEntries.forEach(
          (defaultFieldsValuesEntry, index) => {
            const fieldPropertyValueBasedOnDefaultValueEntry: IOrderCustomizationProperty =
              {
                value: defaultFieldsValuesEntry[1].defaultValue,
                order: defaultFieldsValuesEntry[1].defaultOrder ?? index,
              };
            [
              defaultFieldsValuesEntry[0],
              generateDebouncedVariableNameFromNormalOne(
                defaultFieldsValuesEntry[0]
              ),
            ].forEach(
              (fieldNamePropertyToChangeInSessionOrSearchParamsState) =>
                (stateFromSearchParamsOrSessionStorage[
                  fieldNamePropertyToChangeInSessionOrSearchParamsState
                ] = fieldPropertyValueBasedOnDefaultValueEntry)
            );
          }
        );
    }

    return {
      ...defaultOrderCustomizationStateGeneratorFn<IOrderCustomizationState>(
        orderCustomizationFieldsNamesStable
      ),
      ...stateFromSearchParamsOrSessionStorage,
    };
  }, [
    orderCustomizationDefaultStateFieldsValuesStable,
    orderCustomizationFieldsNamesStable,
    orderCustomizationSearchParamAndSessionStorageEntryName,
    searchParams,
  ]);

  const [orderCustomizationState, orderCustomizationDispatch] = useReducer(
    orderCustomizationReducer,
    initialOrderCustomizationState
  );
  const orderCustomizationStateToSend: IOrderCustomizationState =
    useCompareComplexForUseMemo(
      orderCustomizationState as unknown as IOrderCustomizationState
    );

  const orderCustomizationHookCallback = useCallback(
    (newState: IOrderCustomizationState, searchParamName: string) => {
      orderCustomizationDispatch({
        type: "CHANGE_STATE",
        payload: {
          fieldName: searchParamName,
          debouncingExecution: true,
          newState,
        },
      });
    },
    []
  );
  const manuallyPrepareStateBeforeSavingInSessionStorageAndSearchParamsToSaveSomeSpaceFnStable =
    useCallback(
      (orderCustomizationState: IOrderCustomizationState) =>
        Object.fromEntries(
          Object.entries(orderCustomizationState).filter(
            (orderCustomizationStateEntry) =>
              !isNaN(
                (orderCustomizationStateEntry[1] as IOrderCustomizationProperty)
                  .order
              )
          )
        ) as IOrderCustomizationState,
      []
    );

  useChangeSearchParamsAndSessionStorageWhenUseReducerChanges({
    dispatchCallbackFn: orderCustomizationHookCallback,
    location,
    navigate,
    idOfDeeperStateThatIsSentAndDispatchCanChangeIt:
      orderCustomizationSearchParamAndSessionStorageEntryName,
    provideSearchParamNameToDispatch: true,
    searchParamName: orderCustomizationSearchParamAndSessionStorageEntryName,
    stateNormalProperty: orderCustomizationStateToSend,
    useDebouncedState: true,
    manuallyPrepareStateBeforeSavingInSessionStorageAndSearchParamsToSaveSomeSpaceFnStable,
    omitChangingSearchParams: omitChangingSearchParams,
  });

  return {
    orderCustomizationStateStable: orderCustomizationStateToSend,
    orderCustomizationDispatch,
  };
}
