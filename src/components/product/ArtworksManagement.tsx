/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AnimatePresence,
  motion,
  animate,
  AnimationProps,
} from "framer-motion";

import useCompareComplexForUseMemo from "../../hooks/useCompareComplexForUseMemo";
import Button from "../UI/Button";
import Error from "../UI/Error";
import ImageWithLoading from "../UI/ImageWithLoading";
import Header from "../UI/headers/Header";
import ArrowSVG from "../UI/ArrowSVG";
import leftArrowSVG from "../../assets/left-arrow.svg";
import rightArrowSVG from "../../assets/right-arrow.svg";
import HighlightCounter from "../UI/HighlightCounter";
import { userOrdersComponentsMotionProperties } from "../../store/userPanel/UserOrdersManagerOrdersDetailsContext";

interface IStoredArtworkWithCustomInformation {
  url: string;
  custom: boolean;
  fileName?: string; // only if custom is true
}
type storedArtworksWithCustomInformation =
  IStoredArtworkWithCustomInformation[];

export const useGenerateBasicArtworksManagementState = function (
  initialArtworksArrStable?: string[]
) {
  const [currentArtworks, setCurrentArtworksStable] =
    useState<storedArtworksWithCustomInformation>(
      initialArtworksArrStable
        ? initialArtworksArrStable.map((initialArtworksArrStableEntry) => ({
            url: initialArtworksArrStableEntry,
            custom: false,
          }))
        : []
    );
  const [currentArtworkIndexOverride, setCurrentArtworkIndexOverride] =
    useState(0);
  const currentArtworksStable = useCompareComplexForUseMemo(currentArtworks);

  console.log(currentArtworksStable);

  return {
    currentArtworkIndexOverride,
    setCurrentArtworkIndexOverride,
    currentArtworksStable,
    setCurrentArtworksStable,
  };
};

type ArtworksManagementContextBody = {
  currentArtworksStable: storedArtworksWithCustomInformation;
  setCurrentArtworksStable: React.Dispatch<
    React.SetStateAction<storedArtworksWithCustomInformation>
  >;
  currentArtworkIndexOverride: number;
  setCurrentArtworkIndexOverride: React.Dispatch<React.SetStateAction<number>>;
};
export const ArtworksManagementContext =
  createContext<ArtworksManagementContextBody>({
    currentArtworksStable: [],
    setCurrentArtworksStable: () => {},
    currentArtworkIndexOverride: 0,
    setCurrentArtworkIndexOverride: () => {},
  });

export const ArtworksManagementContextProvider = function ({
  children,
  ...ctxBody
}: ArtworksManagementContextBody & { children?: ReactNode }) {
  return (
    <ArtworksManagementContext.Provider value={ctxBody}>
      {children}
    </ArtworksManagementContext.Provider>
  );
};

const artworksManagementOverviewContainerInitialAndExitMotionProperties: AnimationProps["initial"] =
  { opacity: 0, translateX: "3rem" };

export default function ArtworksManagement() {
  const {
    currentArtworksStable,
    setCurrentArtworksStable,
    currentArtworkIndexOverride,
    setCurrentArtworkIndexOverride,
  } = useContext(ArtworksManagementContext);
  const [loadingArtwork, setLoadingArtwork] = useState(false);
  const [loadingArtworkToDisplay, setLoadingArtworkToDisplay] = useState(false);
  const [loadingArtworkError, setLoadingArtworkError] = useState(false);
  const fileReader = useMemo(() => new FileReader(), []);
  const fileUploadInput = useRef<HTMLInputElement>(null);
  const fileName = useRef<string>();

  useEffect(() => {
    const handleFileRead = (e: ProgressEvent<FileReader>) => {
      setLoadingArtwork(false);
      if (!e.target?.result) return setLoadingArtworkError(true);
      setLoadingArtworkError(false);
      setCurrentArtworksStable((oldCurrentArtworksStable) => [
        ...oldCurrentArtworksStable,
        {
          url: e.target!.result as string,
          custom: true,
          fileName: fileName.current,
        },
      ]);
      console.log(currentArtworksStable.length);
      setCurrentArtworkIndexOverride(currentArtworksStable.length);
    };

    fileReader.addEventListener("load", handleFileRead);

    return () => {
      fileReader.removeEventListener("load", handleFileRead);
    };
  }, [
    currentArtworksStable.length,
    fileReader,
    setCurrentArtworkIndexOverride,
    setCurrentArtworksStable,
  ]);

  const currentArtworkIndex = currentArtworksStable[currentArtworkIndexOverride]
    ? currentArtworkIndexOverride
    : currentArtworksStable.length - 1;
  const currentArtwork = currentArtworksStable[currentArtworkIndex];

  const removeCurrentArtwork = useCallback(() => {
    setCurrentArtworksStable((oldCurrentArtworksStable) =>
      oldCurrentArtworksStable.filter((_, i) => i !== currentArtworkIndex)
    );
  }, [setCurrentArtworksStable, currentArtworkIndex]);

  const modifyCurrentArtworkIndexToOverride = useCallback(
    (modification: number) => {
      setCurrentArtworkIndexOverride((currentArtworkIndexOverride) => {
        const modifiedArtworkIndex = currentArtworkIndexOverride + modification;
        const lastArtworksIndex = currentArtworksStable.length - 1;
        if (modifiedArtworkIndex < 0) return lastArtworksIndex;
        if (modifiedArtworkIndex > lastArtworksIndex) return 0;
        return modifiedArtworkIndex;
      });
      setLoadingArtworkToDisplay(true);
    },
    [currentArtworksStable.length, setCurrentArtworkIndexOverride]
  );

  useEffect(() => {
    currentArtwork && setLoadingArtworkToDisplay(true);
  }, [currentArtwork]);
  const additionalActionOnLoadArtworkLoadFn = useCallback(() => {
    animate("#artworks-management-overview-container", {
      opacity: 1,
      transform: "translateX(0)",
    });
    setLoadingArtworkToDisplay(false);
  }, []);
  const blockControlsDuringAnimationProp = {
    disabled: loadingArtwork || loadingArtworkToDisplay,
  };

  console.log(currentArtworkIndexOverride, currentArtworksStable.length);

  return (
    <section
      id="artworks-management-container"
      className="w-full flex justify-center gap-4 transition-all"
    >
      <section
        id="artworks-management-overview"
        className="max-w-[75%] self-stretch flex justify-center items-center flex-col"
      >
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.currentTarget.files?.[0];
            if (!file || file.size === 0) return setLoadingArtworkError(true);
            setLoadingArtwork(true);
            fileName.current = file.name;
            fileReader.readAsDataURL(file);
          }}
          {...blockControlsDuringAnimationProp}
          ref={fileUploadInput}
        />
        <AnimatePresence mode="wait">
          {currentArtwork ? (
            <AnimatePresence mode="wait">
              <motion.section
                id="artworks-management-overview-container"
                className="transition-all"
                key={currentArtwork.url}
                initial={
                  artworksManagementOverviewContainerInitialAndExitMotionProperties
                }
                exit={
                  artworksManagementOverviewContainerInitialAndExitMotionProperties as AnimationProps["exit"]
                }
              >
                <ImageWithLoading
                  src={currentArtwork.url}
                  className="rounded-xl"
                  additionalActionOnLoadFn={additionalActionOnLoadArtworkLoadFn}
                />
              </motion.section>
            </AnimatePresence>
          ) : (
            <Header
              key="artworks-management-overview-container-header"
              motionAnimationProperties={{
                ...userOrdersComponentsMotionProperties,
              }}
            >
              No artwork has been uploaded yet!
            </Header>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {currentArtworksStable.length >= 2 && (
            <motion.section
              className="flex justify-between items-center self-stretch"
              id="artworks-management-current-artwork-controls"
              {...userOrdersComponentsMotionProperties}
            >
              <ArrowSVG
                arrowSrc={leftArrowSVG}
                alt="Arrow pointing to the left"
                onClick={() => modifyCurrentArtworkIndexToOverride(-1)}
                {...blockControlsDuringAnimationProp}
              />
              <ArrowSVG
                arrowSrc={rightArrowSVG}
                alt="Arrow pointing to the right"
                onClick={() => modifyCurrentArtworkIndexToOverride(1)}
                translateXVal="2rem"
                {...blockControlsDuringAnimationProp}
              />
            </motion.section>
          )}
        </AnimatePresence>
        {loadingArtworkError && (
          <Error
            smallVersion
            message="Failed to upload the selected artwork!"
          />
        )}
      </section>
      <section
        id="artworks-management-controls"
        className="self-stretch w-1/4 flex flex-col items-center justify-center gap-4"
      >
        <Button
          type="button"
          onClick={() => fileUploadInput.current?.click()}
          {...blockControlsDuringAnimationProp}
        >
          {loadingArtwork ? "Loading selected artwork..." : "Select an artwork"}
        </Button>
        <AnimatePresence>
          {currentArtworksStable.length > 0 && (
            <motion.section {...userOrdersComponentsMotionProperties}>
              <HighlightCounter size="large">
                {currentArtworkIndex + 1}
              </HighlightCounter>
            </motion.section>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {currentArtwork && (
            <motion.section {...userOrdersComponentsMotionProperties}>
              <Button
                type="button"
                onClick={removeCurrentArtwork}
                {...blockControlsDuringAnimationProp}
              >
                Remove an artwork
              </Button>
            </motion.section>
          )}
        </AnimatePresence>
      </section>
    </section>
  );
}
