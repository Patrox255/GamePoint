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
export const modifyCartQuantityAction =
  (data: IModifyCartQuantityActionArg) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const curActionRelatedNotificationMessageEntry =
      modifyCartQuantityActionArgToNotificationMessageEntry(data);
    let curCartQueryResIfUserLogged: cartStateArr | undefined;
    let curCartState: cartStateArr | undefined;
    try {
      curCartState = getState().cartSlice.cart;
      if (!curCartState) return;
      const curCartTotalPrice = queryClient.getQueryData(
        generateCartTotalPriceQueryKey(curCartState)
      ) as { data: number } | undefined;
      console.log(data.operation, data, curCartTotalPrice);
      const { login } = data;
      if (login) dispatch(cartSliceActions.MODIFY_OPTIMISTIC_UPDATING(true));
      dispatch(
        notificationSystemActions.ADD_NOTIFICATION({
          type: "information",
          relatedApplicationFunctionalityIdentifier: "manageCartContent",
          content: curActionRelatedNotificationMessageEntry.information,
          rawInformationToRecognizeSameNotifications:
            curActionRelatedNotificationMessageEntry.information,
        })
      );
      dispatch(
        cartSliceActions.MODIFY_PRODUCT_QUANTITY(
          filterOrOnlyIncludeCertainPropertiesFromObj(data, [
            "login",
          ]) as IModifyProductQuantityPayload
        )
      );
      const {
        cartSlice: { cart: newCart },
      } = getState();
      const newCartTotalPriceQueryKey = generateCartTotalPriceQueryKey(
        newCart!
      );
      await queryClient.cancelQueries({ queryKey: newCartTotalPriceQueryKey });
      localStorage.setItem("cart", JSON.stringify(newCart));
      const showSuccessNotification = () =>
        dispatch(
          notificationSystemActions.ADD_NOTIFICATION({
            type: "success",
            content: curActionRelatedNotificationMessageEntry.success,
            relatedApplicationFunctionalityIdentifier: "manageCartContent",
            rawInformationToRecognizeSameNotifications:
              curActionRelatedNotificationMessageEntry.success,
          })
        );
      const findCurrentlyModifiedProductAmongCartState = (
        cartState: cartStateArr | undefined
      ) => cartState?.find((cartEntry) => cartEntry.id === data.productId);
      const previousCartProduct =
        findCurrentlyModifiedProductAmongCartState(curCartState);
      const newCartProduct =
        findCurrentlyModifiedProductAmongCartState(newCart);
      if (!previousCartProduct || !newCartProduct) throw "";
      const productQuantityDiff =
        newCartProduct.quantity - previousCartProduct.quantity;
      const newCartTotalPrice =
        (curCartTotalPrice?.data || 0) + productQuantityDiff * data.finalPrice;
      console.log(newCartTotalPrice);
      queryClient.setQueryData(newCartTotalPriceQueryKey, {
        data: newCartTotalPrice,
      });

      if (!login) return showSuccessNotification();
      curCartQueryResIfUserLogged = queryClient.getQueryData(["cart"]);
      console.log(curCartQueryResIfUserLogged);
      await queryClient.cancelQueries({ queryKey: ["cart-edit"] });
      await queryClient.cancelQueries({ queryKey: ["cart"] });
      await queryClient.fetchQuery({
        queryKey: ["cart-edit"],
        queryFn: ({ signal }) => sendCart(newCart!, signal),
      });
      await queryClient.setQueryData(["cart"], newCart);
      dispatch(cartSliceActions.MODIFY_OPTIMISTIC_UPDATING(false));
      showSuccessNotification();
    } catch (e) {
      dispatch(cartSliceActions.MODIFY_OPTIMISTIC_UPDATING(false));
      if (curCartState) {
        dispatch(cartSliceActions.SET_CART(curCartState));
        localStorage.setItem("cart", JSON.stringify(curCartState));
      }
      dispatch(
        notificationSystemActions.ADD_NOTIFICATION({
          content: curActionRelatedNotificationMessageEntry.error,
          type: "error",
          relatedApplicationFunctionalityIdentifier: "manageCartContent",
          rawInformationToRecognizeSameNotifications:
            curActionRelatedNotificationMessageEntry.error,
        })
      );
      if (curCartQueryResIfUserLogged)
        queryClient.setQueryData(["cart"], curCartQueryResIfUserLogged);
    }
    await queryClient.invalidateQueries({ queryKey: ["cart"] });
  };
