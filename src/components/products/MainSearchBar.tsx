import { useInput } from "../../hooks/useInput";
import Input from "../UI/Input";
import { useAppSelector } from "../../hooks/reduxStore";
import { actions } from "../../store/mainSearchBarSlice";

export default function MainSearchBar() {
  // const { searchTerm, setSearchTerm } = useContext(ProductsContext);

  const searchTerm = useAppSelector(
    (state) => state.mainSearchBarSlice.searchTerm
  );

  const { handleInputChange } = useInput({
    stateValue: searchTerm,
    setStateAction: actions.setSearchTerm,
  });

  return <Input onChange={handleInputChange} value={searchTerm} />;
}
