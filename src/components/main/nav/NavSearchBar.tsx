import { useState } from "react";
import Input from "../../UI/Input";
import { useQuery } from "@tanstack/react-query";
import { load10GamesByQuery } from "../../../lib/fetch";
import LoadingFallback from "../../UI/LoadingFallback";
import Error from "../../UI/Error";
import { motion } from "framer-motion";
// import { NavSearchBarContext } from "../../UI/Nav";
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
  console.log(searchTerm);

  const { data, isLoading, error, isError } = useQuery({
    queryFn: ({ signal }) => load10GamesByQuery(queryDebouncingState, signal),
    queryKey: ["games", "search", queryDebouncingState],
    enabled: queryDebouncingState !== "",
  });

  const [showResults, setShowResults] = useState<boolean>(false);

  function handleInputBlur() {
    setShowResults(false);
  }
  function handleInputFocus() {
    setShowResults(true);
  }

  return (
    <div className="flex w-2/5 justify-end flex-col relative">
      <Input
        placeholder={placeholder}
        value={searchTerm}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        onFocus={handleInputFocus}
      />
      {(data || isLoading || isError) && showResults && (
        <motion.div
          className="bg-darkerBg py-5 absolute bottom-0 w-full translate-y-[100%] flex justify-center overflow-y-scroll overflow-x-clip max-h-[70vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
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
