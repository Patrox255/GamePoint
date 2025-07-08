import Input from "../../UI/Input";
import { useQuery } from "@tanstack/react-query";
import { load10GamesByQuery } from "../../../lib/fetch";
import LoadingFallback from "../../UI/LoadingFallback";
import Error from "../../UI/Error";
import { useInput } from "../../../hooks/useInput";
import { useAppSelector } from "../../../hooks/reduxStore";
import { actions } from "../../../store/mainSearchBarSlice";
import GamesResults from "./GamesResults";
import DropDownMenuDroppedElementsContainer from "../../UI/DropDownMenu/DropDownMenuDroppedElementsContainer";

export default function NavSearchBar({ placeholder }: { placeholder: string }) {
  const searchTerm = useAppSelector(
    (state) => state.mainSearchBarSlice.searchTerm
  );
  // actions.setSearchTerm;
  const { handleInputChange, queryDebouncingState } = useInput({
    stateValue: searchTerm,
    setStateAction: actions.setSearchTerm,
    searchParamName: "query",
  });

  const { data, isLoading, error, isError } = useQuery({
    queryFn: ({ signal }) => load10GamesByQuery(queryDebouncingState, signal),
    queryKey: ["games", "search", queryDebouncingState],
    enabled: queryDebouncingState !== "",
  });

  return (
    <>
      <Input
        placeholder={placeholder}
        value={searchTerm}
        onChange={handleInputChange}
      />

      {(data || isLoading || isError) && (
        <DropDownMenuDroppedElementsContainer extendWidthOnLowerResolutions>
          {data && data.data.length !== 0 && searchTerm !== "" && !isError && (
            <div className="nav-games-search-bar-results-list-wrapper h-full w-full">
              <GamesResults games={data.data} />
            </div>
          )}
          {data && data.data.length === 0 && !isError && (
            <p className="text-center xs:text-base text-xs">
              There are no games which match with the provided query
            </p>
          )}
          {isLoading && <LoadingFallback />}
          {isError && <Error message={error.message} />}
        </DropDownMenuDroppedElementsContainer>
      )}
    </>
  );
}
