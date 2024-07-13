import { memo, useContext, useMemo } from "react";
import { motion } from "framer-motion";

import Button from "../../UI/Button";
import { SliderProductElementArtworkContext } from "./SliderProductElement";
import useCompareComplexForUseMemo from "../../../hooks/useCompareComplexForUseMemo";

const SliderImageOverview = memo(function ({
  imagesArr,
  pageNr,
  setPageNr,
}: {
  imagesArr: string[];
  pageNr?: number;
  setPageNr?: (newPageNr: number) => void;
}) {
  const { artworkIndex, setArtworkIndex } = useContext(
    SliderProductElementArtworkContext
  );

  const generateSubsetsOf5 = (imagesArr: string[]) => {
    const subsets: string[][] = [];
    imagesArr.forEach((image, i) => {
      const subsetIndex = Math.trunc(i / 5);
      subsets[subsetIndex] === undefined
        ? (subsets[subsetIndex] = [image])
        : subsets[subsetIndex].push(image);
    });
    console.log(subsets);
    return subsets;
  };

  const stableImagesArr = useCompareComplexForUseMemo(imagesArr);

  const subsetsOf5 = useMemo(
    () => generateSubsetsOf5(stableImagesArr),
    [stableImagesArr]
  );

  console.log(setPageNr);

  if (
    pageNr !== undefined &&
    setPageNr !== undefined &&
    Math.trunc(artworkIndex) !== pageNr
  )
    setPageNr!(Math.trunc(artworkIndex / 5));

  console.log(pageNr);

  return (
    <nav className="slider-image-navigation w-full py-10 overflow-hidden flex justify-center items-center">
      <motion.ul
        className="w-full flex relative justify-center items-center"
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
        initial="hidden"
        animate="visible"
      >
        {subsetsOf5.map((subsetOf5, subsetIndex) => (
          <motion.div
            className="w-full flex gap-6 absolute left-0 justify-center items-center"
            key={`subset-${subsetIndex}`}
            initial={{
              translateX: `${subsetIndex * 100}%`,
            }}
            animate={{
              translateX: `${(subsetIndex - (pageNr ? pageNr : 0)) * 100}%`,
            }}
          >
            {subsetOf5.map((imageUrl, i) => {
              const isActive = i + subsetIndex * 5 === artworkIndex;

              return (
                <li key={imageUrl}>
                  <Button
                    active={isActive}
                    passedKey={`${imageUrl} ${isActive ? "active" : ""}`}
                    additionalTailwindCSS={{ px: "px-8", py: "py-5" }}
                    onClick={() => setArtworkIndex(i + subsetIndex * 5)}
                  ></Button>
                </li>
              );
            })}
          </motion.div>
        ))}
      </motion.ul>
    </nav>
  );
});

export default SliderImageOverview;
