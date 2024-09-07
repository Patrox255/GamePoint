/* eslint-disable react-refresh/only-export-components */
import { useLocation, useNavigate } from "react-router-dom";
import { ReactNode, useCallback, useContext, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

import createUrlWithCurrentSearchParams from "../../../../helpers/createUrlWithCurrentSearchParams";
import { TabsComponentContext } from "../../../structure/TabsComponent";
import { adminPanelPossibleSectionsNames } from "../../UserAdminPanel";
import { adminSelectedOrderSessionStorageAndSearchParamsEntryName } from "../../../../store/userPanel/admin/orders/UpdateOrderDetailsContext";
import Header from "../../../UI/headers/Header";
import {
  IModifyUserDataByAdminQueryFnArg,
  modifyUserDataByAdmin,
  queryClient,
  retrieveUserDataByAdmin,
} from "../../../../lib/fetch";
import useExtractStableDataOrErrorsFromMyBackendUseQueryResponse from "../../../../hooks/queryRelated/useExtractStableDataOrErrorsFromMyBackendUseQueryResponse";
import Error from "../../../UI/Error";
import FormWithErrorHandling, {
  FormActionBackendErrorResponse,
  FormActionBackendResponse,
  IFormInputField,
  ValidationErrorsArr,
} from "../../../UI/FormWithErrorHandling";
import LoadingFallback from "../../../UI/LoadingFallback";
import {
  GroupedOrderDetailsEntry,
  HighlightedOrderDetailsEntry,
} from "../../orders/OrdersList";
import Button from "../../../UI/Button";
import Input from "../../../UI/Input";
import { IOrder } from "../../../../models/order.model";
import { ManageUsersContext } from "../../../../store/userPanel/admin/users/ManageUsersContext";
import ManageOrdersFindingOrderContextProvider from "../../../../store/userPanel/admin/orders/ManageOrdersFindingOrderContext";
import UserOrdersManagerOrdersDetailsContextProvider from "../../../../store/userPanel/UserOrdersManagerOrdersDetailsContext";
import PagesManagerContextProvider from "../../../../store/products/PagesManagerContext";
import OrdersListContextProvider from "../../../../store/userPanel/admin/orders/OrdersListContext";
import AdminOrdersListWrapper from "../orders/AdminOrdersListWrapper";
import inputFieldsObjs from "../../../../lib/inputFieldsObjs";
import InputFieldElement from "../../../UI/InputFieldElement";
import { IUserPopulated } from "../../../../models/user.model";

const searchParamsEntriesToOverrideToGetToTheDesiredOrderSummary = (
  orderId: string
) => ({ adminSelectedOrder: orderId, adminPanelSection: false });

const manageOrdersAdminPanelTabSectionName: adminPanelPossibleSectionsNames =
  "manageOrders";

const SelectedUserDataEntryComponent = ({
  entryTitle,
  entryValue,
}: {
  entryTitle: string;
  entryValue: string | ReactNode;
}) => (
  <GroupedOrderDetailsEntry.GroupElement>
    {entryTitle}:&nbsp;
    <HighlightedOrderDetailsEntry>{entryValue}</HighlightedOrderDetailsEntry>
  </GroupedOrderDetailsEntry.GroupElement>
);

export const transformGeneralInformationModificationUserFriendlyModeToOneStoredInQuery =
  (
    generalInformationModificationUserFriendlyMode: generalInformationModificationMode
  ) =>
    generalInformationModificationUserFriendlyMode
      .toLowerCase()
      .replace(/\s/g, "-") as generalInformationModificationStoredInQueryMode;

type transformedMode<T extends string> =
  T extends `${infer First} ${infer Rest}`
    ? `${Lowercase<First>}-${transformedMode<Rest>}`
    : Lowercase<T>;

export const generalInformationModificationModesRelatedToModificationByBtn = [
  "E-mail verification",
  "Admin",
] as const;
export type generalInformationModificationModeRelatedToModificationByBtn =
  (typeof generalInformationModificationModesRelatedToModificationByBtn)[number];

const generalInformationModificationModesWithInput = [
  "Login",
  "E-mail",
] as const;
type generalInformationModificationModesWithInput =
  (typeof generalInformationModificationModesWithInput)[number];

const generalInformationModificationModes = [
  ...generalInformationModificationModesWithInput,
  ...generalInformationModificationModesRelatedToModificationByBtn,
] as const;
export type generalInformationModificationMode =
  (typeof generalInformationModificationModes)[number];
export type generalInformationModificationStoredInQueryMode =
  transformedMode<generalInformationModificationMode>;

type IGeneralInformationModificationModeWithInputToAppropriateInputFieldMap =
  Record<generalInformationModificationModesWithInput, IFormInputField>;
const generalInformationModificationModeWithInputToAppropriateInputFieldMap: IGeneralInformationModificationModeWithInputToAppropriateInputFieldMap =
  Object.fromEntries(
    Object.entries({
      Login: inputFieldsObjs.login,
      "E-mail": inputFieldsObjs.email,
    }).map((inputFieldMapEntry) => [
      inputFieldMapEntry[0],
      {
        ...inputFieldMapEntry[1],
        placeholder: undefined,
        omitMovingTheInputFieldUponSelecting: true,
        renderLabel: false,
      },
    ])
  ) as IGeneralInformationModificationModeWithInputToAppropriateInputFieldMap;

export type IGeneralInformationModificationQuery = {
  [generalInformationModificationEntry in generalInformationModificationStoredInQueryMode]: string;
};
const initialGeneralInformationModificationQuery = Object.fromEntries(
  generalInformationModificationModes.map(
    (generalInformationModificationMode) => [
      transformGeneralInformationModificationUserFriendlyModeToOneStoredInQuery(
        generalInformationModificationMode
      ),
      "",
    ]
  )
) as IGeneralInformationModificationQuery;

const createModifiedGeneralInformationModificationQueryBasedOnIndividualModificationModeChangeEntry =
  (
    curGeneralInformationModificationQuery: IGeneralInformationModificationQuery,
    generalInformationModificationMode: generalInformationModificationMode,
    newQueryValue: string
  ) => ({
    ...curGeneralInformationModificationQuery,
    [transformGeneralInformationModificationUserFriendlyModeToOneStoredInQuery(
      generalInformationModificationMode
    )]: newQueryValue,
  });

export default function SelectedUserManagement() {
  const { search, pathname } = useLocation();
  const searchParamsStable = useMemo(
    () => new URLSearchParams(search),
    [search]
  );
  const navigate = useNavigate();

  const {
    selectedUserFromList: selectedUserLogin,
    setSelectedUserFromList: setSelectedUserLogin,
  } = useContext(ManageUsersContext);

  const { setNormalAndDebouncingTabsState } = useContext(TabsComponentContext);

  const handleNavigateToOrderDetails = useCallback(
    (selectedOrder: IOrder) => {
      const selectedOrderId = selectedOrder._id;
      console.log(selectedOrderId, selectedOrder);
      setNormalAndDebouncingTabsState(manageOrdersAdminPanelTabSectionName);
      sessionStorage.setItem(
        adminSelectedOrderSessionStorageAndSearchParamsEntryName,
        JSON.stringify(selectedOrderId)
      );
      navigate(
        createUrlWithCurrentSearchParams({
          searchParams: searchParamsStable,
          pathname,
          searchParamsEntriesToOverride:
            searchParamsEntriesToOverrideToGetToTheDesiredOrderSummary(
              selectedOrderId
            ),
        }),
        { replace: true }
      );
    },
    [navigate, pathname, searchParamsStable, setNormalAndDebouncingTabsState]
  );

  const userDataQueryKey = useMemo(
    () => ["user-data-admin", selectedUserLogin],
    [selectedUserLogin]
  );
  const {
    data: userDataFromQuery,
    error: userDataErrorFromQuery,
    isLoading: userDataIsLoading,
  } = useQuery({
    queryFn: ({ signal }) =>
      retrieveUserDataByAdmin(selectedUserLogin!, signal),
    queryKey: userDataQueryKey,
  });

  const {
    stableData: userData,
    stableOtherErrors: userDataOtherErrors,
    stableValidationErrors: userDataValidationErrors,
  } = useExtractStableDataOrErrorsFromMyBackendUseQueryResponse(
    userDataFromQuery,
    userDataErrorFromQuery
  );

  const [
    generalInformationModificationMode,
    setGeneralInformationModificationMode,
  ] = useState<generalInformationModificationMode>("Login");
  const [
    generalInformationModificationQuery,
    setGeneralInformationModificationQuery,
  ] = useState<IGeneralInformationModificationQuery>(
    initialGeneralInformationModificationQuery
  );
  const curGeneralInformationModificationModeInputValue =
    generalInformationModificationQuery[
      transformGeneralInformationModificationUserFriendlyModeToOneStoredInQuery(
        generalInformationModificationMode
      )
    ];
  const curInputFieldElementAccordingToCurModificationMode = useMemo(
    () =>
      generalInformationModificationModesWithInput.includes(
        generalInformationModificationMode as generalInformationModificationModesWithInput
      )
        ? generalInformationModificationModeWithInputToAppropriateInputFieldMap[
            generalInformationModificationMode as generalInformationModificationModesWithInput
          ]
        : undefined,
    [generalInformationModificationMode]
  );

  const {
    mutate: modifyUserGeneralDataMutate,
    data: modifyUserGeneralData,
    error: modifyUserGeneralDataError,
    isPending: modifyUserGeneralDataIsPending,
  } = useMutation<
    FormActionBackendResponse,
    FormActionBackendErrorResponse,
    IModifyUserDataByAdminQueryFnArg
  >({
    mutationFn: modifyUserDataByAdmin,
    onMutate: (mutateData) => {
      const curUserData = queryClient.getQueryData(userDataQueryKey) as {
        data: IUserPopulated;
      };
      const { modificationMode, modificationValue } = mutateData;
      const optimisticUserData = { ...curUserData.data };
      if (modificationMode === "login")
        optimisticUserData.login = modificationValue!;
      if (modificationMode === "e-mail")
        optimisticUserData.email = modificationValue!;
      if (modificationMode === "admin")
        optimisticUserData.isAdmin = !optimisticUserData.isAdmin;
      if (modificationMode === "e-mail-verification")
        optimisticUserData.emailVerified = !optimisticUserData.emailVerified;
      queryClient.setQueryData(userDataQueryKey, { data: optimisticUserData });
      return curUserData;
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(userDataQueryKey, context);
    },
    onSuccess: (_, mutateData) => {
      if (mutateData.modificationMode === "login")
        setSelectedUserLogin!(mutateData.modificationValue!);
    },
    onSettled: async () => {
      queryClient.invalidateQueries({ queryKey: userDataQueryKey });
    },
  });
  const handleModifyUserData = useCallback(
    () =>
      modifyUserGeneralDataMutate({
        modificationMode:
          transformGeneralInformationModificationUserFriendlyModeToOneStoredInQuery(
            generalInformationModificationMode
          ),
        userLogin: selectedUserLogin!,
        modificationValue: curGeneralInformationModificationModeInputValue,
      }),
    [
      curGeneralInformationModificationModeInputValue,
      generalInformationModificationMode,
      modifyUserGeneralDataMutate,
      selectedUserLogin,
    ]
  );

  console.log(generalInformationModificationQuery);

  let userManagementContent;
  if (userDataOtherErrors || userDataValidationErrors)
    userManagementContent = (
      <Error
        smallVersion
        message={
          (userDataOtherErrors
            ? userDataOtherErrors
            : (userDataValidationErrors as ValidationErrorsArr)[0]
          ).message
        }
      />
    );
  if (userDataIsLoading)
    userManagementContent = (
      <LoadingFallback customText="Retrieving selected user data..." />
    );
  if (userData) {
    const { login, email, isAdmin, emailVerified } = userData;
    userManagementContent = (
      <>
        <section className="user-management-general-information flex flex-col gap-4">
          <section className="user-header flex flex-col">
            <Header size="large">{login}</Header>
            {isAdmin && (
              <section className="user-admin-information">
                <Header size="small" usePaddingBottom={false}>
                  Admin
                </Header>
              </section>
            )}
          </section>
          <section className="user-login-and-email">
            <GroupedOrderDetailsEntry>
              <SelectedUserDataEntryComponent
                entryTitle="Login"
                entryValue={login}
              ></SelectedUserDataEntryComponent>
              <SelectedUserDataEntryComponent
                entryTitle="E-mail"
                entryValue={
                  <>
                    {email}&nbsp;({emailVerified ? "verified" : "unverified"})
                  </>
                }
              ></SelectedUserDataEntryComponent>
            </GroupedOrderDetailsEntry>
          </section>
          <section className="user-management-general-information-control flex flex-col gap-4 justify-center items-center">
            <FormWithErrorHandling
              queryRelatedToActionState={{
                data: modifyUserGeneralData,
                error: modifyUserGeneralDataError,
                isPending: modifyUserGeneralDataIsPending,
              }}
              onSubmit={handleModifyUserData}
            >
              <Input
                type="select"
                options={
                  generalInformationModificationModes as unknown as string[]
                }
                value={generalInformationModificationMode}
                onChange={(newMode: string) =>
                  setGeneralInformationModificationMode(
                    newMode as generalInformationModificationMode
                  )
                }
              />
              {!generalInformationModificationModesRelatedToModificationByBtn.includes(
                generalInformationModificationMode as generalInformationModificationModeRelatedToModificationByBtn
              ) && (
                <InputFieldElement
                  inputFieldObjFromProps={
                    curInputFieldElementAccordingToCurModificationMode!
                  }
                  value={curGeneralInformationModificationModeInputValue}
                  onChange={(newQuery: string) =>
                    setGeneralInformationModificationQuery(
                      (curGeneralInformationModificationQuery) =>
                        createModifiedGeneralInformationModificationQueryBasedOnIndividualModificationModeChangeEntry(
                          curGeneralInformationModificationQuery,
                          generalInformationModificationMode,
                          newQuery
                        )
                    )
                  }
                />
              )}
              <Button
                disabled={
                  (generalInformationModificationMode === "Login" &&
                    curGeneralInformationModificationModeInputValue ===
                      login) ||
                  (generalInformationModificationMode === "E-mail" &&
                    curGeneralInformationModificationModeInputValue === email)
                }
              >
                {generalInformationModificationMode === "Admin"
                  ? `Transform to ${
                      userData.isAdmin ? "a normal user" : "an admin"
                    }`
                  : generalInformationModificationMode === "E-mail verification"
                  ? `${
                      userData.emailVerified ? "Unverify" : "Verify"
                    } the user's e-mail address`
                  : "Apply changes"}
              </Button>
            </FormWithErrorHandling>
          </section>
        </section>
        <section className="user-management-orders">
          <OrdersListContextProvider
            orderItemOnClickStable={handleNavigateToOrderDetails}
          >
            <PagesManagerContextProvider>
              <UserOrdersManagerOrdersDetailsContextProvider
                orderDetailsQueryEnabled={false}
                sortCustomizationSearchParamsAndSessionStorageEntryName="sortSelectedUserByAdminOrdersProperties"
              >
                <ManageOrdersFindingOrderContextProvider>
                  <AdminOrdersListWrapper />
                </ManageOrdersFindingOrderContextProvider>
              </UserOrdersManagerOrdersDetailsContextProvider>
            </PagesManagerContextProvider>
          </OrdersListContextProvider>
        </section>
      </>
    );
  }

  return (
    <>
      {userManagementContent}
      <Button onClick={() => setSelectedUserLogin!("")}>Go back</Button>
    </>
  );
}
