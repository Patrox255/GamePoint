import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IGame } from "../models/game.model";

type possibleOptimisticUpdatingProperties = "cart" | "totalPrice";
export interface ICartStateArrEntry {
  id: string;
  quantity: number;
}
export type cartStateArr = ICartStateArrEntry[];
export type cartState = {
  cart?: cartStateArr;
  optimisticUpdatingInProgressObj: {
    [key in possibleOptimisticUpdatingProperties]: boolean;
  };
  productIdWhichCartModificationResultedInAnError?: string;
};
const initialState: cartState = {
  cart: undefined,
  optimisticUpdatingInProgressObj: { cart: false, totalPrice: false },
  productIdWhichCartModificationResultedInAnError: undefined,
};

export type modifyProductQuantityOperations = "increase" | "decrease" | "set";
export interface IModifyProductQuantityPayload {
  operation: modifyProductQuantityOperations;
  productId: string;
  newQuantity?: number;
  finalPrice: number;
}

export interface ICartDetailsEntry {
  relatedGame: IGame;
}
export type cartDetails = ICartDetailsEntry[];

interface IModifyOptimisticUpdatingPossibleArg {
  propertyName: possibleOptimisticUpdatingProperties;
  value: boolean;
}

const cartSlice = createSlice({
  name: "cartSlice",
  initialState,
  reducers: {
    SET_CART: (state, action: PayloadAction<cartStateArr>) => {
      state.cart = action.payload;
      localStorage.setItem("cart", JSON.stringify(action.payload));
    },
    MODIFY_PRODUCT_QUANTITY: (
      state,
      action: PayloadAction<IModifyProductQuantityPayload>
    ) => {
      const { productId, operation, newQuantity } = action.payload;
      const cart = state.cart;
      if (!cart) return;
      const cartProduct = cart.find((product) => product.id === productId);

      if (!cartProduct) {
        return {
          ...state,
          ...(operation !== "decrease" && {
            cart: [
              ...cart,
              { id: productId, quantity: newQuantity ? newQuantity : 1 },
            ],
          }),
        };
      }
      const newProductQuantity =
        operation === "set"
          ? newQuantity!
          : cartProduct.quantity + (operation === "increase" ? 1 : -1);
      if (newProductQuantity <= 0)
        return {
          ...state,
          cart: cart.filter((product) => product !== cartProduct),
        };
      cartProduct.quantity = newProductQuantity;
    },
    MODIFY_OPTIMISTIC_UPDATING: (
      state,
      action: PayloadAction<IModifyOptimisticUpdatingPossibleArg | boolean>
    ) => {
      const { payload } = action;
      const propertyName =
        (payload as IModifyOptimisticUpdatingPossibleArg)?.propertyName ||
        "cart";
      const payloadValue = (payload as IModifyOptimisticUpdatingPossibleArg)
        ?.value;
      const value =
        payloadValue !== undefined ? payloadValue : (payload as boolean);
      state.optimisticUpdatingInProgressObj[propertyName] = value;
    },
    SET_PRODUCT_ID_WHICH_CART_MODIFICATION_RESULTED_IN_AN_ERROR: (
      S,
      A: PayloadAction<string | undefined>
    ) => {
      S.productIdWhichCartModificationResultedInAnError = A.payload;
    },
  },
});

export default cartSlice.reducer;
export const cartSliceActions = cartSlice.actions;
