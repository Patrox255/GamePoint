import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import Button from "../UI/Button";
import Input from "../UI/Input";
import HeaderLinkOrHeaderAnimation from "../UI/headers/HeaderLinkOrHeaderAnimation";
import Header from "../UI/headers/Header";
import { priceFormat } from "../game/PriceTag";
import Error from "../UI/Error";
import { IGameWithQuantityBasedOnCartDetailsEntry } from "../../helpers/generateGamesWithQuantityOutOfCartDetailsEntries";
import useCompareComplexForUseMemo from "../../hooks/useCompareComplexForUseMemo";
import { ValidationErrorsArr } from "../UI/FormWithErrorHandling";
import { useAppSelector } from "../../hooks/reduxStore";

const cartControlButtonsAdditionalTailwindCSS = {
  px: "px-3",
  py: "py-1",
};

export type onModifyGameQuantityFnStable = (
  newGameQuantity: number,
  gameInfo: IGameWithQuantityBasedOnCartDetailsEntry
) => void;

type IFetchedGamesQuantityModificationAdditionalInformationContextBody = {
  onModifyGameQuantityFnStable: onModifyGameQuantityFnStable | undefined;
  gameQuantityModificationQueryPotentialError?:
    | Error
    | null
    | ValidationErrorsArr;
  gameQuantityModificationQueryPotentialData?: unknown;
};
export const FetchedGamesQuantityModificationAdditionalInformationContext =
  createContext<IFetchedGamesQuantityModificationAdditionalInformationContextBody>(
    {
      onModifyGameQuantityFnStable: undefined,
      gameQuantityModificationQueryPotentialError: null,
      gameQuantityModificationQueryPotentialData: undefined,
    }
  );

export const FetchedGamesQuantityModificationAdditionalInformationContextProvider =
  ({
    children,
    ...ctxBody
  }: {
    children: ReactNode;
  } & IFetchedGamesQuantityModificationAdditionalInformationContextBody) => (
    <FetchedGamesQuantityModificationAdditionalInformationContext.Provider
      value={ctxBody}
    >
      {children}
    </FetchedGamesQuantityModificationAdditionalInformationContext.Provider>
  );

export default function FetchedGamesQuantityModificationAdditionalInformation({
  game,
}: {
  game: IGameWithQuantityBasedOnCartDetailsEntry;
}) {
  const gameQuantityFromPassedGameInformation = game.quantity;

  const [inputQuantityValue, setInputQuantityValue] = useState<number>(
    game.quantity
  );
  const [gameQuantityState, setGameQuantityState] = useState(
    gameQuantityFromPassedGameInformation
  );
  const { onModifyGameQuantityFnStable } = useContext(
    FetchedGamesQuantityModificationAdditionalInformationContext
  );

  const gameStable = useCompareComplexForUseMemo(game);
  const productIdWhichCartModificationResultedInAnError = useAppSelector(
    (state) => state.cartSlice.productIdWhichCartModificationResultedInAnError
  );

  const [useQuantityFromInput, setUseQuantityFromInput] =
    useState<boolean>(false);

  const refreshGameQuantityValue = useCallback(() => {
    setInputQuantityValue(gameQuantityFromPassedGameInformation);
    setGameQuantityState(gameQuantityFromPassedGameInformation);
  }, [gameQuantityFromPassedGameInformation]);

  useEffect(() => {
    refreshGameQuantityValue();
  }, [refreshGameQuantityValue]);

  useEffect(() => {
    if (game._id !== productIdWhichCartModificationResultedInAnError) return;
    refreshGameQuantityValue();
  }, [
    game._id,
    productIdWhichCartModificationResultedInAnError,
    refreshGameQuantityValue,
  ]);

  useEffect(() => {
    if (
      onModifyGameQuantityFnStable &&
      gameQuantityFromPassedGameInformation !== gameQuantityState
    )
      onModifyGameQuantityFnStable(gameQuantityState, gameStable);
  }, [
    gameQuantityState,
    onModifyGameQuantityFnStable,
    gameStable,
    gameQuantityFromPassedGameInformation,
  ]);

  const freeToPlayGame = game.finalPrice === 0;

  const changeGameQuantityStateBasedOnCurrentOne = useCallback(
    (difference: number) =>
      setGameQuantityState(
        (oldGameQuantityState) => oldGameQuantityState + difference
      ),
    []
  );

  if (!onModifyGameQuantityFnStable)
    return (
      <Error
        smallVersion
        message="You have to provide quantity modification additional information component with appropriate on modify game quantity function by the designated context of the component!"
      />
    );

  return (
    <>
      {!freeToPlayGame && (
        <div className="final-cart-price font-bold text-highlightRed text-xl">
          {priceFormat.format(
            game.finalPrice * gameQuantityFromPassedGameInformation
          )}
        </div>
      )}
      <div className="game-cart-controls flex gap-2 justify-center items-center">
        {!freeToPlayGame && (
          <>
            <Button
              additionalTailwindCSS={cartControlButtonsAdditionalTailwindCSS}
              onClick={() => changeGameQuantityStateBasedOnCurrentOne(-1)}
            >
              -
            </Button>
            <Input
              width="w-16"
              value={
                useQuantityFromInput ? inputQuantityValue : gameQuantityState
              }
              type="number"
              step={1}
              customInputNumber
              onChange={setInputQuantityValue}
              min={0}
              onFocus={() => setUseQuantityFromInput(true)}
              onBlur={() => {
                setUseQuantityFromInput(false);
                gameQuantityFromPassedGameInformation !== inputQuantityValue &&
                  !isNaN(inputQuantityValue) &&
                  setGameQuantityState(inputQuantityValue);
              }}
            />
            <Button
              additionalTailwindCSS={cartControlButtonsAdditionalTailwindCSS}
              onClick={() => changeGameQuantityStateBasedOnCurrentOne(1)}
            >
              +
            </Button>
          </>
        )}
        <HeaderLinkOrHeaderAnimation
          onlyAnimation={true}
          onClick={() => setGameQuantityState(0)}
          additionalTailwindClasses="pl-3"
        >
          <Header>Remove</Header>
        </HeaderLinkOrHeaderAnimation>
      </div>
    </>
  );
}
