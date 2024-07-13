import { useContext } from "react";
import Input from "../../UI/Input";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { retrieveMinAndMaxOfExistingPrices } from "../../../lib/fetch";
import LoadingFallback from "../../UI/LoadingFallback";
import Error from "../../UI/Error";
import { SearchCustomizationContext } from "../../../store/products/SearchCustomizationContext";
import Button from "../../UI/Button";

export default function PriceCustomization() {
  const { minPrice, maxPrice, handleMaxChange, handleMinChange } = useContext(
    SearchCustomizationContext
  );

  function handleSetPriceValue(type: "min" | "max", inputString: string) {
    const value = parseFloat(inputString);
    type === "min"
      ? handleMinChange(inputString)
      : handleMaxChange(inputString);
    type === "min" && value > maxPrice && handleMaxChange(inputString);
    type === "max" && value < minPrice && handleMinChange(inputString);
  }

  const { isLoading, data, error, isError } = useQuery({
    queryFn: ({ signal }) => retrieveMinAndMaxOfExistingPrices(signal),
    queryKey: ["games", "prices"],
  });

  let content;
  if (isLoading) content = <LoadingFallback />;
  else if (isError) content = <Error message={error?.message} />;
  else {
    const min = data?.data.min;
    const max = data?.data.max;
    !isNaN(minPrice) && minPrice < min! && handleMinChange(min! + "");
    !isNaN(maxPrice) && maxPrice > max! && handleMaxChange(max! + "");
    const onlyFreeToPlay = minPrice === 0 && maxPrice === 0;
    const canSetToFreeToPlay = min === 0;
    content = (
      <>
        <article className="flex flex-row w-full justify-center items-center gap-3">
          <Input
            width="w-1/4"
            placeholder="Min"
            type="number"
            min={min}
            max={max}
            step={0.01}
            value={minPrice}
            onChange={(s) => handleSetPriceValue("min", s)}
          />
          <motion.div
            className="relative w-1/2 h-[10px] bg-darkerBg"
            initial={{ opacity: 0.7 }}
            whileHover={{ opacity: 1 }}
          >
            <Input
              width="w-full"
              type="range"
              useBorder={false}
              useShadow={false}
              useOpacity={true}
              additionalTailwindClasses="absolute top-0 left-0 z-1 !h-0"
              onChange={(s) => handleSetPriceValue("min", s)}
              min={min}
              max={max}
              step={0.01}
              value={isNaN(minPrice) ? 0 : minPrice}
            />
            <Input
              width="w-full"
              type="range"
              useBorder={false}
              useShadow={false}
              useOpacity={true}
              additionalTailwindClasses="absolute top-0 left-0"
              onChange={(s) => handleSetPriceValue("max", s)}
              min={min}
              max={max}
              step={0.01}
              value={isNaN(maxPrice) ? 100 : maxPrice}
            />
          </motion.div>
          <Input
            width="w-1/4"
            placeholder="Max"
            type="number"
            min={min}
            max={max}
            step={0.01}
            value={maxPrice}
            onChange={(s) => handleSetPriceValue("max", s)}
          />
        </article>

        <Button
          disabled={!canSetToFreeToPlay}
          active={onlyFreeToPlay}
          onClick={() => {
            handleMinChange("0");
            handleMaxChange("0");
          }}
        >
          {!canSetToFreeToPlay
            ? "There are currently no free to play games available"
            : "Free To Play"}
        </Button>
      </>
    );
  }
  return content;
}
