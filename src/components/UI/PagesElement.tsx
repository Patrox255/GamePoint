/* eslint-disable react-refresh/only-export-components */
import { motion } from "framer-motion";
import { memo, useContext, useEffect } from "react";

import properties from "../../styles/properties";
import { SliderProductElementArtworkContext } from "../main/slider/SliderProductElement";
import { PagesManagerContext } from "../../store/products/PagesManagerContext";
import Error from "./Error";

export const calcMaxPossiblePageNr = (
  amountOfElements: number,
  elementsPerPage: number
) =>
  Math.ceil(amountOfElements / elementsPerPage) === 0
    ? 0
    : Math.ceil(amountOfElements / elementsPerPage) - 1;

const PagesElement = memo(
  ({
    propPageNr,
    propSetPageNr,
    totalAmountOfElementsToDisplayOnPages,
    amountOfElementsPerPage,
  }: {
    propPageNr?: number;
    propSetPageNr?: (newPageNr: number) => void;
    totalAmountOfElementsToDisplayOnPages: number | null;
    amountOfElementsPerPage: number;
  }) => {
    const { artworkIndex, setArtworkIndex } = useContext(
      SliderProductElementArtworkContext
    );
    const insideSliderProductElementArtworkContext = artworkIndex !== -1;
    const { pageNr: ctxPageNr, setPageNr: ctxSetPageNr } =
      useContext(PagesManagerContext);
    const insidePagesManagerContext = ctxPageNr !== -1;

    const pageNr =
      propPageNr !== undefined
        ? propPageNr
        : insidePagesManagerContext
        ? ctxPageNr
        : undefined;
    const setPageNr = propSetPageNr
      ? propSetPageNr
      : insidePagesManagerContext
      ? ctxSetPageNr
      : undefined;

    const maxPageNr =
      totalAmountOfElementsToDisplayOnPages === null
        ? null
        : calcMaxPossiblePageNr(
            totalAmountOfElementsToDisplayOnPages,
            amountOfElementsPerPage
          );

    useEffect(() => {
      if (maxPageNr === null || pageNr === undefined || !setPageNr) return;

      if (pageNr > maxPageNr) setPageNr(maxPageNr);
    }, [
      amountOfElementsPerPage,
      pageNr,
      setPageNr,
      maxPageNr,
      totalAmountOfElementsToDisplayOnPages,
    ]);

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
                  if (
                    insideSliderProductElementArtworkContext &&
                    Math.trunc(artworkIndex / 5) !== pageNr
                  )
                    setArtworkIndex(pageNr * 5);
                  setPageNr!(pageNr);
                }
              : undefined
          }
        >
          {pageNr + 1}
        </motion.li>
      );
    };

    let content;
    if (pageNr === undefined || !setPageNr)
      content = (
        <Error message="Must provide page number to this component via pages manager context or directly by props" />
      );
    else if (!totalAmountOfElementsToDisplayOnPages) content = <></>;
    else
      content = (
        <ul className="flex justify-center items-center gap-3">
          {pageNr - 2 <= 0 ? (
            Array.from({ length: pageNr }, (_, i) => (
              <PageNrToSelect pageNr={i} key={i}></PageNrToSelect>
            ))
          ) : (
            <>
              <PageNrToSelect pageNr={0} key={0}></PageNrToSelect>
              ...
              <PageNrToSelect
                pageNr={pageNr - 1}
                key={pageNr - 1}
              ></PageNrToSelect>
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
              <PageNrToSelect
                pageNr={pageNr + 1}
                key={pageNr + 1}
              ></PageNrToSelect>
              ...
              <PageNrToSelect
                pageNr={maxPageNr!}
                key={maxPageNr!}
              ></PageNrToSelect>
            </>
          )}
        </ul>
      );

    return content;
  }
);

export default PagesElement;
