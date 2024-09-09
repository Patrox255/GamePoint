import { createContext } from "react";
import { RegisterPageFormControls } from "../../pages/RegisterPage";
import Button from "../UI/Button";
import ContactInformationFormInputFieldsContent, {
  IInputFieldsDefaultValues,
} from "./ContactInformationFormInputFieldsContent";
import InputFieldElement from "../UI/InputFieldElement";

export const ContactInformationFormContentContext = createContext<props>({});

type props = {
  defaultValuesObj?: IInputFieldsDefaultValues;
  submitBtnText?: string;
  goBackBtnClickHandler?: () => void;
};

export default function ContactInformationFormContent({
  defaultValuesObj,
  goBackBtnClickHandler,
  submitBtnText,
  showGoBackBtn = true,
  includeGuestEmailField = false,
}: props & { showGoBackBtn?: boolean; includeGuestEmailField?: boolean }) {
  return (
    <ContactInformationFormContentContext.Provider
      value={{ defaultValuesObj, goBackBtnClickHandler, submitBtnText }}
    >
      <ContactInformationFormInputFieldsContent>
        {includeGuestEmailField
          ? (inputFieldsObjs) => (
              <InputFieldElement
                inputFieldObjFromProps={{
                  ...inputFieldsObjs.email,
                  placeholder:
                    "Enter e-mail address which will be assigned to this order and You will receive appropriate order information there",
                }}
              />
            )
          : undefined}
      </ContactInformationFormInputFieldsContent>
      <RegisterPageFormControls>
        {showGoBackBtn && (
          <Button type="button" onClick={goBackBtnClickHandler}>
            Go back
          </Button>
        )}
      </RegisterPageFormControls>
    </ContactInformationFormContentContext.Provider>
  );
}
