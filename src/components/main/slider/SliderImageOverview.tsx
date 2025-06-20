import { memo, useContext, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

import Button from "../../UI/Button";
import { SliderProductElementArtworkContext } from "./SliderProductElement";
import useCompareComplexForUseMemo from "../../../hooks/useCompareComplexForUseMemo";
import { PagesManagerContext } from "../../../store/products/PagesManagerContext";
import { debounce } from "lodash";

const SliderImageOverview = memo(function ({
  imagesArr,
}: {
  imagesArr: string[];
}) {
  const { artworkIndex, setArtworkIndex } = useContext(
    SliderProductElementArtworkContext
  );
  const subsetContainerRef = useRef<HTMLDivElement>(null);
  const subsetsContainerRef = useRef<HTMLUListElement>(null);
  const [subsetContainerHeight, setSubsetContainerHeight] = useState(0);

  const { pageNr } = useContext(PagesManagerContext);
  const insidePagesManagerContext = pageNr !== -1;

  const generateSubsetsOf5 = (imagesArr: string[]) => {
    const subsets: string[][] = [];
    imagesArr.forEach((image, i) => {
      const subsetIndex = Math.trunc(i / 5);
      subsets[subsetIndex] === undefined
        ? (subsets[subsetIndex] = [image])
        : subsets[subsetIndex].push(image);
    });
    return subsets;
  };

  const stableImagesArr = useCompareComplexForUseMemo(imagesArr);

  const subsetsOf5 = useMemo(
    () => generateSubsetsOf5(stableImagesArr),
    [stableImagesArr]
  );

  useEffect(() => {
    setSubsetContainerHeight(
      subsetContainerRef.current?.getBoundingClientRect().height || 0
    );
  }, [pageNr]);

  const debouncedSetHeight = useMemo(
    () => debounce((height: number) => setSubsetContainerHeight(height), 100),
    []
  );

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const entrySubsetId = entry.target.getAttribute("data-subset-id");
        if (!entrySubsetId || parseInt(entrySubsetId) != pageNr) continue;
        console.log(
          entrySubsetId,
          subsetContainerRef.current?.getBoundingClientRect().height || 0
        );
        debouncedSetHeight(
          subsetContainerRef.current?.getBoundingClientRect().height || 0
        );
      }
    });

    subsetsContainerRef.current?.children &&
      Array.from(subsetsContainerRef.current?.children).forEach((subset) =>
        observer.observe(subset)
      );

    return () => {
      observer.disconnect();
    };
  }, [debouncedSetHeight, pageNr]);

  // useEffect(() => {
  //   if (!insidePagesManagerContext || Math.trunc(artworkIndex / 5) === pageNr)
  //     return;
  //   setPageNr(Math.trunc(artworkIndex / 5));
  // }, [insidePagesManagerContext, artworkIndex, pageNr, setPageNr]);

  return (
    <motion.nav
      className={`slider-image-navigation w-full pt-10 overflow-hidden flex justify-center items-center mb-6 h-full`}
      initial={{ paddingBottom: 0 }}
      animate={{ paddingBottom: `${subsetContainerHeight}px` }}
    >
      <motion.ul
        className="w-full flex relative justify-center items-center h-full"
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
        initial="hidden"
        animate="visible"
        ref={subsetsContainerRef}
      >
        {subsetsOf5.map((subsetOf5, subsetIndex) => (
          <motion.div
            className="w-full flex gap-6 left-0 justify-center items-center flex-wrap absolute top-0"
            key={`subset-${subsetIndex}`}
            initial={{
              translateX: `${subsetIndex * 100}%`,
            }}
            animate={{
              translateX: `${
                (subsetIndex - (insidePagesManagerContext ? pageNr : 0)) * 100
              }%`,
            }}
            ref={pageNr === subsetIndex ? subsetContainerRef : null}
            data-subset-id={subsetIndex}
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
    </motion.nav>
  );
});

export default SliderImageOverview;
