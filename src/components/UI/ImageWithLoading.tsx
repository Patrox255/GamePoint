import { AnimationProps, motion } from "framer-motion";
import { useState } from "react";
import LoadingFallback from "./LoadingFallback";
import Error from "./Error";

export default function ImageWithLoading({
  src,
  className = "",
  motionAnimation,
  additionalActionOnLoadFn,
}: {
  src: string;
  className?: string;
  motionAnimation?: AnimationProps;
  additionalActionOnLoadFn?: () => void;
}) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  const motionAnimationEdited = {
    ...motionAnimation,
    animate:
      isLoading || !motionAnimation?.animate ? {} : motionAnimation.animate,
  };

  return (
    <>
      {isLoading && !isError && (
        <LoadingFallback customText="Loading an image..." />
      )}
      {isError ? (
        <Error message="Failed to load an image!" />
      ) : (
        <motion.img
          src={src}
          className={className}
          {...motionAnimationEdited}
          key={src}
          onError={() => {
            setIsError(true);
            additionalActionOnLoadFn && additionalActionOnLoadFn();
          }}
          onLoad={() => {
            setIsLoading(false);
            additionalActionOnLoadFn && additionalActionOnLoadFn();
          }}
        />
      )}
    </>
  );
}
