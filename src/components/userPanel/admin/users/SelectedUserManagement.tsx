/* eslint-disable react-refresh/only-export-components */
import { useLocation, useNavigate } from "react-router-dom";
import { ReactNode, useCallback, useContext, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import createUrlWithCurrentSearchParams from "../../../../helpers/createUrlWithCurrentSearchParams";
import { TabsComponentContext } from "../../../structure/TabsComponent";
import { adminPanelPossibleSectionsNames } from "../../UserAdminPanel";
import { adminSelectedOrderSessionStorageAndSearchParamsEntryName } from "../../../../store/userPanel/admin/orders/UpdateOrderDetailsContext";
import Header from "../../../UI/headers/Header";
import { retrieveUserDataByAdmin } from "../../../../lib/fetch";
import useExtractStableDataOrErrorsFromMyBackendUseQueryResponse from "../../../../hooks/queryRelated/useExtractStableDataOrErrorsFromMyBackendUseQueryResponse";
import Error from "../../../UI/Error";
import { ValidationErrorsArr } from "../../../UI/FormWithErrorHandling";
import LoadingFallback from "../../../UI/LoadingFallback";
import {
  GroupedOrderDetailsEntry,
  HighlightedOrderDetailsEntry,
} from "../../orders/OrdersList";
import Button from "../../../UI/Button";
import Input from "../../../UI/Input";
import { IOrder } from "../../../../models/order.model";

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

const transformGeneralInformationModificationUserFriendlyModeToOneStoredInQuery =
  (
    generalInformationModificationUserFriendlyMode: generalInformationModificationMode
  ) =>
    generalInformationModificationUserFriendlyMode
      .toLowerCase()
      .replace(/\s/g, "-") as generalInformationModificationStoredInQueryMode;

type transformedMode<T extends string> =
  T extends `${infer First} ${infer Rest}`
    ? `${Lowercase<First>}-${transformedMode<Rest>}}`
    : Lowercase<T>;

export const generalInformationModificationModesRelatedToModificationByBtn = [
  "E-mail verification",
  "Admin",
] as const;
export type generalInformationModificationModeRelatedToModificationByBtn =
  (typeof generalInformationModificationModesRelatedToModificationByBtn)[number];

const generalInformationModificationModes = [
  "Login",
  "E-mail",
  ...generalInformationModificationModesRelatedToModificationByBtn,
] as const;
export type generalInformationModificationMode =
  (typeof generalInformationModificationModes)[number];
type generalInformationModificationStoredInQueryMode =
  transformedMode<generalInformationModificationMode>;

type IGeneralInformationModificationQuery = {
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

export default function SelectedUserManagement({
  selectedUserLogin,
  setSelectedUserLogin,
}: {
  selectedUserLogin: string;
  setSelectedUserLogin: (newUserLogin: string) => void;
}) {
  const { search, pathname } = useLocation();
  const searchParamsStable = useMemo(
    () => new URLSearchParams(search),
    [search]
  );
  const navigate = useNavigate();

  const { setNormalAndDebouncingTabsState } = useContext(TabsComponentContext);

  const handleNavigateToOrderDetails = useCallback(
    (selectedOrder: IOrder) => {
      const selectedOrderId = selectedOrder._id;
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

  const {
    data: userDataFromQuery,
    error: userDataErrorFromQuery,
    isLoading: userDataIsLoading,
  } = useQuery({
    queryFn: ({ signal }) => retrieveUserDataByAdmin(selectedUserLogin, signal),
    queryKey: ["user-data-admin", selectedUserLogin],
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
    const {
      login,
      email,
      isAdmin,
      emailVerified,
      // orders
    } = userData;
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
          <section className="user-management-general-information-control">
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
            {generalInformationModificationMode}
            {!generalInformationModificationModesRelatedToModificationByBtn.includes(
              generalInformationModificationMode as generalInformationModificationModeRelatedToModificationByBtn
            ) && (
              <Input
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
            {generalInformationModificationModesRelatedToModificationByBtn.includes(
              generalInformationModificationMode as generalInformationModificationModeRelatedToModificationByBtn
            ) && <Button></Button>}
          </section>
        </section>
        <section className="user-management-orders">
          {/* <OrdersList
            orderItemOnClick={handleNavigateToOrderDetails}
            ordersDetailsFromPropsStable={orders}
          /> */}
          <p
            onClick={() =>
              handleNavigateToOrderDetails({} as unknown as IOrder)
            }
          >
            Click
          </p>
        </section>
      </>
    );
  }

  return (
    <>
      {userManagementContent}
      <Button onClick={() => setSelectedUserLogin("")}>Go back</Button>
    </>
  );
}
