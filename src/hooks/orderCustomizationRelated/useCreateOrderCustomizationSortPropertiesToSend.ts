import { useMemo } from "react";

import {
  IOrderCustomizationStateObj,
  IOrderCustomizationStateObjWithDebouncedFields,
} from "../useHandleElementsOrderCustomizationState";
import {
  createOrderCustomizationObjWithOnlyOrWithoutDebouncedProperties,
  excludeDebouncedKeys,
  onlyDebouncedKeys,
} from "../../components/UI/OrderCustomization";

export default function useCreateOrderCustomizationSortPropertiesToSend<
  T extends string
>(
  orderCustomizationStateStable: IOrderCustomizationStateObjWithDebouncedFields<
    excludeDebouncedKeys<T>
  >
) {
  const orderCustomizationSortPropertiesToSend = useMemo(
    () =>
      createOrderCustomizationObjWithOnlyOrWithoutDebouncedProperties(
        orderCustomizationStateStable,
        false
      ) as IOrderCustomizationStateObj<onlyDebouncedKeys<T>>,
    [orderCustomizationStateStable]
  );
  return orderCustomizationSortPropertiesToSend;
}
