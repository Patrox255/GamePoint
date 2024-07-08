import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import slugify from "slugify";
import PriceTag from "../../game/PriceTag";
import { IGame } from "../../../models/game.model";
import { ReactNode } from "react";

export default function GamesResults({
  games,
  largeFormat = false,
  children,
}: {
  games: IGame[];
  largeFormat?: boolean;
  children?: ReactNode;
}) {
  return (
    <motion.ul
      className="w-full grid gap-2 text-center"
      variants={{
        highlighted: {
          opacity: 1,
        },
        normal: {
          opacity: 1,
        },
        disappear: {
          opacity: 0,
        },
      }}
      initial="disappear"
      animate="normal"
    >
      <AnimatePresence>
        {children}
        {games.map((game) => (
          <motion.li
            key={game.title}
            variants={{
              highlighted: {
                opacity: 1,
                x: 10,
              },
              normal: {
                opacity: largeFormat ? 0.5 : 0.8,
                x: 0,
                scale: 1,
              },
              disappear: {
                opacity: 0,
                x: 0,
                scale: 1.5,
              },
            }}
            initial="disappear"
            animate="normal"
            exit="disappear"
            whileHover="highlighted"
            layout
          >
            <Link
              className="w-full grid grid-cols-gameSearchBarResult items-center gap-2 px-6"
              to={`/products/${slugify(game.title, { lower: true })}`}
            >
              <figure className="grid grid-cols-2 items-center gap-2 justify-center">
                {game.artworks.length !== 0 ? (
                  <img
                    src={game.artworks[0].replace(
                      "720p",
                      largeFormat ? "screenshot_big" : "logo_med"
                    )}
                    className={`m-auto h-auto rounded-xl w-full ${
                      largeFormat ? "max-w-sm" : "max-w-36"
                    }`}
                  />
                ) : (
                  <div className="py-6">
                    Failed to retrieve an image of the game
                  </div>
                )}

                <figcaption>
                  <h2
                    className={`text-highlightRed font-bold min-w-2/5 ${
                      largeFormat ? "text-2xl" : "text-lg"
                    }`}
                  >
                    {game.title}
                  </h2>
                </figcaption>
              </figure>
              <PriceTag
                price={game.price}
                discount={game.discount}
                finalPrice={game.finalPrice}
                startAnimation
                {...(!largeFormat && {
                  removeOriginalPriceAfterAnimation: true,
                })}
              />
            </Link>
          </motion.li>
        ))}
      </AnimatePresence>
    </motion.ul>
  );
}
