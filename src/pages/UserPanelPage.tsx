/* eslint-disable react-refresh/only-export-components */
import { ReactNode, useCallback } from "react";
import { LoaderFunction, redirect, useLoaderData } from "react-router-dom";

import MainWrapper from "../components/structure/MainWrapper";
import Header from "../components/UI/headers/Header";
import createSearchParamsFromRequestURL from "../helpers/createSearchParamsFromRequestURL";
import { authGuardFn } from "../helpers/authGuard";
import { validateJSONValue } from "../helpers/generateInitialStateFromSearchParamsOrSessionStorage";
import {
  possibleUserPanelParams,
  userPanelEntries,
} from "../components/UI/Nav";
import AnimatedAppearance from "../components/UI/AnimatedAppearance";
import UserOrdersManager from "../components/userPanel/orders/UserOrdersManager";
import UserContactInformation from "../components/userPanel/UserContactInformation";
import UserAdminPanel from "../components/userPanel/UserAdminPanel";
import TabsComponent, {
  ITagsObjDefault,
} from "../components/structure/TabsComponent";
import filterOrOnlyIncludeCertainPropertiesFromObj from "../helpers/filterOrOnlyIncludeCertainPropertiesFromObj";

const panelSectionsComponents: { [key: string]: ReactNode } = {
  orders: <UserOrdersManager />,
  contact: <UserContactInformation />,
  admin: <UserAdminPanel />,
};

type panelSectionsTagsObjs = ITagsObjDefault<possibleUserPanelParams>[];
const possiblePanelSections = userPanelEntries.slice(0, -1).map((userEntry) =>
  filterOrOnlyIncludeCertainPropertiesFromObj(
    {
      ...userEntry,
      tagName: userEntry.userPanelParam,
      ComponentToRender: panelSectionsComponents[userEntry.userPanelParam],
    },
    ["userPanelParam"]
  )
) as panelSectionsTagsObjs;

export interface IUserPanelLoaderData {
  panelSection: string;
  isAdmin: boolean;
  login: string;
  userId: string;
}

export default function UserPanelPage() {
  const { panelSection, isAdmin } = useLoaderData() as IUserPanelLoaderData;

  const generateAvailableTabsFromAllFnStable = useCallback(
    (tags: panelSectionsTagsObjs) =>
      isAdmin
        ? tags
        : tags.filter(
            (tag) =>
              !userPanelEntries.find(
                (userPanelEntry) =>
                  userPanelEntry.userPanelParam === tag.tagName
              )?.adminRestricted
          ),
    [isAdmin]
  );

  return (
    <MainWrapper>
      <AnimatedAppearance>
        <Header
          size="large"
          usePaddingBottom={false}
          additionalTailwindClasses="py-8"
        >
          Account Management
        </Header>
        <article className="w-4/5 flex justify-center items-center flex-col px-8 py-8 bg-darkerBg rounded-xl">
          <TabsComponent
            defaultTabsStateValue={panelSection}
            possibleTabsStable={possiblePanelSections}
            sessionStorageAndSearchParamEntryNameIfYouWantToUseThem="panelSection"
            generateAvailableTabsFromAllFnStable={
              generateAvailableTabsFromAllFnStable
            }
          />
        </article>
      </AnimatedAppearance>
    </MainWrapper>
  );
}

export const loader: LoaderFunction = async function ({ request }) {
  const requestURL = request.url;
  const searchParams = createSearchParamsFromRequestURL(requestURL);
  const previousPagePathName = searchParams?.get("previousPagePathName") || "/";
  const authGuardFnRes = await authGuardFn(requestURL);
  const panelSectionFromSearchParams = searchParams?.get("panelSection");
  const panelSection =
    (panelSectionFromSearchParams
      ? validateJSONValue(panelSectionFromSearchParams, "")
      : false) || possiblePanelSections[0].tagName;
  if (
    !authGuardFnRes ||
    !possiblePanelSections
      .map((availablePanelSection) => availablePanelSection.tagName)
      .includes(panelSection)
  )
    return redirect(previousPagePathName);

  const { isAdmin, login, userId } = authGuardFnRes;
  if (
    !isAdmin &&
    userPanelEntries.find(
      (userPanelEntry) => userPanelEntry.userPanelParam === panelSection
    )?.adminRestricted
  )
    return redirect(previousPagePathName);

  return { panelSection, isAdmin, login, userId };
};
