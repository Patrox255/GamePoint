import { useContext } from "react";
import Button from "../../UI/Button";
import { SearchCustomizationContext } from "../../../store/SearchCustomizationContext";
import { ProductsContext } from "../../../store/ProductsContext";

export default function DiscountCustomization() {
  const { discountActive, setDiscountActive } = useContext(
    SearchCustomizationContext
  );
  const { isLoading, games } = useContext(ProductsContext);
  const areThereGamesOnSale = games.some((game) => game.discount > 0);

  console.log(games);

  if (!areThereGamesOnSale && discountActive && !isLoading)
    setDiscountActive(0);

  return (
    <article className="my-[-0.5rem]">
      <Button
        active={discountActive === 1}
        disabled={!areThereGamesOnSale}
        onClick={() =>
          discountActive === 0 ? setDiscountActive(1) : setDiscountActive(0)
        }
        canClickWhileActive
      >
        {isLoading
          ? "Loading results..."
          : discountActive === 0
          ? "Only on sale"
          : "Show also games with regular prices"}
      </Button>
    </article>
  );
}
