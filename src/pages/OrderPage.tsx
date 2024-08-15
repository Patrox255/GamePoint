/* eslint-disable react-refresh/only-export-components */
import { LoaderFunction } from "react-router-dom";

import MainWrapper from "../components/structure/MainWrapper";
import { useAppSelector } from "../hooks/reduxStore";
import OrderPageContent from "../components/orderPage/OrderPageContent";
import { getAuthData, queryClient } from "../lib/fetch";
import { OrderPageContentIsLoggedContext } from "../store/orderPage/OrderPageContentIsLoggedContext";

export default function OrderPage() {
  const { login } = useAppSelector((state) => state.userAuthSlice);
  const isLogged = login !== undefined;

  return (
    <MainWrapper>
      <OrderPageContentIsLoggedContext.Provider value={isLogged}>
        <OrderPageContent
          key={`order-page-content-${isLogged ? "user" : "guest"}`}
        />
      </OrderPageContentIsLoggedContext.Provider>
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
