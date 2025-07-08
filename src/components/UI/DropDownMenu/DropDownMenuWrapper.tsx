import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

export const DropDownMenuContext = createContext<{
  showResults: boolean | undefined;
  setShowResults: (showResults: boolean) => void;
}>({
  showResults: undefined,
  setShowResults: () => {},
});

// This array is used to store functions that can set the showResults and activatedViaMouseHover flags in order to hide all of
// the dropdown menus when one of them is hovered over (because if it's clicked then such thing is already handled).
const setShowResultsAndMouseHoverFlagFunctions: Array<(val: boolean) => void> =
  [];

export default function DropDownMenuWrapper({
  children,
  widthTailwindClass = "lg:w-2/5 w-32 xs:w-52",
}: {
  children: ReactNode;
  widthTailwindClass?: React.HTMLAttributes<HTMLDivElement>["className"];
}) {
  const [showResults, setShowResults] = useState<boolean>(false);
  const [activatedViaMouseHover, setActivatedViaMouseHover] =
    useState<boolean>(false);
  const dropDownMenuWrapperRef = useRef<HTMLDivElement>(null);

  const setShowResultsAndMouseHoverFlag = useCallback((val: boolean) => {
    setShowResults(val);
    setActivatedViaMouseHover(val);
  }, []);

  const hideEveryDropDownMenuExceptCurrent = useCallback(() => {
    setShowResultsAndMouseHoverFlagFunctions.forEach((setFunction) => {
      if (setFunction !== setShowResultsAndMouseHoverFlag) {
        setFunction(false);
      }
    });
  }, [setShowResultsAndMouseHoverFlag]);

  const handleMouseClickStable = useCallback(
    (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest(
        ".drop-down-menu-wrapper"
      );
      if (target === dropDownMenuWrapperRef.current) {
        hideEveryDropDownMenuExceptCurrent();
        setShowResults(true);
        setActivatedViaMouseHover(false);
        return;
      }
      setShowResults(false);
    },
    [hideEveryDropDownMenuExceptCurrent]
  );

  useEffect(() => {
    document.addEventListener("click", handleMouseClickStable);

    return () => {
      document.removeEventListener("click", handleMouseClickStable);
    };
  }, [handleMouseClickStable]);

  useEffect(() => {
    setShowResultsAndMouseHoverFlagFunctions.push(
      setShowResultsAndMouseHoverFlag
    );

    return () => {
      setShowResultsAndMouseHoverFlagFunctions.splice(
        setShowResultsAndMouseHoverFlagFunctions.indexOf(
          setShowResultsAndMouseHoverFlag
        ),
        1
      );
    };
  });

  return (
    <DropDownMenuContext.Provider value={{ showResults, setShowResults }}>
      <div
        className={`drop-down-menu-wrapper flex ${widthTailwindClass} items-end flex-col relative`}
        ref={dropDownMenuWrapperRef}
        onMouseEnter={() => {
          if (activatedViaMouseHover || showResults) return;
          hideEveryDropDownMenuExceptCurrent();
          setShowResults(true);
          setActivatedViaMouseHover(true);
        }}
        onMouseLeave={() => {
          if (!activatedViaMouseHover || !showResults) return;
          setShowResults(false);
          setActivatedViaMouseHover(false);
        }}
      >
        {children}
      </div>
    </DropDownMenuContext.Provider>
  );
}
