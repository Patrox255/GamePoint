import Input from "../../UI/Input";
import { useQuery } from "@tanstack/react-query";
import { load10GamesByQuery } from "../../../lib/fetch";
import LoadingFallback from "../../UI/LoadingFallback";
import Error from "../../UI/Error";
import { useInput } from "../../../hooks/useInput";
import { useAppSelector } from "../../../hooks/reduxStore";
import { actions } from "../../../store/mainSearchBarSlice";
import GamesResults from "./GamesResults";
import { DropDownMenuContext } from "../../UI/DropDownMenu/DropDownMenuWrapper";
import DropDownMenuDroppedElementsContainer from "../../UI/DropDownMenu/DropDownMenuDroppedElementsContainer";
import { useContext } from "react";

export default function NavSearchBar({ placeholder }: { placeholder: string }) {
  const searchTerm = useAppSelector(
    (state) => state.mainSearchBarSlice.searchTerm
  );
  actions.setSearchTerm;
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

  const { setShowResults } = useContext(DropDownMenuContext);

  async function handleInputBlur() {
    await new Promise((resolve) => setTimeout(resolve, 50));
    setShowResults(false);
  }
  function handleInputFocus() {
    setShowResults(true);
  }

  return (
    <>
      <Input
        placeholder={placeholder}
        value={searchTerm}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        onFocus={handleInputFocus}
      />

      {(data || isLoading || isError) && (
        <DropDownMenuDroppedElementsContainer>
          {data && data.data.length !== 0 && searchTerm !== "" && (
            <GamesResults games={data.data} />
          )}
          {data && data.data.length === 0 && (
            <p className="text-center">
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
