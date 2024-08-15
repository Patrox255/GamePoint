/* eslint-disable react-refresh/only-export-components */
import { Outlet, useLocation } from "react-router-dom";
import { ReactNode, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";

import Nav from "../components/UI/Nav";
import Footer from "../components/UI/Footer";
import LoginModal from "../components/UI/modals/LoginModal";
import ModalContextProvider from "../store/ModalContext";
import ModalContainer from "../components/UI/modals/ModalContainer";
import ModalOverlay from "../components/UI/modals/ModalOverlay";
import { getAuthData, getCart, queryClient } from "../lib/fetch";
import { useAppDispatch, useAppSelector } from "../hooks/reduxStore";
import { userAuthSliceActions } from "../store/userAuthSlice";
import { isEqual } from "lodash";
import useCompareComplexForUseMemo from "../hooks/useCompareComplexForUseMemo";
import { cartSliceActions } from "../store/cartSlice";
import generateInitialStateFromSearchParamsOrSessionStorage from "../helpers/generateInitialStateFromSearchParamsOrSessionStorage";
import filterPropertiesFromObj from "../helpers/filterPropertiesFromObj";

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
  const userAuthStateStableToCompareWithAuthRespones =
    useCompareComplexForUseMemo(
      filterPropertiesFromObj(userAuthStateStable, ["isLoading"])
    );
  const { data, error, isLoading } = useQuery({
    queryKey: ["userAuth", pathname],
    queryFn: ({ signal }) => getAuthData(signal),
    retry: false,
  });

  const cartSlice = useAppSelector((state) => state.cartSlice);
  const { optimisticUpdatingInProgress } = cartSlice;
  const cartStateStable = useCompareComplexForUseMemo(cartSlice.cart);
  const { data: cartData, isLoading: userCartDataIsLoading } = useQuery({
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
    if (
      !error &&
      !isEqual(userAuthStateStableToCompareWithAuthRespones, data.data)
    ) {
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
  }, [
    cartStateStable,
    data,
    dispatch,
    error,
    userAuthStateStableToCompareWithAuthRespones,
  ]);

  useEffect(() => {
    error && dispatch(userAuthSliceActions.resetAuthData());
  }, [error, dispatch]);

  useEffect(() => {
    userAuthStateStable.isLoading !== isLoading &&
      dispatch(userAuthSliceActions.setIsFetching(isLoading));
  }, [dispatch, isLoading, userAuthStateStable.isLoading]);

  useEffect(() => {
    if (!initialRender) return;
    if (isLoading || userCartDataIsLoading) return;
    initialRender = false;
    if (userCartData || data?.data?.login || userAuthStateStable.login) return;
    const cartStateFromLocalStorage = generateCartStateFromLocalStorage();
    dispatch(cartSliceActions.SET_CART(cartStateFromLocalStorage));
  }, [
    searchParams,
    userCartData,
    dispatch,
    data?.data?.login,
    userAuthStateStable.login,
    isLoading,
    cartStateStable,
    userCartDataIsLoading,
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
