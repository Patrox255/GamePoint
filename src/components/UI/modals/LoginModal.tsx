import { FormEvent, useContext, useEffect, useRef, useState } from "react";

import Input from "../Input";
import Button from "../Button";
import { ModalContext } from "../../../store/ModalContext";
import HeaderLinkOrHeaderAnimation from "../headers/HeaderLinkOrHeaderAnimation";
import Header from "../headers/Header";
import Logo from "../Logo";
import { useMutation } from "@tanstack/react-query";
import { login, queryClient } from "../../../lib/fetch";
import LoadingFallback from "../LoadingFallback";
import Error from "../Error";
import CheckMarkSVG from "../svg/CheckMarkSVG";
import TimedOutActionWithProgressBar from "../TimedOutActionWithProgressBar";

type ValidationErrorsArr = { message: string; errInputName: string }[];

const generateValidationErrorsRelatedToAnInput = (
  errorsRelatedToValidationArr: ValidationErrorsArr | undefined,
  inputName: string
) => {
  return (
    errorsRelatedToValidationArr &&
    errorsRelatedToValidationArr
      .filter(
        (errorRelatedToValidation) =>
          errorRelatedToValidation.errInputName === inputName
      )
      .map((errorRelatedToValidation) => (
        <Error
          smallVersion
          message={errorRelatedToValidation.message}
          key={`${errorRelatedToValidation.errInputName}-${errorRelatedToValidation.message}`}
        />
      ))
  );
};

export default function LoginModal() {
  const { loginModalOpen, setLoginModalOpen } = useContext(ModalContext);
  const [loginModalState, setLoginModalState] = useState<"" | "success">("");
  const loginRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loginModalOpen && loginRef.current?.focus();
  }, [loginModalOpen]);

  const { isPending, data, mutate, error } = useMutation<
    { data: string } | { data: { message: string } },
    Error | ValidationErrorsArr,
    { login: string; password: string }
  >({
    mutationFn: login,
    onSuccess: (data) =>
      typeof data.data !== "object" &&
      queryClient.invalidateQueries({ queryKey: ["userAuth"] }),
  });

  function handleFormSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formDataObj = Object.fromEntries(new FormData(e.currentTarget)) as {
      login: string;
      password: string;
    };
    mutate(formDataObj);
  }

  function handleCloseLoginModal() {
    setLoginModalState("");
    setLoginModalOpen(false);
  }

  const hasErrorRelatedToWrongUserData =
    data && data.data && (data.data as { message?: string }).message;
  const errorsRelatedToValidation =
    error && (error as ValidationErrorsArr).length > 0
      ? (error as ValidationErrorsArr)
      : undefined;
  useEffect(() => {
    if (hasErrorRelatedToWrongUserData) return;
    if (errorsRelatedToValidation) return;
    if (data && data.data) setLoginModalState("success");
  }, [
    data,
    errorsRelatedToValidation,
    hasErrorRelatedToWrongUserData,
    setLoginModalOpen,
  ]);

  let content = (
    <>
      <header className="w-full flex justify-center pb-9">
        <Logo widthTailwindClass="w-1/4" />
      </header>
      <form
        className="login-form w-3/4 h-full flex flex-col justify-center items-center gap-3"
        method="post"
        action=""
        onSubmit={handleFormSubmit}
      >
        <Input
          placeholder="Enter your account login"
          ref={loginRef}
          belongToFormElement
          otherValidationInputAttributes={{ required: true }}
          name="login"
        />
        {generateValidationErrorsRelatedToAnInput(
          errorsRelatedToValidation,
          "login"
        )}
        <Input
          placeholder="Enter your account password"
          type="password"
          // otherValidationInputAttributes={{ required: true }}
          belongToFormElement
          name="password"
        />
        {generateValidationErrorsRelatedToAnInput(
          errorsRelatedToValidation,
          "password"
        )}
        <HeaderLinkOrHeaderAnimation
          href="/register"
          additionalTailwindClasses="self-start"
        >
          <Header size="small">Haven't got an account yet?</Header>
        </HeaderLinkOrHeaderAnimation>
        <div className="form-controls pt-6 w-full flex justify-between">
          <Button type="button" onClick={() => setLoginModalOpen(false)}>
            Close
          </Button>
          <Button>{isPending ? "Logging in..." : "Log in"}</Button>
        </div>
        <div className="form-additional-information">
          {isPending && <LoadingFallback />}
          {hasErrorRelatedToWrongUserData && (
            <Error
              message={(data.data as { message: string }).message}
              smallVersion
            />
          )}
        </div>
      </form>
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
    <div
      className={`modal-login w-full self-stretch flex justify-center items-center flex-col text-defaultFont py-9 ${
        loginModalState === "success" ? "gap-3" : ""
      }`}
    >
      {content}
    </div>
  );
}
