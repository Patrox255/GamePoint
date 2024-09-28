import { cartStateArr } from "../store/cartSlice";

export default function generateCartTotalPriceQueryKey(cart: cartStateArr) {
  return ["cart-details-price", cart];
}
