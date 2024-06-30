import { AnimatePresence } from "framer-motion";
import { ReactNode, useEffect, useState } from "react";

export default function DataSlider<ElementInterface>({
  elements,
  elementRenderFn,
}: {
  elements: ElementInterface[];
  elementRenderFn: (
    element: ElementInterface,
    isActive: boolean,
    i: number
  ) => ReactNode;
}) {
  const [activeElementIndex, setActiveElementIndex] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(
      () =>
        setActiveElementIndex((curActiveElementIndex) =>
          curActiveElementIndex === elements.length - 1
            ? 0
            : curActiveElementIndex + 1
        ),
      15000
    );

    return () => clearInterval(timer);
  }, [elements.length]);

  return (
    <div className="data-slider-container flex justify-center items-center text-center w-full">
      <AnimatePresence mode="wait">
        {elements.map((element, i) =>
          elementRenderFn(element, i === activeElementIndex, i)
        )}
      </AnimatePresence>
    </div>
  );
}
