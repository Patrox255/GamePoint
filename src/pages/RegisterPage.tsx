import { useMutation } from "@tanstack/react-query";
import { ReactNode, useCallback, useContext, useMemo, useState } from "react";
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
import RegisterFormContent from "../components/formRelated/RegisterFormContent";
import { ContactInformationFormContentContext } from "../components/formRelated/ContactInformationFormContent";

export const RegisterPageFormControls = ({
  additionalResetClickAction,
  submitBtnTextFromProps = "Register",
  children,
}: {
  additionalResetClickAction?: () => void;
  submitBtnTextFromProps?: string;
  children?: ReactNode;
}) => {
  const { isPending } = useContext(FormWithErrorHandlingContext);
  const submitBtnText =
    useContext(ContactInformationFormContentContext).submitBtnText ||
    submitBtnTextFromProps;

  return (
    <div className="form-controls flex gap-3 justify-between w-full py-6">
      {children}
      <Button type="reset" onClick={additionalResetClickAction}>
        Reset fields
      </Button>
      <Button disabled={isPending}>
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
  const { mutate, error, data, isPending } = useMutation<
    FormActionBackendResponse<registerFormActionBackendResponseData>,
    FormActionBackendErrorResponse,
    IActionMutateArgsRegister
  >({
    mutationFn: register,
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
        {expandedContactInformation && <RegisterFormContent />}
        <RegisterPageFormControls
          additionalResetClickAction={handleFormReset}
        />
      </FormWithErrorHandling>
    </MainWrapper>
  );
}
