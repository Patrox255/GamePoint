import { useContext } from "react";

import Input from "../UI/Input";
import { SearchCustomizationContext } from "../../store/products/SearchCustomizationContext";

export default function MainSearchBar() {
  const searchTerm = useContext(SearchCustomizationContext).searchTerm;
  const { handleSearchTermChange } = useContext(SearchCustomizationContext);

  return (
    <Input
      onChange={handleSearchTermChange}
      value={searchTerm}
      placeholder="Look for a game"
    />
  );
}
