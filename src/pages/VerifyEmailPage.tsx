/* eslint-disable react-refresh/only-export-components */
import {
  ActionFunction,
  Form,
  json,
  LoaderFunction,
  useActionData,
  useLoaderData,
  useNavigate,
} from "react-router-dom";

import MainWrapper from "../components/structure/MainWrapper";
import Header from "../components/UI/headers/Header";
import Input from "../components/UI/Input";
import Button from "../components/UI/Button";
import { queryClient, verifyEmail, verifyEmailGuard } from "../lib/fetch";
import createSearchParamsFromRequestURL from "../helpers/createSearchParamsFromRequestURL";
import { validateJSONValue } from "../helpers/generateInitialStateFromSearchParamsOrSessionStorage";
import { IInputFieldValidationError } from "../components/UI/InputFieldElement";
import Error from "../components/UI/Error";
import TimedOutActionWithProgressBar from "../components/UI/TimedOutActionWithProgressBar";
import { useEffect, useMemo } from "react";
import { useAppSelector } from "../hooks/reduxStore";
import useCompareComplexForUseMemo from "../hooks/useCompareComplexForUseMemo";
import { cartStateArr } from "../store/cartSlice";

export default function VerifyEmailPage() {
  const actionData = useActionData() as
    | Error[]
    | string
    | IInputFieldValidationError[]
    | undefined;

  const errorOccured = actionData && Array.isArray(actionData);
  const verificationSuccess =
    actionData && typeof actionData === "string" && actionData === "success";
  const navigate = useNavigate();
  const loaderData = useLoaderData() as "redirect" | null;
  const cart = useAppSelector((state) => state.cartSlice.cart);
  const cartStable = useCompareComplexForUseMemo(cart);
  const cartValueToSend = useMemo(
    () => JSON.stringify(cartStable),
    [cartStable]
  );

  useEffect(() => {
    loaderData === "redirect" &&
      !verificationSuccess &&
      navigate("/", { replace: true });
  }, [loaderData, navigate, verificationSuccess]);

  return (
    <MainWrapper>
      <article className="verify-email-content-wrapper flex items-center flex-col text-center px-4 py-4 w-full">
        <Header size="large">
          Your account has been successfully created!
        </Header>
        <p>
          Now in order to finish the registration process You have to verfiy
          your account by providing the code which we sent to your e-mail
          address.
        </p>
        <Form
          className="mt-6 flex items-center flex-col gap-6 w-full justify-center pb-6"
          method="POST"
        >
          <Input
            otherValidationInputAttributes={{ minLength: 6, required: true }}
            name="registrationCode"
            width="w-1/4"
            belongToFormElement
          ></Input>
          <Button disabled={verificationSuccess === true}>
            Complete Registration
          </Button>
          <p className="w-1/2 text-center">
            Since e-mail verification services do not really share their
            functionalities only for personal use then just for testing purposes
            the registration code was sent from the server and it is available
            as one of the search params in the URL
          </p>
          {cartStable && (
            <input hidden readOnly value={cartValueToSend} name="cartData" />
          )}
        </Form>
        {errorOccured &&
          actionData.map((actionDataError) => (
            <Error
              message={actionDataError.message}
              key={actionDataError.message}
              showDetails={false}
            />
          ))}
        {verificationSuccess && (
          <>
            <Header>Verification went successfully!</Header>
            <p>
              Now you will be redirected to the main page in 3 seconds and
              automatically logged into your account
            </p>
            <TimedOutActionWithProgressBar
              timeBeforeFiringAnAction={3000}
              action={() => navigate("/", { replace: true })}
            />
          </>
        )}
      </article>
    </MainWrapper>
  );
}

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const searchParams = createSearchParamsFromRequestURL(request.url);
    if (!searchParams) throw "";
    const [registrationCode, uId] = [
      validateJSONValue(searchParams.get("registrationCode"), ""),
      validateJSONValue(searchParams.get("uId"), ""),
    ];
    if (!registrationCode || !uId) throw "";
    await queryClient.fetchQuery({
      queryKey: ["verify-email", uId, registrationCode],
      queryFn: ({ signal, queryKey }) =>
        verifyEmailGuard(signal, ...(queryKey.slice(1) as [string, string])),
    });
  } catch (e) {
    return "redirect";
  }
  return null;
};

export const action: ActionFunction = async ({ request }) => {
  let providedRegistrationCode: string;
  let uId: string;
  let registrationCode: string;
  let cartData: cartStateArr;
  try {
    const searchParams = createSearchParamsFromRequestURL(request.url)!;
    const formData = await request.formData();
    providedRegistrationCode = formData.get("registrationCode") as string;
    [uId, registrationCode, cartData] = [
      validateJSONValue(searchParams.get("uId"), ""),
      validateJSONValue(searchParams.get("registrationCode"), ""),
      validateJSONValue(formData.get("cartData") as string | null, []),
    ];
  } catch (e) {
    return json([e]);
  }
  try {
    const { data } = await verifyEmail({
      uId,
      providedRegistrationCode,
      registrationCode,
      cartDataToSetNewUserCartTo: cartData,
    });
    if (typeof data === "object") throw data;
  } catch (e) {
    if (Array.isArray(e)) return json(e);
    else return json([e]);
  }
  return json("success");
};
