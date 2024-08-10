import { createContext, useCallback, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLoaderData } from "react-router-dom";

import {
  IActionMutateArgsContact,
  RegisterPageFormControls,
} from "../../pages/RegisterPage";
import RegisterFormContent from "../formRelated/RegisterFormContent";
import FormWithErrorHandling, {
  FormActionBackendErrorResponse,
  FormActionBackendResponse,
} from "../UI/FormWithErrorHandling";
import {
  changeUserActiveAdditionalInformation,
  IRetrievedContactInformation,
  manageContactInformation,
  queryClient,
  retrieveContactInformation,
} from "../../lib/fetch";
import { IUserPanelLoaderData } from "../../pages/UserPanelPage";
import Header from "../UI/headers/Header";
import LoadingFallback from "../UI/LoadingFallback";
import Error from "../UI/Error";
import UserContactInformationOverviews from "./UserContactInformationOverviews";
import Button from "../UI/Button";
import { IAdditionalContactInformation } from "../../models/additionalContactInformation.model";

interface IActionMutateArgsContactUserPanelFormData
  extends IActionMutateArgsContact {
  login: string;
}

export interface IActionMutateArgsContactUserPanel
  extends IActionMutateArgsContactUserPanelFormData {
  updateContactInformationId?: string;
}

export const ChangeActiveUserContactInformationContext = createContext<{
  handleApplyClick: (newActiveAdditionalInformationId: string) => void;
  error: FormActionBackendErrorResponse | null;
  contactInformationArr: IAdditionalContactInformation[];
  activeContactInformationOverviewIdFromReq: string;
  data?: FormActionBackendResponse;
}>({
  handleApplyClick: () => {},
  error: null,
  contactInformationArr: [],
  activeContactInformationOverviewIdFromReq: "",
  data: undefined,
});

interface IRetrievedContactInformationQueryRes {
  data: IRetrievedContactInformation;
}

export default function UserContactInformation() {
  const [contactInformationSectionState, setContactInformationSectionState] =
    useState<string>("");

  const { mutate, data, error, isPending } = useMutation<
    FormActionBackendResponse,
    FormActionBackendErrorResponse,
    IActionMutateArgsContactUserPanel
  >({ mutationFn: manageContactInformation });

  const handleFormSubmit = useCallback(
    (formData: IActionMutateArgsContactUserPanelFormData) =>
      mutate({
        ...formData,
        updateContactInformationId: undefined, // TODO
      }),
    [mutate]
  );

  const { login } = useLoaderData() as IUserPanelLoaderData;
  const contactInformationQueryKey = useMemo(
    () => ["contact-information", login],
    [login]
  );
  const {
    data: contactInformationData,
    error: contactInformationError,
    isLoading: contactInformationLoading,
  } = useQuery({
    queryKey: contactInformationQueryKey,
    queryFn: ({ signal }) => retrieveContactInformation(signal),
  });
  const contactInformationArr =
    contactInformationData?.data?.additionalContactInformation;
  const activeContactInformationOverviewIdFromReq =
    contactInformationData?.data?.activeAdditionalContactInformation || "";
  const hasContactInformationSaved =
    contactInformationArr && contactInformationArr.length > 0;

  const {
    mutate: changeUserActiveAdditionalInformationMutate,
    error: changeUserActiveAdditionalInformationError,
    data: changeUserActiveAdditionalInformationData,
  } = useMutation<
    FormActionBackendResponse,
    FormActionBackendErrorResponse,
    string,
    IRetrievedContactInformationQueryRes
  >({
    mutationFn: changeUserActiveAdditionalInformation,
    onMutate: async (newId) => {
      await queryClient.cancelQueries({
        queryKey: contactInformationQueryKey,
      });
      const oldContactInformation =
        queryClient.getQueryData<IRetrievedContactInformationQueryRes>(
          contactInformationQueryKey
        )!;
      queryClient.setQueryData(contactInformationQueryKey, {
        data: {
          ...oldContactInformation.data,
          activeAdditionalContactInformation: newId,
        },
      });
      return oldContactInformation;
    },
    onError: (_, __, ctx) => {
      queryClient.setQueryData(contactInformationQueryKey, ctx);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: contactInformationQueryKey,
      });
    },
  });

  const handleApplyClick = useCallback(
    (newActiveAdditionalInformationId: string) =>
      changeUserActiveAdditionalInformationMutate(
        newActiveAdditionalInformationId
      ),
    [changeUserActiveAdditionalInformationMutate]
  );

  let content = (
    <article className="available-contact-information flex flex-col w-full">
      {contactInformationLoading && <LoadingFallback />}
      {contactInformationError && (
        <Error message={contactInformationError.message} />
      )}
      {contactInformationArr && (
        <>
          <Header usePaddingBottom={false} additionalTailwindClasses="pb-8">
            {hasContactInformationSaved
              ? "Here are your saved contact details"
              : "You haven't saved any contact details yet! Feel free to add them down there"}
          </Header>
          {hasContactInformationSaved && (
            <ChangeActiveUserContactInformationContext.Provider
              value={{
                error: changeUserActiveAdditionalInformationError,
                handleApplyClick,
                contactInformationArr,
                activeContactInformationOverviewIdFromReq,
                data: changeUserActiveAdditionalInformationData,
              }}
            >
              <UserContactInformationOverviews
                key={activeContactInformationOverviewIdFromReq}
              >
                <Button
                  onClick={() => setContactInformationSectionState("add")}
                >
                  Add a new contact details entry
                </Button>
              </UserContactInformationOverviews>
            </ChangeActiveUserContactInformationContext.Provider>
          )}
        </>
      )}
    </article>
  );

  if (contactInformationSectionState === "add")
    content = (
      <article className="contact-information-form w-full flex justify-center items-center">
        <FormWithErrorHandling
          queryRelatedToActionState={{ data, error, isPending }}
          onSubmit={handleFormSubmit}
          lightTheme
        >
          <RegisterFormContent />
          <RegisterPageFormControls>
            <Button
              type="button"
              onClick={() => setContactInformationSectionState("")}
            >
              Go back
            </Button>
          </RegisterPageFormControls>
        </FormWithErrorHandling>
      </article>
    );

  return content;
}
