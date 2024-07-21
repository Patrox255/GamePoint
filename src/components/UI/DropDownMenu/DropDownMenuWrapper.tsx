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
  widthTailwindClass = "w-2/5",
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
        className={`flex ${widthTailwindClass} justify-end flex-col relative`}
        onMouseEnter={mouseEnterSearchResults}
        onMouseLeave={mouseLeaveSearchResults}
      >
        {children}
      </div>
    </DropDownMenuContext.Provider>
  );
}
