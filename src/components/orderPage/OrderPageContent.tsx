import { useMutation } from "@tanstack/react-query";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import FormWithErrorHandling, {
  FormActionBackendErrorResponse,
} from "../UI/FormWithErrorHandling";
import ContactInformationFormContent from "../formRelated/ContactInformationFormContent";
import {
  IOrderResponseFromFetchFn,
  IOrderResponseGuest,
  IOrderResponseLoggedUser,
  IPlaceAnOrderDataObject,
  placeAnOrder,
  queryClient,
  validateContactInformationFromGuestOrder,
} from "../../lib/fetch";
import { IActionMutateArgsContact } from "../../pages/RegisterPage";
import OrderPageHeader from "./OrderPageHeader";
import useRetrieveContactInformation from "../../hooks/accountRelated/useRetrieveContactInformation";
import OrderUserContactCustomization from "./OrderUserContactCustomization";
import { OrderUserContactCustomizationContext } from "../../store/orderPage/OrderUserContactCustomizationContext";
import { OrderSummaryContentContext } from "../../store/orderPage/OrderSummaryContentContext";
import useCompareComplexForUseMemo from "../../hooks/useCompareComplexForUseMemo";
import { createDateObjBasedOnDatePickerInputValue } from "../UI/DatePickerInputFieldElement";
import {
  IAdditionalContactInformation,
  IAdditionalContactInformationFrontEnd,
} from "../../models/additionalContactInformation.model";
import { IInputFieldsDefaultValues } from "../formRelated/RegisterFormContent";
import OrderSummary from "./OrderSummary";
import LoadingFallback from "../UI/LoadingFallback";
import { IGameWithQuantityBasedOnCartDetailsEntry } from "../../helpers/generateGamesWithQuantityOutOfCartDetailsEntries";
import transformObjPropertiesFromDateToAppropriateStringForBackend from "../../helpers/transformObjPropertyFromDateToAppropriateStringForBackend";
import navigatePaths from "../../helpers/navigatePaths";
import TimedOutActionWithProgressBar from "../UI/TimedOutActionWithProgressBar";
import { useAppDispatch, useAppSelector } from "../../hooks/reduxStore";
import { cartSliceActions } from "../../store/cartSlice";
import { OrderPageContentIsLoggedContext } from "../../store/orderPage/OrderPageContentIsLoggedContext";
import NewOrderSummaryContextProvider from "../../store/orderPage/NewOrderSummaryContext";

export type IAdditionalContactInformationFromGuestOrder =
  IActionMutateArgsContact & { email: string };

export default function OrderPageContent() {
  const navigate = useNavigate();
  const isLogged = useContext(OrderPageContentIsLoggedContext);

  const [
    contactInformationFromFormToProvide,
    setContactInformationFromFormToProvide,
  ] = useState<
    (IAdditionalContactInformationFrontEnd & { email: string }) | undefined
  >();
  const [orderStepState, setOrderStepState] = useState<
    "form" | "contact-customization" | "summary"
  >(isLogged ? "contact-customization" : "form");

  const {
    data: validateContactInformationData,
    error: validateContactInformationError,
    isPending: validateContactInformationIsPending,
    mutate: validateContactInformationMutate,
  } = useMutation({
    mutationFn: validateContactInformationFromGuestOrder,
    onSuccess: (_, formData) => {
      setContactInformationFromFormToProvide({
        ...formData,
        dateOfBirth: createDateObjBasedOnDatePickerInputValue(
          formData.dateOfBirth
        ),
      });
      setOrderStepState("summary");
    },
  });

  let content;

  const [
    curSelectedContactInformationOverviewId,
    setCurSelectedContactInformationOverviewId,
  ] = useState("");
  const handleSelectContactInformation = useCallback(
    () => setOrderStepState("summary"),
    []
  );
  const {
    data: contactInformationData,
    error: contactInformationError,
    isLoading: contactInformationIsLoading,
    contactInformationArr,
  } = useRetrieveContactInformation();
  const curUserActiveContactInformationId =
    contactInformationData?.data.activeAdditionalContactInformation || "";
  const selectedUserContactInformation = useMemo(
    () =>
      curSelectedContactInformationOverviewId === ""
        ? undefined
        : contactInformationArr?.find(
            (contactInformationArrEntry) =>
              contactInformationArrEntry._id ===
              curSelectedContactInformationOverviewId
          ),
    [contactInformationArr, curSelectedContactInformationOverviewId]
  );
  const contactInformationFromFormToProvideStable = useCompareComplexForUseMemo(
    contactInformationFromFormToProvide
  );
  const handleGoBackFromSummarySection = useCallback(
    () => setOrderStepState(isLogged ? "contact-customization" : "form"),
    [isLogged]
  );

  const {
    mutate: placeAnOrderMutate,
    data: placeAnOrderData,
    error: placeAnOrderError,
    isPending: placeAnOrderIsPending,
  } = useMutation<
    IOrderResponseFromFetchFn,
    FormActionBackendErrorResponse,
    IPlaceAnOrderDataObject
  >({
    mutationFn: placeAnOrder,
  });

  const dispatch = useAppDispatch();

  const orderPlacedSuccessfully =
    placeAnOrderData?.data &&
    (placeAnOrderData.data as IOrderResponseGuest | IOrderResponseLoggedUser)
      .savedOrderId
      ? true
      : false;

  const handleRedirectUponSuccessfulOrder = useCallback(() => {
    const actionUponSuccessFn = async () => {
      navigate(navigatePaths.userOrders, { replace: true });
      dispatch(cartSliceActions.SET_CART([]));
      await queryClient.invalidateQueries({ queryKey: ["cart"] });
    };

    actionUponSuccessFn();
  }, [dispatch, navigate]);

  const handlePlaceAnOrder = useCallback(
    (orderedGamesDetails: IGameWithQuantityBasedOnCartDetailsEntry[]) => {
      const datePropertiesArrToTransform = ["dateOfBirth"];
      placeAnOrderMutate({
        ...(contactInformationFromFormToProvideStable
          ? {
              contactInformationForGuests:
                transformObjPropertiesFromDateToAppropriateStringForBackend(
                  contactInformationFromFormToProvideStable,
                  datePropertiesArrToTransform as (keyof IAdditionalContactInformationFrontEnd)[]
                ),
            }
          : {
              contactInformationForLoggedUsers:
                transformObjPropertiesFromDateToAppropriateStringForBackend(
                  selectedUserContactInformation!,
                  datePropertiesArrToTransform as (keyof IAdditionalContactInformation)[]
                ),
            }),
        orderedGamesDetails,
      });
    },
    [
      contactInformationFromFormToProvideStable,
      placeAnOrderMutate,
      selectedUserContactInformation,
    ]
  );

  const cart = useAppSelector((state) => state.cartSlice.cart);

  useEffect(() => {
    if (cart && cart.length === 0 && !orderPlacedSuccessfully)
      navigate("/cart", { replace: true });
  }, [cart, navigate, orderPlacedSuccessfully]);

  if (orderStepState === "contact-customization")
    content = (
      <OrderUserContactCustomizationContext.Provider
        value={{
          curSelectedContactInformationOverviewId,
          setCurSelectedContactInformationOverviewId,
        }}
      >
        <OrderPageHeader>
          Select the contact details for Your order
        </OrderPageHeader>
        {contactInformationIsLoading && <LoadingFallback />}
        {!contactInformationIsLoading && (
          <OrderUserContactCustomization
            handleSelectContactInformation={handleSelectContactInformation}
            contactInformationArr={contactInformationArr}
            contactInformationError={contactInformationError}
            curUserActiveContactInformationId={
              curUserActiveContactInformationId
            }
          />
        )}
      </OrderUserContactCustomizationContext.Provider>
    );
  if (orderStepState === "form")
    content = (
      <>
        <OrderPageHeader>Enter your contact details</OrderPageHeader>
        <FormWithErrorHandling
          queryRelatedToActionState={{
            data: validateContactInformationData,
            error: validateContactInformationError,
            isPending: validateContactInformationIsPending,
          }}
          onSubmit={validateContactInformationMutate}
        >
          <ContactInformationFormContent
            submitBtnText="Proceed"
            showGoBackBtn={false}
            defaultValuesObj={
              contactInformationFromFormToProvideStable as unknown as IInputFieldsDefaultValues
            }
          />
        </FormWithErrorHandling>
      </>
    );

  if (orderStepState === "summary")
    content = (
      <OrderSummaryContentContext.Provider
        value={{
          contactInformationToRender:
            (selectedUserContactInformation as unknown as IActionMutateArgsContact) ||
            contactInformationFromFormToProvideStable,
          serveAsPlacingOrderSummary: true,
        }}
      >
        <NewOrderSummaryContextProvider
          handlePlaceAnOrder={handlePlaceAnOrder}
          orderPlacedSuccessfully={orderPlacedSuccessfully}
          placeAnOrderData={placeAnOrderData}
          placeAnOrderError={placeAnOrderError}
          placeAnOrderIsPending={placeAnOrderIsPending}
        >
          <OrderSummary handleGoBack={handleGoBackFromSummarySection} />
        </NewOrderSummaryContextProvider>
      </OrderSummaryContentContext.Provider>
    );

  return (
    <article className="order-page-content-wrapper flex flex-col w-full px-4 justify-center items-center">
      {content}
      {orderPlacedSuccessfully && (
        <TimedOutActionWithProgressBar
          timeBeforeFiringAnAction={5000}
          action={handleRedirectUponSuccessfulOrder}
        />
      )}
    </article>
  );
}
