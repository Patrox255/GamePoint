import { cartStateArr } from "../store/cartSlice";

export default function generateCartDetailsQueryKey(cartState: cartStateArr) {
  return ["cart-details", cartState.map((cartStateEntry) => cartStateEntry.id)];
}
