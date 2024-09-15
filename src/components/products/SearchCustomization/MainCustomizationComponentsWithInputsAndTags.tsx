/* eslint-disable react-refresh/only-export-components */
import { createContext, ReactNode, useMemo } from "react";
import CustomizationComponentWithInputAndTags from "./CustomizationComponentWithInputAndTags";
import { useQueryGetTagsAvailableTagsNames } from "../../../hooks/searchCustomizationRelated/useQueryGetTagsTypes";
import { IProductTagsContextBody } from "../../../store/products/SearchCustomizationContext";

export type IMainCustomizationComponentsWithInputsAndTagsConfigurationContextInformation =
  {
    [tagType in useQueryGetTagsAvailableTagsNames]: {
      searchCustomizationCtxStateName?: keyof IProductTagsContextBody;
      searchCustomizationCtxDispatchName?: keyof IProductTagsContextBody;
      mainCustomizationComponentsWithInputsAndTagsConfigurationCtxStateName?: keyof IProductTagsContextBody;
      mainCustomizationComponentsWithInputsAndTagsConfigurationCtxDispatchName?: keyof IProductTagsContextBody;
    };
  };
type IMainCustomizationComponentsWithInputsAndTagsConfigurationContextBody =
  IMainCustomizationComponentsWithInputsAndTagsConfigurationContextInformation &
    IProductTagsContextBody;
export const MainCustomizationComponentsWithInputsAndTagsConfigurationContext =
  createContext<IMainCustomizationComponentsWithInputsAndTagsConfigurationContextBody>(
    {
      genres: {},
      developers: {},
      platforms: {},
      publishers: {},
    }
  );

export const componentsWithInputsAndTagsConfigurationContextInformationDefault: IMainCustomizationComponentsWithInputsAndTagsConfigurationContextInformation =
  {
    developers: {
      mainCustomizationComponentsWithInputsAndTagsConfigurationCtxDispatchName:
        "selectedDevelopersDispatch",
      mainCustomizationComponentsWithInputsAndTagsConfigurationCtxStateName:
        "selectedDevelopersState",
    },
    genres: {
      mainCustomizationComponentsWithInputsAndTagsConfigurationCtxDispatchName:
        "selectedGenresDispatch",
      mainCustomizationComponentsWithInputsAndTagsConfigurationCtxStateName:
        "selectedGenresState",
    },
    platforms: {
      mainCustomizationComponentsWithInputsAndTagsConfigurationCtxDispatchName:
        "selectedPlatformsDispatch",
      mainCustomizationComponentsWithInputsAndTagsConfigurationCtxStateName:
        "selectedPlatformsState",
    },
    publishers: {
      mainCustomizationComponentsWithInputsAndTagsConfigurationCtxDispatchName:
        "selectedPublishersDispatch",
      mainCustomizationComponentsWithInputsAndTagsConfigurationCtxStateName:
        "selectedPublishersState",
    },
  };

export function MainCustomizationComponentsWithInputsAndTagsConfigurationContextProvider(
  ctxBodyProps: IMainCustomizationComponentsWithInputsAndTagsConfigurationContextBody & {
    children?: ReactNode;
  }
) {
  const { children, ...ctxBody } = ctxBodyProps;

  return (
    <MainCustomizationComponentsWithInputsAndTagsConfigurationContext.Provider
      value={ctxBody}
    >
      {children}
    </MainCustomizationComponentsWithInputsAndTagsConfigurationContext.Provider>
  );
}

const allCustomizationComponentsWithInputsAndTagsObj: {
  [key in useQueryGetTagsAvailableTagsNames]: ReactNode;
} = {
  genres: (
    <CustomizationComponentWithInputAndTags
      tagType="genres"
      propertyNameToRetrieveTagFromDataObj="name"
      headerText="Genres"
      inputPlaceholder="Type in a genre name"
      key="genres"
    />
  ),
  platforms: (
    <CustomizationComponentWithInputAndTags
      tagType="platforms"
      propertyNameToRetrieveTagFromDataObj="name"
      headerText="Platforms"
      inputPlaceholder="Type in a platform name"
      key="platforms"
    />
  ),
  developers: (
    <CustomizationComponentWithInputAndTags
      tagType="developers"
      propertyNameToRetrieveTagFromDataObj="name"
      headerText="Developers"
      inputPlaceholder="Type in a developer name"
      customGameDocumentPropertyNameForTag="developer"
      key="developers"
    />
  ),
  publishers: (
    <CustomizationComponentWithInputAndTags
      tagType="publishers"
      propertyNameToRetrieveTagFromDataObj="name"
      headerText="Publishers"
      inputPlaceholder="Type in a publisher name"
      customGameDocumentPropertyNameForTag="publisher"
      key="publishers"
    />
  ),
};

export default function MainCustomizationComponentsWithInputsAndTags({
  tagTypesToShowStable,
  additionalContentAtTheBeginningOfEachComponent,
}: {
  tagTypesToShowStable?: useQueryGetTagsAvailableTagsNames[];
  additionalContentAtTheBeginningOfEachComponent?: (
    curTagType: useQueryGetTagsAvailableTagsNames
  ) => ReactNode;
}) {
  const selectedComponentsWithInputsAndTags = useMemo(
    () =>
      !tagTypesToShowStable
        ? allCustomizationComponentsWithInputsAndTagsObj
        : Object.fromEntries(
            Object.entries(
              allCustomizationComponentsWithInputsAndTagsObj
            ).filter((allCustomizationComponentsWithInputsAndTagsObjEntry) =>
              tagTypesToShowStable.includes(
                allCustomizationComponentsWithInputsAndTagsObjEntry[0] as useQueryGetTagsAvailableTagsNames
              )
            )
          ),
    [tagTypesToShowStable]
  );
  const content = Object.entries(selectedComponentsWithInputsAndTags).map(
    (selectedComponentsWithInputsAndTagsEntry) => (
      <section
        className="tags-component-wrapper"
        key={selectedComponentsWithInputsAndTagsEntry[0]}
      >
        {additionalContentAtTheBeginningOfEachComponent &&
          additionalContentAtTheBeginningOfEachComponent(
            selectedComponentsWithInputsAndTagsEntry[0] as useQueryGetTagsAvailableTagsNames
          )}
        {selectedComponentsWithInputsAndTagsEntry[1]}
      </section>
    )
  );

  console.log(content);

  return content;
}
