import { useMutation } from "@tanstack/react-query";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import MainWrapper from "../components/structure/MainWrapper";
import FormWithErrorHandling, {
  FormActionBackendErrorResponse,
  FormActionBackendResponse,
  FormWithErrorHandlingContext,
} from "../components/UI/FormWithErrorHandling";
import { register } from "../lib/fetch";
import inputFieldsObjs from "../lib/inputFieldsObjs";
import Button from "../components/UI/Button";
import InputFieldElement from "../components/UI/InputFieldElement";
import generateUrlEndpointWithSearchParams from "../helpers/generateUrlEndpointWithSearchParams";
import { ContactInformationFormContentContext } from "../components/formRelated/ContactInformationFormContent";
import ContactInformationFormInputFieldsContent from "../components/formRelated/ContactInformationFormInputFieldsContent";
import useCreateHelperFunctionsRelatedToNotificationManagement from "../hooks/notificationSystemRelated/useCreateHelperFunctionsRelatedToNotificationManagement";

type registerPageFormControlsShowNotificationUponResettingFieldsContentContextBody =
  () => void;
const RegisterPageFormControlsShowNotificationUponResettingFieldsContentContext =
  createContext<registerPageFormControlsShowNotificationUponResettingFieldsContentContextBody>(
    () => {}
  );
export const RegisterPageFormControlsShowNotificationUponResettingFieldsContentContextProvider =
  ({
    ctxBody,
    children,
  }: {
    ctxBody: registerPageFormControlsShowNotificationUponResettingFieldsContentContextBody;
    children?: ReactNode;
  }) => (
    <RegisterPageFormControlsShowNotificationUponResettingFieldsContentContext.Provider
      value={ctxBody}
    >
      {children}
    </RegisterPageFormControlsShowNotificationUponResettingFieldsContentContext.Provider>
  );

export const RegisterPageFormControls = ({
  additionalResetClickAction,
  submitBtnTextFromProps = "Register",
  children,
  isOnRegisterPage = false,
}: {
  additionalResetClickAction?: () => void;
  submitBtnTextFromProps?: string;
  children?: ReactNode;
  isOnRegisterPage?: boolean; // Despite the name of the component this isn't really obvious as this component is also used on
  // admin user management page when editing one's contact information and there I placed 3 buttons and I just want them to be centered
}) => {
  const { isPending } = useContext(FormWithErrorHandlingContext);
  const submitBtnText =
    useContext(ContactInformationFormContentContext).submitBtnText ||
    submitBtnTextFromProps;
  const registerPageFormControlsShowNotificationUponResettingFieldsContent =
    useContext(
      RegisterPageFormControlsShowNotificationUponResettingFieldsContentContext
    );

  return (
    <div
      className={`form-controls flex gap-3 ${
        isOnRegisterPage ? "justify-between" : "justify-center"
      } w-full py-6 flex-wrap items-center`}
    >
      {children}
      <Button
        type="reset"
        onClick={() => {
          additionalResetClickAction?.();
          registerPageFormControlsShowNotificationUponResettingFieldsContent?.();
        }}
        alternateTailwindClassesForBiggerFont
      >
        Reset fields
      </Button>
      <Button disabled={isPending} alternateTailwindClassesForBiggerFont>
        {isPending ? "Submitting..." : submitBtnText}
      </Button>
    </div>
  );
};

export interface IActionMutateArgsContact {
  firstName: string;
  surName: string;
  dateOfBirth: string;
  phoneNr: string;
  country: string;
  zipCode: string;
  city: string;
  street: string;
  house: string;
  flat?: string;
}

export interface IActionMutateArgsRegister extends IActionMutateArgsContact {
  login: string;
  password: string;
  confirmedPassword: string;
  email: string;
}

const registerInputFields = [
  inputFieldsObjs.login,
  inputFieldsObjs.password,
  inputFieldsObjs.confirmedPassword,
  inputFieldsObjs.email,
].map((inputFieldObj) => ({ ...inputFieldObj, renderLabel: true }));

type registerFormActionBackendResponseData = {
  registrationCode: string;
  uId: string;
};

export default function RegisterPage() {
  const {
    generateSuccessNotificationStable,
    generateErrorNotificationInCaseOfQueryErrStable,
    generateLoadingInformationNotificationStable,
  } =
    useCreateHelperFunctionsRelatedToNotificationManagement(
      "registerAnAccount"
    );
  const { mutate, error, data, isPending } = useMutation<
    FormActionBackendResponse<registerFormActionBackendResponseData>,
    FormActionBackendErrorResponse,
    IActionMutateArgsRegister
  >({
    mutationFn: register,
    onMutate: () =>
      generateLoadingInformationNotificationStable("default", {
        text: "Registering an account...",
      }),
    onError: (e) => generateErrorNotificationInCaseOfQueryErrStable(e),
    onSuccess: (data) => {
      if (generateErrorNotificationInCaseOfQueryErrStable(data?.data)) return;
      generateSuccessNotificationStable("default", {
        text: "Registered the account!",
      });
    },
  });

  const queryRelatedToActionStateStable = useMemo(
    () => ({
      error,
      data,
      isPending,
    }),
    [data, error, isPending]
  );

  const handleFormSubmit = useCallback(
    (formDataObj: IActionMutateArgsRegister) => {
      mutate(formDataObj);
    },
    [mutate]
  );

  const [expandedContactInformation, setExpandedContactInformation] =
    useState<boolean>(false);

  const navigate = useNavigate();
  function handleRegisterSuccess() {
    const {
      data: { registrationCode, uId },
    } = data as { data: registerFormActionBackendResponseData };
    navigate(
      generateUrlEndpointWithSearchParams("/verify-email", {
        registrationCode,
        uId,
      }),
      { replace: true }
    );
  }

  const handleFormReset = useCallback(
    () => setExpandedContactInformation(false),
    []
  );

  return (
    <MainWrapper>
      <FormWithErrorHandling
        onSubmit={handleFormSubmit}
        queryRelatedToActionState={queryRelatedToActionStateStable}
        inputFields={registerInputFields}
        actionIfSuccess={handleRegisterSuccess}
      >
        <InputFieldElement
          inputFieldObjFromProps={inputFieldsObjs.expandedContactInformation}
          onChangeCheckbox={setExpandedContactInformation}
          checkedCheckbox={expandedContactInformation}
        />
        {expandedContactInformation && (
          <ContactInformationFormInputFieldsContent />
        )}
        <RegisterPageFormControls
          additionalResetClickAction={handleFormReset}
          isOnRegisterPage
        />
      </FormWithErrorHandling>
    </MainWrapper>
  );
}
