import { AnimatePresence, motion } from "framer-motion";
import slugify from "slugify";
import PriceTag from "../../game/PriceTag";
import { IGame } from "../../../models/game.model";
import { createContext, ReactNode, useCallback, useContext } from "react";
import LinkToDifferentPageWithCurrentPageInformation from "../../UI/LinkToDifferentPageWithCurrentPageInformation";
import HeaderLinkOrHeaderAnimation from "../../UI/headers/HeaderLinkOrHeaderAnimation";
import Header from "../../UI/headers/Header";

const gameContainerClasses =
  "w-full grid grid-cols-gameSearchBarResult items-center gap-2 px-6";

const GameResultContext = createContext<{ game: IGame | undefined }>({
  game: undefined,
});

const GameLink = ({
  children,
  useContainerClasses = false,
}: {
  children: ReactNode;
  useContainerClasses?: boolean;
}) => {
  const { game } = useContext(GameResultContext);
  const href = `/products/${slugify(game!.title, { lower: true })}`;
  return useContainerClasses ? (
    <LinkToDifferentPageWithCurrentPageInformation
      className={gameContainerClasses}
      to={href}
    >
      {children}
    </LinkToDifferentPageWithCurrentPageInformation>
  ) : (
    <HeaderLinkOrHeaderAnimation href={href}>
      <Header>{children}</Header>
    </HeaderLinkOrHeaderAnimation>
  );
};

export default function GamesResults<T extends IGame>({
  games,
  largeFormat = false,
  children,
  moveHighlight = true,
  headerLinkInsteadOfWholeGameContainer = false,
  AdditionalGameInformation,
}: {
  games: T[];
  largeFormat?: boolean;
  children?: ReactNode;
  moveHighlight?: boolean;
  headerLinkInsteadOfWholeGameContainer?: boolean;
  AdditionalGameInformation?: ({ game }: { game: T }) => ReactNode;
}) {
  const GameContainer = useCallback(
    ({ children }: { children: ReactNode }) =>
      headerLinkInsteadOfWholeGameContainer ? (
        <div className={gameContainerClasses}>{children}</div>
      ) : (
        <GameLink useContainerClasses={true}>{children}</GameLink>
      ),
    [headerLinkInsteadOfWholeGameContainer]
  );

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
                x: moveHighlight ? 10 : 0,
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
            layout="size"
          >
            <GameResultContext.Provider value={{ game }}>
              <GameContainer>
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
                      {!headerLinkInsteadOfWholeGameContainer ? (
                        game.title
                      ) : (
                        <GameLink>{game.title}</GameLink>
                      )}
                    </h2>
                  </figcaption>
                </figure>
                <div className="game-additional-information flex justify-center items-center gap-2 flex-wrap">
                  <PriceTag
                    price={game.price}
                    discount={game.discount}
                    finalPrice={game.finalPrice}
                    startAnimation
                    {...(!largeFormat && {
                      removeOriginalPriceAfterAnimation: true,
                    })}
                  />
                  {AdditionalGameInformation && (
                    <AdditionalGameInformation game={game} />
                  )}
                </div>
              </GameContainer>
            </GameResultContext.Provider>
          </motion.li>
        ))}
      </AnimatePresence>
    </motion.ul>
  );
}
