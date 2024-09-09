import { createContext, useCallback, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLoaderData } from "react-router-dom";

import { IActionMutateArgsContact } from "../../pages/RegisterPage";
import { IInputFieldsDefaultValues } from "../formRelated/ContactInformationFormInputFieldsContent";
import FormWithErrorHandling, {
  FormActionBackendErrorResponse,
  FormActionBackendResponse,
} from "../UI/FormWithErrorHandling";
import {
  changeUserActiveAdditionalInformation,
  IChangeUserActiveAdditionalInformationQueryArg,
  IRetrievedContactInformation,
  IRetrieveOrModifyContactInformationCustomUserDataProperties,
  manageContactInformation,
  queryClient,
} from "../../lib/fetch";
import { IUserPanelLoaderData } from "../../pages/UserPanelPage";
import Header from "../UI/headers/Header";
import LoadingFallback from "../UI/LoadingFallback";
import Error from "../UI/Error";
import UserContactInformationOverviews, {
  AddANewContactDetailsEntry,
} from "./UserContactInformationOverviews";
import { IAdditionalContactInformation } from "../../models/additionalContactInformation.model";
import useRetrieveContactInformation from "../../hooks/accountRelated/useRetrieveContactInformation";
import ContactInformationFormContent from "../formRelated/ContactInformationFormContent";

interface IActionMutateArgsContactUserPanelFormData {
  newContactInformation: IActionMutateArgsContact;
}

export interface IActionMutateArgsContactUserPanel
  extends IActionMutateArgsContactUserPanelFormData,
    IRetrieveOrModifyContactInformationCustomUserDataProperties {
  updateContactInformationId?: string;
}

const contactInformationSectionStateValuesNotRelatedToContactInformationEntryId =
  ["", "add"];

export const ChangeActiveUserContactInformationContext = createContext<{
  handleApplyClick: (newActiveAdditionalInformationId: string) => void;
  error: FormActionBackendErrorResponse | null;
  contactInformationArr: IAdditionalContactInformation[];
  activeContactInformationOverviewIdFromReq?: string;
  data?: FormActionBackendResponse;
  setContactInformationSectionState: React.Dispatch<
    React.SetStateAction<string>
  >;
}>({
  handleApplyClick: () => {},
  error: null,
  contactInformationArr: [],
  activeContactInformationOverviewIdFromReq: undefined,
  data: undefined,
  setContactInformationSectionState: () => {},
});

interface IRetrievedContactInformationQueryRes {
  data: IRetrievedContactInformation;
}

export default function UserContactInformation({
  customLoginInCaseOfAdminManagement,
  customIdInCaseOfAdminManagement,
  customAvailableContactDetailsEntriesHeader,
  customNoAvailableContactDetailsEntriesHeader,
}: {
  customLoginInCaseOfAdminManagement?: string;
  customIdInCaseOfAdminManagement?: string;
  customNoAvailableContactDetailsEntriesHeader?: string;
  customAvailableContactDetailsEntriesHeader?: string;
}) {
  const [contactInformationSectionState, setContactInformationSectionState] =
    useState<string>("");
  const { login: curLogin } = useLoaderData() as IUserPanelLoaderData;
  const login = customLoginInCaseOfAdminManagement
    ? customLoginInCaseOfAdminManagement
    : curLogin;

  const customUserDataInformationObjForQueries =
    useMemo<IRetrieveOrModifyContactInformationCustomUserDataProperties>(
      () => ({
        customUserId: customIdInCaseOfAdminManagement,
        customUserLogin: customLoginInCaseOfAdminManagement,
      }),
      [customIdInCaseOfAdminManagement, customLoginInCaseOfAdminManagement]
    );

  const {
    data: contactInformationData,
    error: contactInformationError,
    isLoading: contactInformationLoading,
    contactInformationArr,
    contactInformationQueryKey,
  } = useRetrieveContactInformation({
    ...customUserDataInformationObjForQueries,
    customUserLogin: login,
  });
  const activeContactInformationOverviewIdFromReq =
    contactInformationData?.data?.activeAdditionalContactInformation || "";
  const hasContactInformationSaved =
    contactInformationArr && contactInformationArr.length > 0;

  const { mutate, data, error, isPending } = useMutation<
    FormActionBackendResponse,
    FormActionBackendErrorResponse,
    IActionMutateArgsContactUserPanel
  >({
    mutationFn: manageContactInformation,
    onSuccess: async (resData) => {
      if (typeof resData.data === "object") return;
      setContactInformationSectionState("");
      await queryClient.resetQueries({
        queryKey: contactInformationQueryKey,
      });
    },
  });

  const selectedContactInformationEntryId =
    !contactInformationSectionStateValuesNotRelatedToContactInformationEntryId.includes(
      contactInformationSectionState
    ) && contactInformationSectionState;

  const handleFormSubmit = useCallback(
    (formData: IActionMutateArgsContact) =>
      mutate({
        newContactInformation: formData,
        ...(selectedContactInformationEntryId && {
          updateContactInformationId: selectedContactInformationEntryId,
        }),
        ...customUserDataInformationObjForQueries,
      }),
    [
      mutate,
      selectedContactInformationEntryId,
      customUserDataInformationObjForQueries,
    ]
  );
  const handleGoToContactInformationMainPage = useCallback(() => {
    setContactInformationSectionState("");
  }, []);

  const {
    mutate: changeUserActiveAdditionalInformationMutate,
    error: changeUserActiveAdditionalInformationError,
    data: changeUserActiveAdditionalInformationData,
  } = useMutation<
    FormActionBackendResponse,
    FormActionBackendErrorResponse,
    IChangeUserActiveAdditionalInformationQueryArg,
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
    (newActiveAdditionalInformationEntryId: string) =>
      changeUserActiveAdditionalInformationMutate({
        newActiveAdditionalInformationEntryId,
        customUserId: customIdInCaseOfAdminManagement,
        customUserLogin: customLoginInCaseOfAdminManagement,
      }),
    [
      changeUserActiveAdditionalInformationMutate,
      customIdInCaseOfAdminManagement,
      customLoginInCaseOfAdminManagement,
    ]
  );

  const defaultContactInformationFormValues = useMemo(() => {
    if (
      contactInformationSectionState === "" ||
      contactInformationSectionState === "add" ||
      !contactInformationArr
    )
      return undefined;
    const selectedContactInformationData = contactInformationArr.find(
      (contactInformationArrEntry) =>
        contactInformationArrEntry._id === contactInformationSectionState
    );
    // this should never be of different id than one of the contact information entries
    // but just in case
    if (!selectedContactInformationData) return undefined;
    return selectedContactInformationData;
  }, [contactInformationArr, contactInformationSectionState]);

  // sectionState set to an individual contact details entry id or to "add" in case of adding a new contact
  // details entry
  let content = (
    <article className="contact-information-form w-full flex justify-center items-center">
      <FormWithErrorHandling
        queryRelatedToActionState={{ data, error, isPending }}
        onSubmit={handleFormSubmit}
        lightTheme
      >
        <ContactInformationFormContent
          defaultValuesObj={
            defaultContactInformationFormValues
              ? (defaultContactInformationFormValues as unknown as IInputFieldsDefaultValues)
              : undefined
          }
          submitBtnText={
            contactInformationSectionState === "add"
              ? "Add Entry"
              : "Edit Entry"
          }
          goBackBtnClickHandler={handleGoToContactInformationMainPage}
        />
      </FormWithErrorHandling>
    </article>
  );

  if (contactInformationSectionState === "")
    content = (
      <article className="available-contact-information flex flex-col w-full items-center">
        {contactInformationLoading && <LoadingFallback />}
        {contactInformationError && (
          <Error message={contactInformationError.message} />
        )}
        {contactInformationArr && (
          <>
            <Header usePaddingBottom={false} additionalTailwindClasses="pb-8">
              {hasContactInformationSaved
                ? customAvailableContactDetailsEntriesHeader
                  ? customAvailableContactDetailsEntriesHeader
                  : "Here are your saved contact details"
                : customNoAvailableContactDetailsEntriesHeader
                ? customNoAvailableContactDetailsEntriesHeader
                : "You haven't saved any contact details yet! Feel free to add them down there"}
            </Header>

            <ChangeActiveUserContactInformationContext.Provider
              value={{
                setContactInformationSectionState,
                error: changeUserActiveAdditionalInformationError,
                handleApplyClick,
                contactInformationArr,
                activeContactInformationOverviewIdFromReq,
                data: changeUserActiveAdditionalInformationData,
              }}
            >
              {hasContactInformationSaved ? (
                <UserContactInformationOverviews
                  key={activeContactInformationOverviewIdFromReq}
                />
              ) : (
                <div className="w-1/2">
                  <AddANewContactDetailsEntry />
                </div>
              )}
            </ChangeActiveUserContactInformationContext.Provider>
          </>
        )}
      </article>
    );

  return content;
}
