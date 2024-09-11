/* eslint-disable react-refresh/only-export-components */
import {
  AnimatePresence,
  LayoutProps,
  motion,
  VariantLabels,
  Variants,
} from "framer-motion";
import slugify from "slugify";
import { createContext, ReactNode, useContext, useMemo } from "react";

import PriceTag from "../../game/PriceTag";
import { IGame } from "../../../models/game.model";
import LinkToDifferentPageWithCurrentPageInformation from "../../UI/LinkToDifferentPageWithCurrentPageInformation";
import HeaderLinkOrHeaderAnimation from "../../UI/headers/HeaderLinkOrHeaderAnimation";
import Header from "../../UI/headers/Header";
import { ProductsSearchCustomizationCustomInformationContext } from "../../../store/products/ProductsSearchCustomizationCustomInformationContext";

const gameContainerClasses =
  "w-full grid grid-cols-gameSearchBarResult items-center gap-2 px-6";

export const dropdownListElementsMotionConfigurationGenerator: (
  moveHighlight?: boolean,
  largeFormat?: boolean
) => {
  variants: Variants;
} & Record<"initial" | "animate" | "exit" | "whileHover", VariantLabels> & {
    layout: LayoutProps["layout"];
  } = (moveHighlight, largeFormat) => ({
  variants: {
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
  },
  initial: "disappear",
  animate: "normal",
  exit: "disappear",
  whileHover: "highlighted",
  layout: "size",
});

export const GameResultContext = createContext<{
  game: IGame | undefined;
  showQuantityAndFinalPrice: boolean;
  headerLinkInsteadOfWholeGameContainer?: boolean;
}>({
  game: undefined,
  showQuantityAndFinalPrice: false,
  headerLinkInsteadOfWholeGameContainer: false,
});

const GameContainer = function ({ children }: { children: ReactNode }) {
  const { game, headerLinkInsteadOfWholeGameContainer } =
    useContext(GameResultContext);
  const { productEntryOnClickStableFn } = useContext(
    ProductsSearchCustomizationCustomInformationContext
  );
  return headerLinkInsteadOfWholeGameContainer ||
    productEntryOnClickStableFn ? (
    <div
      className={`${gameContainerClasses} ${
        productEntryOnClickStableFn ? "cursor-pointer" : ""
      }`}
      onClick={
        productEntryOnClickStableFn
          ? () => productEntryOnClickStableFn(game as IGame)
          : undefined
      }
    >
      {children}
    </div>
  ) : (
    <GameLink useContainerClasses={true}>{children}</GameLink>
  );
};

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
  showQuantityAndFinalPrice = false,
}: {
  games: T[];
  largeFormat?: boolean;
  children?: ReactNode;
  moveHighlight?: boolean;
  headerLinkInsteadOfWholeGameContainer?: boolean;
  AdditionalGameInformation?: ({ game }: { game: T }) => ReactNode;
  showQuantityAndFinalPrice?: boolean;
}) {
  const gameResultEntryElementMotionConfiguration = useMemo(
    () =>
      dropdownListElementsMotionConfigurationGenerator(
        moveHighlight,
        largeFormat
      ),
    [largeFormat, moveHighlight]
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
            {...gameResultEntryElementMotionConfiguration}
          >
            <GameResultContext.Provider
              value={{
                game,
                showQuantityAndFinalPrice,
                headerLinkInsteadOfWholeGameContainer,
              }}
            >
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
