import { Outlet, useLocation } from "react-router-dom";
import { ReactNode, useEffect, useMemo } from "react";
import Nav from "../components/UI/Nav";
import Footer from "../components/UI/Footer";
import { createPortal } from "react-dom";
import LoginModal from "../components/UI/modals/LoginModal";
import ModalContextProvider from "../store/ModalContext";
import ModalContainer from "../components/UI/modals/ModalContainer";
import ModalOverlay from "../components/UI/modals/ModalOverlay";
import { getAuthData, getCart, queryClient } from "../lib/fetch";
import { useQuery } from "@tanstack/react-query";
import { useAppDispatch, useAppSelector } from "../hooks/reduxStore";
import { userAuthSliceActions } from "../store/userAuthSlice";
import { isEqual } from "lodash";
import useCompareComplexForUseMemo from "../hooks/useCompareComplexForUseMemo";
import { cartSliceActions } from "../store/cartSlice";
import generateInitialStateFromSearchParamsOrSessionStorage from "../helpers/generateInitialStateFromSearchParamsOrSessionStorage";

let initialRender = true;
export const generateCartStateFromLocalStorage = () =>
  generateInitialStateFromSearchParamsOrSessionStorage(
    [],
    new URLSearchParams(""),
    "cart",
    false,
    [],
    false,
    "local"
  );

const RootLayout = ({ children }: { children?: ReactNode }) => {
  const { pathname, search } = useLocation();
  const searchParams = useMemo(() => new URLSearchParams(search), [search]);
  const dispatch = useAppDispatch();
  const userAuthStateStable = useCompareComplexForUseMemo(
    useAppSelector((state) => state.userAuthSlice)
  );
  const { data, error, isLoading } = useQuery({
    queryKey: ["userAuth", pathname],
    queryFn: ({ signal }) => getAuthData(signal),
    retry: false,
  });

  const cartSlice = useAppSelector((state) => state.cartSlice);
  const { optimisticUpdatingInProgress } = cartSlice;
  const cartStateStable = useCompareComplexForUseMemo(cartSlice.cart);
  const { data: cartData } = useQuery({
    queryKey: ["cart"],
    queryFn: ({ signal }) => getCart(signal),
    retry: false,
  });

  const userCartData = useMemo(() => cartData?.data?.cart, [cartData]);

  useEffect(() => {
    if (
      !userCartData ||
      !userAuthStateStable.login ||
      isEqual(userCartData, cartStateStable) ||
      optimisticUpdatingInProgress
    )
      return;
    dispatch(cartSliceActions.SET_CART(userCartData));
  }, [
    cartStateStable,
    dispatch,
    userCartData,
    optimisticUpdatingInProgress,
    userAuthStateStable.login,
  ]);

  useEffect(() => {
    if (!data || !data.data) return;
    if (!error && !isEqual(userAuthStateStable, data.data)) {
      {
        dispatch(
          userAuthSliceActions.setAuthData({
            ...data.data,
          })
        );
        queryClient.invalidateQueries({ queryKey: ["cart"] });
      }
    }

    if (error) dispatch(userAuthSliceActions.resetAuthData());
  }, [cartStateStable, data, dispatch, error, userAuthStateStable]);

  useEffect(() => {
    error && userAuthSliceActions.resetAuthData();
  }, [error]);

  useEffect(() => {
    if (!initialRender) return;
    if (isLoading) return;
    initialRender = false;
    if (userCartData || data?.data?.login || userAuthStateStable.login) return;
    const cartStateFromSessionStorage = generateCartStateFromLocalStorage();
    if (cartStateFromSessionStorage.length > 0)
      dispatch(cartSliceActions.SET_CART(cartStateFromSessionStorage));
  }, [
    searchParams,
    userCartData,
    dispatch,
    isLoading,
    data?.data?.login,
    userAuthStateStable.login,
  ]);

  return (
    <ModalContextProvider>
      <Nav />

      {children ? children : <Outlet />}

      <Footer />
      {createPortal(
        <ModalOverlay>
          <ModalContainer>
            <LoginModal />
          </ModalContainer>
        </ModalOverlay>,
        document.getElementById("modals")!
      )}
    </ModalContextProvider>
  );
};

export default RootLayout;
