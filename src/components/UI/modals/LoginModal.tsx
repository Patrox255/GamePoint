import { useCallback, useContext, useMemo, useState } from "react";

import Button from "../Button";
import { ModalContext } from "../../../store/ModalContext";
import HeaderLinkOrHeaderAnimation from "../headers/HeaderLinkOrHeaderAnimation";
import Header from "../headers/Header";
import Logo from "../Logo";
import { useMutation } from "@tanstack/react-query";
import { login, queryClient } from "../../../lib/fetch";
import CheckMarkSVG from "../svg/CheckMarkSVG";
import TimedOutActionWithProgressBar from "../TimedOutActionWithProgressBar";
import FormWithErrorHandling, {
  FormActionBackendErrorResponse,
  FormActionBackendResponse,
  FormInputFields,
} from "../FormWithErrorHandling";
import inputFieldsObjs from "../../../lib/inputFieldsObjs";

interface ILoginActionMutateArgs {
  login: string;
  password: string;
}

const inputFields: FormInputFields = [
  inputFieldsObjs.login,
  {
    ...inputFieldsObjs.password,
    otherValidationAttributes: {
      ...inputFieldsObjs.password.otherValidationAttributes,
      pattern: undefined,
    },
    instructionStr: undefined,
  },
];

export default function LoginModal() {
  const { loginModalOpen, setLoginModalOpen } = useContext(ModalContext);
  const [loginModalState, setLoginModalState] = useState<"" | "success">("");

  const { isPending, data, mutate, error, reset } = useMutation<
    FormActionBackendResponse,
    FormActionBackendErrorResponse,
    ILoginActionMutateArgs
  >({
    mutationFn: login,
    onSuccess: (data) =>
      typeof data.data !== "object" &&
      queryClient.invalidateQueries({ queryKey: ["userAuth"] }),
  });

  const onSubmitStable = useCallback(
    (formDataObj: ILoginActionMutateArgs) => {
      mutate(formDataObj);
    },
    [mutate]
  );

  function handleCloseLoginModal() {
    setLoginModalState("");
    setLoginModalOpen(false);
    reset();
  }

  const formStableActionResponse = useMemo(
    () => ({
      isPending,
      data,
      error,
    }),
    [data, error, isPending]
  );

  const actionOnLoginSuccessStable = useCallback(
    () => setLoginModalState("success"),
    []
  );

  let content = (
    <>
      <header className="w-full flex justify-center pb-9">
        <Logo widthTailwindClass="w-1/4" />
      </header>
      <FormWithErrorHandling
        onSubmit={onSubmitStable}
        queryRelatedToActionState={formStableActionResponse}
        actionIfSuccess={actionOnLoginSuccessStable}
        focusFirstField={loginModalOpen}
        inputFields={inputFields}
      >
        <HeaderLinkOrHeaderAnimation
          href="/register"
          additionalTailwindClasses="self-start"
          onClick={() => setLoginModalOpen(false)}
        >
          <Header size="small">Haven't got an account yet?</Header>
        </HeaderLinkOrHeaderAnimation>
        <div className="form-controls pt-6 w-full flex justify-between">
          <Button type="button" onClick={() => setLoginModalOpen(false)}>
            Close
          </Button>
          <Button>{isPending ? "Logging in..." : "Log in"}</Button>
        </div>
      </FormWithErrorHandling>
    </>
  );

  if (loginModalState === "success")
    content = (
      <>
        <CheckMarkSVG additionalTailwindClasses="w-48" />
        <Header size="large" colorTailwindClass="text-highlightGreen">
          Successfully logged in!
        </Header>
        <Button onClick={handleCloseLoginModal}>Close</Button>
        <TimedOutActionWithProgressBar
          action={handleCloseLoginModal}
          timeBeforeFiringAnAction={3000}
        />
      </>
    );

  return (
    loginModalOpen && (
      <div
        className={`modal-login w-full self-stretch flex justify-center items-center flex-col text-defaultFont py-9 ${
          loginModalState === "success" ? "gap-3" : ""
        }`}
      >
        {content}
      </div>
    )
  );
}
