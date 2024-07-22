import { useMutation } from "@tanstack/react-query";
import MainWrapper from "../components/structure/MainWrapper";
import FormWithErrorHandling, {
  FormActionBackendErrorResponse,
  FormActionBackendResponse,
} from "../components/UI/FormWithErrorHandling";
import { register } from "../lib/fetch";
import { useCallback, useMemo } from "react";

interface IActionMutateArgs {
  login: string;
  password: string;
  confirmedPassword: string;
  email: string;
}

export default function RegisterPage() {
  const { mutate, error, data, isPending } = useMutation<
    FormActionBackendResponse,
    FormActionBackendErrorResponse,
    IActionMutateArgs
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
    (formDataObj: IActionMutateArgs) => {
      mutate(formDataObj);
    },
    [mutate]
  );

  return (
    <MainWrapper>
      <FormWithErrorHandling
        onSubmit={handleFormSubmit}
        queryRelatedToActionState={queryRelatedToActionStateStable}
      ></FormWithErrorHandling>
    </MainWrapper>
  );
}
