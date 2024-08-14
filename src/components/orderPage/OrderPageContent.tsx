import { useMutation } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

import FormWithErrorHandling from "../UI/FormWithErrorHandling";
import ContactInformationFormContent from "../formRelated/ContactInformationFormContent";
import { validateContactInformationFormData } from "../../lib/fetch";
import { IActionMutateArgsContact } from "../../pages/RegisterPage";
import OrderPageHeader from "./OrderPageHeader";
import useRetrieveContactInformation from "../../hooks/accountRelated/useRetrieveContactInformation";
import OrderUserContactCustomization from "./OrderUserContactCustomization";
import { OrderUserContactCustomizationContext } from "../../store/orderPage/OrderUserContactCustomizationContext";
import { OrderSummaryContentContext } from "../../store/orderPage/OrderSummaryContext";
import useCompareComplexForUseMemo from "../../hooks/useCompareComplexForUseMemo";
import { createDateObjBasedOnDatePickerInputValue } from "../UI/DatePickerInputFieldElement";
import { IAdditionalContactInformationFrontEnd } from "../../models/additionalContactInformation.model";
import { IInputFieldsDefaultValues } from "../formRelated/RegisterFormContent";
import OrderSummary from "./OrderSummary";
import LoadingFallback from "../UI/LoadingFallback";

export default function OrderPageContent({ isLogged }: { isLogged: boolean }) {
  const [
    contactInformationFromFormToProvide,
    setContactInformationFromFormToProvide,
  ] = useState<IAdditionalContactInformationFrontEnd | undefined>();
  const [orderStepState, setOrderStepState] = useState<
    "form" | "contact-customization" | "summary"
  >(isLogged ? "contact-customization" : "form");
  console.log(contactInformationFromFormToProvide);

  const {
    data: validateContactInformationData,
    error: validateContactInformationError,
    isPending: validateContactInformationIsPending,
    mutate: validateContactInformationMutate,
  } = useMutation({
    mutationFn: validateContactInformationFormData,
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
  } = useRetrieveContactInformation();
  const contactInformationArr = useMemo(
    () => contactInformationData?.data.additionalContactInformation,
    [contactInformationData]
  );
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
        }}
      >
        <OrderSummary handleGoBack={handleGoBackFromSummarySection} />
      </OrderSummaryContentContext.Provider>
    );

  return (
    <article className="order-page-content-wrapper flex flex-col w-full px-4 justify-center items-center">
      {content}
    </article>
  );
}
