import { useContext } from "react";

import Input from "../UI/Input";
import { useAppSelector } from "../../hooks/reduxStore";
import { ProductsContext } from "../../store/ProductsContext";

export default function MainSearchBar() {
  const searchTerm = useAppSelector(
    (state) => state.mainSearchBarSlice.searchTerm
  );
  const { handleSearchTermChange } = useContext(ProductsContext);

  return (
    <Input
      onChange={handleSearchTermChange}
      value={searchTerm}
      placeholder="Look for a game"
    />
  );
}
