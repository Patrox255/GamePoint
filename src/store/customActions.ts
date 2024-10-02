import { AppDispatch, RootState } from ".";
import filterOrOnlyIncludeCertainPropertiesFromObj from "../helpers/filterOrOnlyIncludeCertainPropertiesFromObj";
import generateCartTotalPriceQueryKey from "../helpers/generateCartTotalPriceQueryKey";
import { queryClient, sendCart } from "../lib/fetch";
import {
  cartSliceActions,
  cartStateArr,
  IModifyProductQuantityPayload,
  modifyProductQuantityOperations,
} from "./cartSlice";
import { notificationSystemActions } from "./UI/notificationSystemSlice";

interface IModifyCartQuantityActionArgToNotificationMessageMapEntry {
  success: string;
  error: string;
  information: string;
}
const eraseCartProductNotificationMessageEntry: IModifyCartQuantityActionArgToNotificationMessageMapEntry =
  {
    error: "Failed to remove the currently selected product from the cart!",
    success: "Removed the currently selected product from the cart!",
    information: "Removing the currently selected product from the cart...",
  };
const modifyCartQuantityActionArgToNotificationMessageMap: {
  [key in modifyProductQuantityOperations]: key extends "increase"
    ? IModifyCartQuantityActionArgToNotificationMessageMapEntry
    : {
        default: IModifyCartQuantityActionArgToNotificationMessageMapEntry;
        erase: IModifyCartQuantityActionArgToNotificationMessageMapEntry;
      };
} = {
  increase: {
    error: "Failed to add the currently selected product to the cart!",
    success: "Added the currently selected product to the cart!",
    information: "Adding the currently selected product to the cart...",
  },
  decrease: {
    erase: eraseCartProductNotificationMessageEntry,
    default: {
      error: "Failed to decrease the selected product quantity!",
      success: "Decreased the selected product quantity!",
      information: "Decreasing the selected product quantity...",
    },
  },
  set: {
    erase: eraseCartProductNotificationMessageEntry,
    default: {
      error: "Failed to set the selected product quantity!",
      success: "Set the selected product quantity!",
      information: "Setting the selected product quantity...",
    },
  },
};

const modifyCartQuantityActionArgToNotificationMessageEntry = ({
  operation,
  newQuantity,
}: IModifyCartQuantityActionArg) =>
  operation === "increase"
    ? modifyCartQuantityActionArgToNotificationMessageMap["increase"]
    : modifyCartQuantityActionArgToNotificationMessageMap[operation][
        newQuantity && newQuantity <= 0 ? "erase" : "default"
      ];

// when it comes to cart total price query res its key relies on the whole cart arr therefore I won't be
// editing the current one during optimistic updating procedure and only add appropriate query key for the
// new cart arr
type IModifyCartQuantityActionArg = IModifyProductQuantityPayload & {
  login?: string;
};
type cartStateFromReduxState = cartStateArr | undefined;
export const modifyCartQuantityAction =
  (
    data: IModifyCartQuantityActionArg,
    abortIfCannotAccessCurCartTotalPriceForOptimisticUpdate: boolean = false
  ) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const curActionRelatedNotificationMessageEntry =
      modifyCartQuantityActionArgToNotificationMessageEntry(data);
    let curCartQueryResIfUserLogged: cartStateArr | undefined;
    let curCartState: cartStateFromReduxState;
    let newCart: cartStateFromReduxState;
    let finishModifyCartQuantityActionWithDataValidationAfterOptimisticUpdate: () => void =
      async () => {};
    try {
      curCartState = getState().cartSlice.cart;
      if (!curCartState) return;
      const curCartTotalPrice = queryClient.getQueryData(
        generateCartTotalPriceQueryKey(curCartState)
      ) as { data: number } | undefined;
      const { login } = data;
      dispatch(
        cartSliceActions.MODIFY_OPTIMISTIC_UPDATING({
          propertyName: "totalPrice",
          value: true,
        })
      );
      if (login) dispatch(cartSliceActions.MODIFY_OPTIMISTIC_UPDATING(true));
      dispatch(
        notificationSystemActions.ADD_NOTIFICATION({
          type: "information",
          relatedApplicationFunctionalityIdentifier: "manageCartContent",
          contentComponentId: "default",
          defaultComponentProps: {
            text: curActionRelatedNotificationMessageEntry.information,
          },
        })
      );
      dispatch(
        cartSliceActions.MODIFY_PRODUCT_QUANTITY(
          filterOrOnlyIncludeCertainPropertiesFromObj(data, [
            "login",
          ]) as IModifyProductQuantityPayload
        )
      );
      ({
        cartSlice: { cart: newCart },
      } = getState());
      // const newCartTotalPriceQueryKey = generateCartTotalPriceQueryKey(
      //   newCart!
      // );
      // const newCartTotalPriceQueryKey = ["cart-details-price", newCart];
      const newCartTotalPriceQueryKey = generateCartTotalPriceQueryKey(
        newCart || []
      );
      finishModifyCartQuantityActionWithDataValidationAfterOptimisticUpdate =
        async () => {
          dispatch(
            cartSliceActions.MODIFY_OPTIMISTIC_UPDATING({
              propertyName: "totalPrice",
              value: false,
            })
          );
          await queryClient.invalidateQueries({ queryKey: ["cart"] });
          await queryClient.invalidateQueries({
            queryKey: newCartTotalPriceQueryKey,
          });
        };
      localStorage.setItem("cart", JSON.stringify(newCart));
      const showSuccessNotification = () =>
        dispatch(
          notificationSystemActions.ADD_NOTIFICATION({
            type: "success",
            contentComponentId: "default",
            defaultComponentProps: {
              text: curActionRelatedNotificationMessageEntry.success,
            },
            relatedApplicationFunctionalityIdentifier: "manageCartContent",
          })
        );
      const finishActionWithSuccess = () => {
        showSuccessNotification();
        dispatch(
          cartSliceActions.SET_PRODUCT_ID_WHICH_CART_MODIFICATION_RESULTED_IN_AN_ERROR()
        );
      };
      const findCurrentlyModifiedProductAmongCartState = (
        cartState: cartStateArr | undefined
      ) => cartState?.find((cartEntry) => cartEntry.id === data.productId);
      const previousCartProduct =
        findCurrentlyModifiedProductAmongCartState(curCartState);
      const newCartProduct =
        findCurrentlyModifiedProductAmongCartState(newCart);
      const removingCartProductFromTheCart =
        (previousCartProduct?.quantity === 1 &&
          data.operation === "decrease") ||
        (data.newQuantity !== undefined &&
          data.newQuantity <= 0 &&
          data.operation === "set")
          ? true
          : false;
      const addingProductToTheCart =
        !previousCartProduct && newCartProduct ? true : false;
      if (
        (!previousCartProduct && !addingProductToTheCart) ||
        (!newCartProduct && !removingCartProductFromTheCart)
      )
        throw "";
      const productQuantityDiff = addingProductToTheCart
        ? newCartProduct!.quantity
        : removingCartProductFromTheCart
        ? -previousCartProduct!.quantity
        : newCartProduct!.quantity - previousCartProduct!.quantity;
      if (
        curCartTotalPrice?.data === undefined &&
        abortIfCannotAccessCurCartTotalPriceForOptimisticUpdate
      )
        throw {
          message:
            "Failed to update the product quantity due to not being able to validate current cart price!",
          customMessage: true,
        };
      const newCartTotalPrice =
        (curCartTotalPrice?.data || 0) + productQuantityDiff * data.finalPrice;
      queryClient.setQueryData(newCartTotalPriceQueryKey, {
        data: newCartTotalPrice,
      });

      if (!login) {
        await finishModifyCartQuantityActionWithDataValidationAfterOptimisticUpdate();
        return finishActionWithSuccess();
      }
      curCartQueryResIfUserLogged = queryClient.getQueryData(["cart"]);
      await queryClient.cancelQueries({ queryKey: ["cart-edit"] });
      await queryClient.cancelQueries({ queryKey: ["cart"] });
      await queryClient.fetchQuery({
        queryKey: ["cart-edit"],
        queryFn: ({ signal }) => sendCart(newCart!, signal),
      });
      await queryClient.setQueryData(["cart"], newCart);
      dispatch(cartSliceActions.MODIFY_OPTIMISTIC_UPDATING(false));
      finishActionWithSuccess();
    } catch (e) {
      dispatch(
        cartSliceActions.SET_PRODUCT_ID_WHICH_CART_MODIFICATION_RESULTED_IN_AN_ERROR(
          data.productId
        )
      );
      dispatch(cartSliceActions.MODIFY_OPTIMISTIC_UPDATING(false));
      if (curCartState) {
        dispatch(cartSliceActions.SET_CART(curCartState));
        localStorage.setItem("cart", JSON.stringify(curCartState));
      }
      dispatch(
        notificationSystemActions.ADD_NOTIFICATION({
          contentComponentId: "default",
          defaultComponentProps: {
            text: (e as Error & { customMessage?: boolean }).customMessage
              ? (e as Error).message
              : curActionRelatedNotificationMessageEntry.error,
          },
          type: "error",
          relatedApplicationFunctionalityIdentifier: "manageCartContent",
        })
      );
      if (curCartQueryResIfUserLogged)
        queryClient.setQueryData(["cart"], curCartQueryResIfUserLogged);
    }
    await finishModifyCartQuantityActionWithDataValidationAfterOptimisticUpdate();
  };
