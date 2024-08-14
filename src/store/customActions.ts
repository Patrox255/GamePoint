import { AppDispatch, RootState } from ".";
import filterPropertiesFromObj from "../helpers/filterPropertiesFromObj";
import { queryClient, sendCart } from "../lib/fetch";
import { cartSliceActions, IModifyProductQuantityPayload } from "./cartSlice";

export const modifyCartQuantityAction =
  (data: IModifyProductQuantityPayload & { login?: string }) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
      if (!getState().cartSlice.cart) return;
      const { login } = data;
      if (login) dispatch(cartSliceActions.MODIFY_OPTIMISTIC_UPDATING(true));
      dispatch(
        cartSliceActions.MODIFY_PRODUCT_QUANTITY(
          filterPropertiesFromObj(data, [
            "login",
          ]) as IModifyProductQuantityPayload
        )
      );
      const {
        cartSlice: { cart: newCart },
      } = getState();
      localStorage.setItem("cart", JSON.stringify(getState().cartSlice.cart));
      if (!login) return;
      await queryClient.cancelQueries({ queryKey: ["cart-edit"] });
      await queryClient.cancelQueries({ queryKey: ["cart"] });
      await queryClient.fetchQuery({
        queryKey: ["cart-edit"],
        queryFn: ({ signal }) => sendCart(newCart!, signal),
      });
      await queryClient.setQueryData(["cart"], newCart);
      dispatch(cartSliceActions.MODIFY_OPTIMISTIC_UPDATING(false));
      await queryClient.invalidateQueries({ queryKey: ["cart"] });
    } catch (e) {
      dispatch(cartSliceActions.MODIFY_OPTIMISTIC_UPDATING(false));
      await queryClient.invalidateQueries({ queryKey: ["cart"] });
    }
  };
