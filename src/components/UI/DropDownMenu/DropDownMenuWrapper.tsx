import { createContext, ReactNode, useState } from "react";

export const DropDownMenuContext = createContext<{
  showResults: boolean | undefined;
  setShowResults: (showResults: boolean) => void;
}>({
  showResults: undefined,
  setShowResults: () => {},
});

export default function DropDownMenuWrapper({
  children,
  widthTailwindClass = "lg:w-2/5 w-32 xs:w-52",
}: {
  children: ReactNode;
  widthTailwindClass?: React.HTMLAttributes<HTMLDivElement>["className"];
}) {
  const [showResults, setShowResults] = useState<boolean>(false);

  function mouseEnterSearchResults() {
    setShowResults(true);
  }
  function mouseLeaveSearchResults() {
    setShowResults(false);
  }

  return (
    <DropDownMenuContext.Provider value={{ showResults, setShowResults }}>
      <div
        className={`flex ${widthTailwindClass} items-end flex-col relative`}
        onMouseEnter={mouseEnterSearchResults}
        onMouseLeave={mouseLeaveSearchResults}
      >
        {children}
      </div>
    </DropDownMenuContext.Provider>
  );
}
