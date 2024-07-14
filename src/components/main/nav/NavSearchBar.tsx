import { useState } from "react";
import Input from "../../UI/Input";
import { useQuery } from "@tanstack/react-query";
import { load10GamesByQuery } from "../../../lib/fetch";
import LoadingFallback from "../../UI/LoadingFallback";
import Error from "../../UI/Error";
import { motion } from "framer-motion";
import { useInput } from "../../../hooks/useInput";
import { useAppSelector } from "../../../hooks/reduxStore";
import { actions } from "../../../store/mainSearchBarSlice";
import GamesResults from "./GamesResults";

export default function NavSearchBar({ placeholder }: { placeholder: string }) {
  const searchTerm = useAppSelector(
    (state) => state.mainSearchBarSlice.searchTerm
  );
  actions.setSearchTerm;
  const { handleInputChange, queryDebouncingState } = useInput({
    stateValue: searchTerm,
    setStateAction: actions.setSearchTerm,
    searchParamName: "query",
    debouncingTime: 500,
  });

  const { data, isLoading, error, isError } = useQuery({
    queryFn: ({ signal }) => load10GamesByQuery(queryDebouncingState, signal),
    queryKey: ["games", "search", queryDebouncingState],
    enabled: queryDebouncingState !== "",
  });

  const [showResults, setShowResults] = useState<boolean>(false);

  async function handleInputBlur() {
    await new Promise((resolve) => setTimeout(resolve, 50));
    setShowResults(false);
  }
  function handleInputFocus() {
    setShowResults(true);
  }
  function mouseEnterSearchResults() {
    setShowResults(true);
  }
  function mouseLeaveSearchResults() {
    setShowResults(false);
  }

  return (
    <div
      className="flex w-2/5 justify-end flex-col relative"
      onMouseEnter={mouseEnterSearchResults}
      onMouseLeave={mouseLeaveSearchResults}
    >
      <Input
        placeholder={placeholder}
        value={searchTerm}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        onFocus={handleInputFocus}
      />
      {(data || isLoading || isError) && (
        <motion.div
          className="bg-darkerBg py-5 absolute bottom-0 translate-y-[100%] flex justify-center overflow-y-scroll overflow-x-clip max-h-[40vh] z-100 w-full"
          initial={{ opacity: 0 }}
          animate={{
            opacity: showResults ? 1 : 0,
          }}
          exit={{ opacity: 0 }}
        >
          {data && data.data.length !== 0 && searchTerm !== "" && (
            <GamesResults games={data.data} />
          )}
          {data && data.data.length === 0 && (
            <p>There are no games which match with the provided query</p>
          )}
          {isLoading && <LoadingFallback />}
          {isError && <Error message={error.message} />}
        </motion.div>
      )}
    </div>
  );
}
