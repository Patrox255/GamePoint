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

import PriceTag, {
  priceTagFontSizeMediaQueryKeyToCSSPropertyValueMap,
} from "../../game/PriceTag";
import { IGame } from "../../../models/game.model";
import LinkToDifferentPageWithCurrentPageInformation from "../../UI/LinkToDifferentPageWithCurrentPageInformation";
import HeaderLinkOrHeaderAnimation from "../../UI/headers/HeaderLinkOrHeaderAnimation";
import Header from "../../UI/headers/Header";
import { ProductsSearchCustomizationCustomInformationContext } from "../../../store/products/ProductsSearchCustomizationCustomInformationContext";
import { SearchCustomizationContext } from "../../../store/products/SearchCustomizationContext";
import {
  useWindowMatchMediaQueriesCSSPropertiesMap,
  windowMatchMediaQueriesCSSPropertiesMap,
} from "../../../hooks/RWD/useWindowMatchMediaQueriesPropertiesMap";
import { OnCartPageContext } from "../../../store/cartPage/OnCartPageContext";
import { OrderSummaryCartInformationContext } from "../../orderPage/OrderSummary";
import { UpdateOrderDetailsContext } from "../../../store/userPanel/admin/orders/UpdateOrderDetailsContext";
import { ManageProductsContext } from "../../../store/userPanel/admin/products/ManageProductsContext";

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
  // In case of using GamesResults component on the cart page I want to modify its appearance based on screen dimensions
  const onCartPage = useContext(OnCartPageContext);

  const insideOrderSummaryContext = useContext(
    OrderSummaryCartInformationContext
  )?.insideOrderSummaryContext;
  const onAdminPanelModifyOrderPage =
    useContext(UpdateOrderDetailsContext)?.selectedOrderFromList !== "";
  const onManageProductsPage = useContext(
    ManageProductsContext
  )?.onManageProductsPage;

  let flexCSSClasses = "";
  if (onCartPage)
    flexCSSClasses = "!flex flex-col lg:flex-row gap-8 lg:gap-0 justify-center";
  if (insideOrderSummaryContext || onManageProductsPage)
    flexCSSClasses = "!flex flex-col 2xs:flex-row gap-8 justify-center";
  if (onAdminPanelModifyOrderPage)
    flexCSSClasses = "!flex flex-col sm:flex-row gap-8 justify-center";

  return headerLinkInsteadOfWholeGameContainer ||
    productEntryOnClickStableFn ? (
    <div
      className={`${`${gameContainerClasses} ${flexCSSClasses}`} ${
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

type windowMatchMediaQueriesCSSProperties = "headerFontSize";

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

  // I want to stylize GameResult differently if it's located on the products search page
  const insideSearchCustomizationContextProvider =
    useContext(SearchCustomizationContext)?.insideCtxProvider === true;

  const windowMatchMediaQueriesCSSPropertiesMapInput = useMemo<
    windowMatchMediaQueriesCSSPropertiesMap<windowMatchMediaQueriesCSSProperties>
  >(
    () => ({
      headerFontSize: {
        ...(!insideSearchCustomizationContextProvider
          ? {}
          : { default: "1rem", xs: "1.5rem", lg: "1.5rem", md: "1rem" }),
      },
    }),
    [insideSearchCustomizationContextProvider]
  );
  const mediaQueriesProperties = useWindowMatchMediaQueriesCSSPropertiesMap(
    windowMatchMediaQueriesCSSPropertiesMapInput
  );

  // In case of using GamesResults component on the cart page I want to modify its appearance based on screen dimensions
  const onCartPage = useContext(OnCartPageContext);

  const insideOrderSummaryContext = useContext(
    OrderSummaryCartInformationContext
  )?.insideOrderSummaryContext;
  const onManageProductsPage = useContext(
    ManageProductsContext
  )?.onManageProductsPage;

  let displayCSSProperties = "";
  if (onCartPage) displayCSSProperties = "gap-8 lg:gap-2 flex flex-col";
  if (insideOrderSummaryContext) displayCSSProperties = "gap-8 flex flex-col";
  if (onManageProductsPage)
    displayCSSProperties = "gap-8 lg:gap-4 flex flex-col";

  let figureCSSDisplayClasses = "2xs:grid 2xs:grid-cols-2";
  if (onManageProductsPage) figureCSSDisplayClasses = "lg:grid lg:grid-cols-2";

  return (
    <motion.ul
      className={`w-full ${displayCSSProperties} text-center`}
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
            className="w-full"
          >
            <GameResultContext.Provider
              value={{
                game,
                showQuantityAndFinalPrice,
                headerLinkInsteadOfWholeGameContainer,
              }}
            >
              <GameContainer>
                <figure
                  className={`flex flex-col ${figureCSSDisplayClasses} items-center gap-2 justify-center`}
                >
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
                    <div className="py-6 text-sm">
                      Failed to retrieve an image of the game
                    </div>
                  )}

                  <figcaption>
                    <h2
                      // At lg: I go back to the smaller font as then the drop down containing all of the games results which is
                      // not largeFormat changes its dimensions to match the input field instead of extending to the right viewport edge
                      className={`text-highlightRed font-bold min-w-2/5 ${
                        largeFormat
                          ? ""
                          : "text-xs+ xs:text-sm sm:text-base md:text-lg lg:text-base xl:text-lg"
                      }`}
                      style={
                        largeFormat
                          ? { fontSize: mediaQueriesProperties.headerFontSize }
                          : {}
                      }
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
                    {...(largeFormat &&
                      insideSearchCustomizationContextProvider && {
                        priceTagFontSizeMediaQueryKeyToCSSPropertyValueMapOverwrite:
                          {
                            ...priceTagFontSizeMediaQueryKeyToCSSPropertyValueMap,
                            lg: "1.125rem",
                            md: "0.875rem",
                          },
                        customRWDFlexDisplayProperties: "2xs:flex-row",
                      })}
                    {...((onCartPage ||
                      insideOrderSummaryContext ||
                      onManageProductsPage) && {
                      customRWDFlexDisplayProperties: `!flex-row ${
                        insideOrderSummaryContext || onManageProductsPage
                          ? "flex-wrap"
                          : ""
                      }`,
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
