import { createContext } from "react";
import { RegisterPageFormControls } from "../../pages/RegisterPage";
import Button from "../UI/Button";
import RegisterFormContent, {
  IInputFieldsDefaultValues,
} from "./RegisterFormContent";
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
}: props & { showGoBackBtn?: boolean }) {
  return (
    <ContactInformationFormContentContext.Provider
      value={{ defaultValuesObj, goBackBtnClickHandler, submitBtnText }}
    >
      <RegisterFormContent>
        {(inputFieldsObjs) => (
          <InputFieldElement inputFieldObjFromProps={inputFieldsObjs.email} />
        )}
      </RegisterFormContent>
      <RegisterPageFormControls>
        {showGoBackBtn && <Button type="button">Go back</Button>}
      </RegisterPageFormControls>
    </ContactInformationFormContentContext.Provider>
  );
}
