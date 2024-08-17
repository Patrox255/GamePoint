/* eslint-disable react-refresh/only-export-components */
import { ReactNode, useCallback, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { LoaderFunction, redirect, useLoaderData } from "react-router-dom";
import { motion } from "framer-motion";

import MainWrapper from "../components/structure/MainWrapper";
import Header from "../components/UI/headers/Header";
import createSearchParamsFromRequestURL from "../helpers/createSearchParamsFromRequestURL";
import { authGuardFn } from "../helpers/authGuard";
import Button from "../components/UI/Button";
import { validateJSONValue } from "../helpers/generateInitialStateFromSearchParamsOrSessionStorage";
import { userPanelEntries } from "../components/UI/Nav";
import AnimatedAppearance from "../components/UI/AnimatedAppearance";
import UserOrdersManager from "../components/userPanel/orders/UserOrdersManager";
import UserContactInformation from "../components/userPanel/UserContactInformation";
import UserAdminPanel from "../components/userPanel/UserAdminPanel";
import { useStateWithSearchParams } from "../hooks/useStateWithSearchParams";

const panelSectionsComponents: { [key: string]: ReactNode } = {
  orders: <UserOrdersManager />,
  contact: <UserContactInformation />,
  admin: <UserAdminPanel />,
};
const possiblePanelSections = userPanelEntries.slice(0, -1);

export interface IUserPanelLoaderData {
  panelSection: string;
  isAdmin: boolean;
  login: string;
  userId: string;
}

export const userPanelPageSectionTransitionProperties = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.5 },
};

export default function UserPanelPage() {
  const { panelSection, isAdmin } = useLoaderData() as IUserPanelLoaderData;
  const {
    state: panelState,
    setStateWithSearchParams: setPanelState,
    debouncingState: debouncingPanelState,
  } = useStateWithSearchParams(panelSection, "panelSection");
  const availablePanelSections = useMemo(
    () =>
      isAdmin
        ? possiblePanelSections
        : possiblePanelSections.filter(
            (possiblePanelSection) => !possiblePanelSection.adminRestricted
          ),
    [isAdmin]
  );
  const curActivePanelSectionEntry = availablePanelSections.find(
    (availablePanelSection) =>
      availablePanelSection.userPanelParam === panelState
  )!;
  const CurPanelSectionComponent = useCallback(
    () => panelSectionsComponents[panelState],
    [panelState]
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
          <nav className="user-panel-nav flex gap-4">
            {availablePanelSections.map((availablePanelSection) => {
              const active =
                availablePanelSection === curActivePanelSectionEntry;
              const disabled = active || panelState !== debouncingPanelState;
              return (
                <Button
                  onClick={
                    !disabled
                      ? () =>
                          setPanelState(availablePanelSection.userPanelParam)
                      : undefined
                  }
                  disabled={disabled}
                  key={`${availablePanelSection.userPanelParam}${
                    disabled ? "-disabled" : ""
                  }`}
                  active={active}
                >
                  {availablePanelSection.header}
                </Button>
              );
            })}
          </nav>
          <AnimatePresence mode="wait">
            <motion.article
              {...userPanelPageSectionTransitionProperties}
              key={`user-panel-content-${curActivePanelSectionEntry.userPanelParam}`}
              className="py-8 w-full flex justify-center items-center text-center flex-col"
            >
              <CurPanelSectionComponent />
            </motion.article>
          </AnimatePresence>
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
      : false) || possiblePanelSections[0].userPanelParam;
  if (
    !authGuardFnRes ||
    !possiblePanelSections
      .map((availablePanelSection) => availablePanelSection.userPanelParam)
      .includes(panelSection)
  )
    return redirect(previousPagePathName);

  const { isAdmin, login, userId } = authGuardFnRes;
  if (
    !isAdmin &&
    possiblePanelSections.find(
      (possiblePanelSection) =>
        possiblePanelSection.userPanelParam === panelSection
    )?.adminRestricted
  )
    return redirect(previousPagePathName);

  return { panelSection, isAdmin, login, userId };
};
