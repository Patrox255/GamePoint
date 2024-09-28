import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IGame } from "../models/game.model";

export interface ICartStateArrEntry {
  id: string;
  quantity: number;
}
export type cartStateArr = ICartStateArrEntry[];
export type cartState = {
  cart?: cartStateArr;
  optimisticUpdatingInProgress: boolean;
};
const initialState: cartState = {
  cart: undefined,
  optimisticUpdatingInProgress: false,
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
    MODIFY_OPTIMISTIC_UPDATING: (state, action: PayloadAction<boolean>) => {
      state.optimisticUpdatingInProgress = action.payload;
    },
  },
});

export default cartSlice.reducer;
export const cartSliceActions = cartSlice.actions;
