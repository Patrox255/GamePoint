/* eslint-disable react-refresh/only-export-components */
import { LoaderFunction, useNavigate } from "react-router-dom";

import MainWrapper from "../components/structure/MainWrapper";
import { useAppSelector } from "../hooks/reduxStore";
import OrderPageContent from "../components/orderPage/OrderPageContent";
import { getAuthData, queryClient } from "../lib/fetch";
import { useEffect } from "react";

export default function OrderPage() {
  const { login } = useAppSelector((state) => state.userAuthSlice);
  const isLogged = login !== undefined;
  const cart = useAppSelector((state) => state.cartSlice.cart);
  const navigate = useNavigate();

  useEffect(() => {
    if (cart && cart.length === 0) navigate("/cart", { replace: true });
  }, [cart, navigate]);

  return (
    <MainWrapper>
      <OrderPageContent
        isLogged={isLogged}
        key={`order-page-content-${isLogged ? "user" : "guest"}`}
      />
    </MainWrapper>
  );
}

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const pathName = new URL(request.url).pathname;
    await queryClient.fetchQuery({
      queryKey: ["userAuth", pathName],
      queryFn: ({ signal }) => getAuthData(signal),
      retry: false,
      staleTime: 2000,
    });
  } catch (e) {
    console.error(e);
  }
  return null;
};
