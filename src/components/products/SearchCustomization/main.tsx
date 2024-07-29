import { useNavigate } from "react-router-dom";
import Button from "../../UI/Button";
import CustomizationComponentWithInputAndTags from "./CustomizationComponentWithInputAndTags";
import DiscountCustomization from "./DiscountCustomization";
import PriceCustomization from "./PriceCustomization";
import { useContext } from "react";
import { SearchCustomizationContext } from "../../../store/products/SearchCustomizationContext";
import { useAppDispatch } from "../../../hooks/reduxStore";
import { actions as searchBarActions } from "../../../store/mainSearchBarSlice";

export default function SearchCustomization() {
  const navigate = useNavigate();
  const {
    handleMinChange,
    handleMaxChange,
    setDiscountActive,
    selectedGenresDispatch,
    selectedPlatformsDispatch,
    selectedDevelopersDispatch,
    selectedPublishersDispatch,
  } = useContext(SearchCustomizationContext);
  const dispatch = useAppDispatch();

  return (
    <div className="flex w-full h-full flex-col justify-start text-center gap-4">
      <h1 className="text-highlightRed text-xl font-bold">
        Customize your search
      </h1>
      <section className="flex flex-col w-full gap-3">
        <h2 className="text-highlightRed">Price</h2>
        <div className="flex w-full gap-5 items-center justify-center flex-col">
          <PriceCustomization />
          <DiscountCustomization />
          <CustomizationComponentWithInputAndTags
            paramName="genres"
            propertyNameToRetrieveTagFromDataObj="name"
            searchCustomizationCtxStateName="selectedGenresState"
            searchCustomizationCtxDispatchName="selectedGenresDispatch"
            headerText="Genres"
            inputPlaceholder="Type in a genre name"
          />
          <CustomizationComponentWithInputAndTags
            paramName="platforms"
            propertyNameToRetrieveTagFromDataObj="name"
            searchCustomizationCtxStateName="selectedPlatformsState"
            searchCustomizationCtxDispatchName="selectedPlatformsDispatch"
            headerText="Platforms"
            inputPlaceholder="Type in a platform name"
          />
          <CustomizationComponentWithInputAndTags
            paramName="developers"
            propertyNameToRetrieveTagFromDataObj="name"
            searchCustomizationCtxStateName="selectedDevelopersState"
            searchCustomizationCtxDispatchName="selectedDevelopersDispatch"
            headerText="Developers"
            inputPlaceholder="Type in a developer name"
            customGameDocumentPropertyNameForTag="developer"
          />
          <CustomizationComponentWithInputAndTags
            paramName="publishers"
            propertyNameToRetrieveTagFromDataObj="name"
            searchCustomizationCtxStateName="selectedPublishersState"
            searchCustomizationCtxDispatchName="selectedPublishersDispatch"
            headerText="Publishers"
            inputPlaceholder="Type in a publisher name"
            customGameDocumentPropertyNameForTag="publisher"
          />
          <Button
            onClick={() => {
              [
                "genres",
                "developers",
                "publishers",
                "platforms",
                "discount",
              ].forEach((sessionStorageEntry) =>
                sessionStorage.removeItem(sessionStorageEntry)
              );
              handleMinChange(NaN);
              handleMaxChange(NaN);
              setDiscountActive(0);
              dispatch(searchBarActions.setSearchTerm(""));
              [
                selectedDevelopersDispatch,
                selectedGenresDispatch,
                selectedPlatformsDispatch,
                selectedPublishersDispatch,
              ].forEach((tagDispatch) =>
                tagDispatch({
                  type: "RESET",
                })
              );
              navigate("/products", { replace: true });
            }}
          >
            Reset search filters
          </Button>
        </div>
      </section>
    </div>
  );
}
