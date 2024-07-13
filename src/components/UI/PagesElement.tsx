import { motion } from "framer-motion";
import properties from "../../styles/properties";
import { useContext } from "react";
import { SliderProductElementArtworkContext } from "../main/slider/SliderProductElement";

export default function PagesElement({
  pageNr,
  setPageNr,
  totalAmountOfElementsToDisplayOnPages,
  amountOfElementsPerPage,
  insideSliderProductElementArtworkContext = false,
}: {
  pageNr: number;
  setPageNr: (newPageNr: number) => void;
  totalAmountOfElementsToDisplayOnPages: number | null;
  amountOfElementsPerPage: number;
  insideSliderProductElementArtworkContext?: boolean;
}) {
  const ctx = useContext(SliderProductElementArtworkContext);

  const PageNrToSelect = function ({
    pageNr,
    active = false,
  }: {
    pageNr: number;
    active?: boolean;
  }) {
    return (
      <motion.li
        className={active ? "text-highlightRed" : "cursor-pointer"}
        initial={!active ? { color: properties.defaultFont } : undefined}
        whileHover={
          !active
            ? {
                color: properties.highlightRed,
              }
            : undefined
        }
        onClick={
          !active
            ? () => {
                console.log(
                  Math.trunc(ctx.artworkIndex) !== pageNr,
                  ctx.artworkIndex,
                  pageNr,
                  ctx.artworkIndex
                );
                if (
                  insideSliderProductElementArtworkContext &&
                  ctx &&
                  Math.trunc(ctx.artworkIndex / 5) !== pageNr
                )
                  ctx.setArtworkIndex(pageNr * 5);
                setPageNr(pageNr);
              }
            : undefined
        }
      >
        {pageNr + 1}
      </motion.li>
    );
  };

  const maxPageNr =
    totalAmountOfElementsToDisplayOnPages === null
      ? null
      : Math.ceil(
          totalAmountOfElementsToDisplayOnPages / amountOfElementsPerPage
        ) === 0
      ? 0
      : Math.ceil(
          totalAmountOfElementsToDisplayOnPages / amountOfElementsPerPage
        ) - 1;

  return (
    <ul className="flex justify-center items-center gap-3">
      {pageNr - 2 <= 0 ? (
        Array.from({ length: pageNr }, (_, i) => (
          <PageNrToSelect pageNr={i} key={i}></PageNrToSelect>
        ))
      ) : (
        <>
          <PageNrToSelect pageNr={0} key={0}></PageNrToSelect>
          ...
          <PageNrToSelect pageNr={pageNr - 1} key={pageNr - 1}></PageNrToSelect>
        </>
      )}
      <PageNrToSelect pageNr={pageNr} key={pageNr} active></PageNrToSelect>
      {pageNr + 2 >= maxPageNr! ? (
        Array.from({ length: maxPageNr! - pageNr }, (_, i) => (
          <PageNrToSelect
            pageNr={i + pageNr + 1}
            key={i + pageNr + 1}
          ></PageNrToSelect>
        ))
      ) : (
        <>
          <PageNrToSelect pageNr={pageNr + 1} key={pageNr + 1}></PageNrToSelect>
          ...
          <PageNrToSelect pageNr={maxPageNr!} key={maxPageNr!}></PageNrToSelect>
        </>
      )}
    </ul>
  );
}
