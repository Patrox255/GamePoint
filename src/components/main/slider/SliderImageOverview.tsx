import { useContext } from "react";
import Button from "../../UI/Button";
import { SliderProductElementArtworkContext } from "./SliderProductElement";

export default function SliderImageOverview({
  imagesArr,
}: {
  imagesArr: string[];
}) {
  const { artworkIndex, setArtworkIndex } = useContext(
    SliderProductElementArtworkContext
  );

  return (
    <nav className="slider-image-navigation w-full py-6">
      <ul className="w-full flex justify-center items-center gap-6">
        {imagesArr.map((imageUrl, i) => {
          const isActive = i === artworkIndex;

          return (
            <li key={imageUrl}>
              <Button
                active={isActive}
                passedKey={`${imageUrl} ${isActive ? "active" : ""}`}
                additionalTailwindCSS={{ px: "px-8", py: "py-5" }}
                onClick={() => setArtworkIndex(i)}
              ></Button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
