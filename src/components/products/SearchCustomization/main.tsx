import { useNavigate } from "react-router-dom";
import Button from "../../UI/Button";
import DiscountCustomization from "./DiscountCustomization";
import PriceCustomization from "./PriceCustomization";
import { useContext } from "react";
import { SearchCustomizationContext } from "../../../store/products/SearchCustomizationContext";
import { useAppDispatch } from "../../../hooks/reduxStore";
import { actions as searchBarActions } from "../../../store/mainSearchBarSlice";
import MainCustomizationComponentsWithInputsAndTags, {
  MainCustomizationComponentsWithInputsAndTagsConfigurationContextProvider,
} from "./MainCustomizationComponentsWithInputsAndTags";

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
          <MainCustomizationComponentsWithInputsAndTagsConfigurationContextProvider
            genres={{
              searchCustomizationCtxStateName: "selectedGenresState",
              searchCustomizationCtxDispatchName: "selectedGenresDispatch",
            }}
            developers={{
              searchCustomizationCtxStateName: "selectedDevelopersState",
              searchCustomizationCtxDispatchName: "selectedDevelopersDispatch",
            }}
            platforms={{
              searchCustomizationCtxStateName: "selectedPlatformsState",
              searchCustomizationCtxDispatchName: "selectedPlatformsDispatch",
            }}
            publishers={{
              searchCustomizationCtxStateName: "selectedPublishersState",
              searchCustomizationCtxDispatchName: "selectedPublishersDispatch",
            }}
          >
            <MainCustomizationComponentsWithInputsAndTags />
          </MainCustomizationComponentsWithInputsAndTagsConfigurationContextProvider>
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
                tagDispatch?.({
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
