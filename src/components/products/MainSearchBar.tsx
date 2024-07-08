import { useContext } from "react";

import Input from "../UI/Input";
import { useAppSelector } from "../../hooks/reduxStore";
import { SearchCustomizationContext } from "../../store/SearchCustomizationContext";

export default function MainSearchBar() {
  const searchTerm = useAppSelector(
    (state) => state.mainSearchBarSlice.searchTerm
  );
  const { handleSearchTermChange } = useContext(SearchCustomizationContext);

  return (
    <Input
      onChange={handleSearchTermChange}
      value={searchTerm}
      placeholder="Look for a game"
    />
  );
}
