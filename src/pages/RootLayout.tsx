import { Outlet, useLocation } from "react-router-dom";
import { ReactNode, useEffect } from "react";
import Nav from "../components/UI/Nav";
import Footer from "../components/UI/Footer";
import { createPortal } from "react-dom";
import LoginModal from "../components/UI/modals/LoginModal";
import ModalContextProvider from "../store/ModalContext";
import ModalContainer from "../components/UI/modals/ModalContainer";
import ModalOverlay from "../components/UI/modals/ModalOverlay";
import { getAuthData } from "../lib/fetch";
import { useQuery } from "@tanstack/react-query";
import { useAppDispatch, useAppSelector } from "../hooks/reduxStore";
import { userAuthSliceActions } from "../store/userAuthSlice";
import { isEqual } from "lodash";
import useCompareComplexForUseMemo from "../hooks/useCompareComplexForUseMemo";

const RootLayout = ({ children }: { children?: ReactNode }) => {
  const { pathname } = useLocation();
  const { data, error } = useQuery({
    queryKey: ["userAuth", pathname],
    queryFn: ({ signal }) => getAuthData(signal),
    retry: false,
  });
  const dispatch = useAppDispatch();
  const userAuthStateStable = useCompareComplexForUseMemo(
    useAppSelector((state) => state.userAuthSlice)
  );

  useEffect(() => {
    if (data && data.data && !isEqual(userAuthStateStable, data.data)) {
      console.log(data.data);
      dispatch(
        userAuthSliceActions.setAuthData({
          ...data.data,
        })
      );
    }
    if (error) dispatch(userAuthSliceActions.resetAuthData());
  }, [data, dispatch, error, userAuthStateStable]);

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
