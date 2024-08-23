import { useNavigate } from "react-router-dom";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";

import MainWrapper from "../components/structure/MainWrapper";
import Header from "../components/UI/headers/Header";
import { useAppDispatch, useAppSelector } from "../hooks/reduxStore";
import Error from "../components/UI/Error";
import LoadingFallback from "../components/UI/LoadingFallback";
import GamesResults from "../components/main/nav/GamesResults";
import { IGame } from "../models/game.model";
import { priceFormat } from "../components/game/PriceTag";
import Button from "../components/UI/Button";
import Input from "../components/UI/Input";
import { modifyCartQuantityAction } from "../store/customActions";
import HeaderLinkOrHeaderAnimation from "../components/UI/headers/HeaderLinkOrHeaderAnimation";
import { IModifyProductQuantityPayload } from "../store/cartSlice";
import useRetrieveContactInformation from "../hooks/accountRelated/useRetrieveContactInformation";
import navigatePaths from "../helpers/navigatePaths";
import useRetrieveCartDetails from "../hooks/useRetrieveCartDetails";
import generateGamesWithQuantityOutOfCartDetailsEntries from "../helpers/generateGamesWithQuantityOutOfCartDetailsEntries";

const CartPageHeader = ({ children }: { children: ReactNode }) => (
  <header className="mb-6">
    <Header size="large">{children}</Header>
  </header>
);

const cartControlButtonsAdditionalTailwindCSS = {
  px: "px-3",
  py: "py-1",
};

const AdditionalGameInformation = ({
  game,
}: {
  game: IGame & { quantity: number };
}) => {
  const dispatch = useAppDispatch();

  const [inputQuantityValue, setInputQuantityValue] = useState<number>(
    game.quantity
  );
  const gameQuantityFromCart = game.quantity;
  const gameId = game._id;

  const [useQuantityFromInput, setUseQuantityFromInput] =
    useState<boolean>(false);

  useEffect(() => {
    setInputQuantityValue(gameQuantityFromCart);
  }, [gameQuantityFromCart]);
  const login = useAppSelector((state) => state.userAuthSlice.login);

  const generateModifyCartQuantityAction = useCallback(
    (modifyCartQuantityPayload: IModifyProductQuantityPayload) =>
      modifyCartQuantityAction({ ...modifyCartQuantityPayload, login }),
    [login]
  );
  const freeToPlayGame = game.finalPrice === 0;

  return (
    <>
      {!freeToPlayGame && (
        <div className="final-cart-price font-bold text-highlightRed text-xl">
          {priceFormat.format(game.finalPrice * gameQuantityFromCart)}
        </div>
      )}
      <div className="game-cart-controls flex gap-2 justify-center items-center">
        {!freeToPlayGame && (
          <>
            <Button
              additionalTailwindCSS={cartControlButtonsAdditionalTailwindCSS}
              onClick={() =>
                dispatch(
                  generateModifyCartQuantityAction({
                    operation: "decrease",
                    productId: gameId,
                  })
                )
              }
            >
              -
            </Button>
            <Input
              width="w-16"
              value={
                useQuantityFromInput ? inputQuantityValue : gameQuantityFromCart
              }
              type="number"
              step={1}
              customInputNumber
              onChange={setInputQuantityValue}
              min={0}
              onFocus={() => setUseQuantityFromInput(true)}
              onBlur={() => {
                setUseQuantityFromInput(false);
                gameQuantityFromCart !== inputQuantityValue &&
                  !isNaN(inputQuantityValue) &&
                  dispatch(
                    generateModifyCartQuantityAction({
                      operation: "set",
                      productId: gameId,
                      newQuantity: inputQuantityValue,
                    })
                  );
              }}
            />
            <Button
              additionalTailwindCSS={cartControlButtonsAdditionalTailwindCSS}
              onClick={() =>
                dispatch(
                  generateModifyCartQuantityAction({
                    operation: "increase",
                    productId: gameId,
                  })
                )
              }
            >
              +
            </Button>
          </>
        )}
        <HeaderLinkOrHeaderAnimation
          onlyAnimation={true}
          onClick={() =>
            dispatch(
              generateModifyCartQuantityAction({
                operation: "set",
                productId: gameId,
                newQuantity: 0,
              })
            )
          }
          additionalTailwindClasses="pl-3"
        >
          <Header>Remove</Header>
        </HeaderLinkOrHeaderAnimation>
      </div>
    </>
  );
};

export default function CartPage() {
  const {
    cartDetailsData,
    cartDetailsError,
    cartDetailsIsLoading,
    stateCartStable: cart,
  } = useRetrieveCartDetails();
  const isLogged =
    useAppSelector((state) => state.userAuthSlice.login) !== undefined;

  const cartDetailsStable = useMemo(
    () => cartDetailsData?.data?.cart,
    [cartDetailsData]
  );
  const navigate = useNavigate();

  const {
    data: userContactInformationData,
    error: userContactInformationError,
    isLoading: userContactInformationIsLoading,
  } = useRetrieveContactInformation();

  const isLoading =
    cartDetailsIsLoading ||
    (isLogged && userContactInformationIsLoading) ||
    !cart;
  const isReady =
    cartDetailsData && (!isLogged || (userContactInformationData && isLogged));
  const hasToProvideContactInformation =
    isReady &&
    isLogged &&
    userContactInformationData?.data.additionalContactInformation.length === 0;

  const gamesWithQuantityStable = useMemo(
    () =>
      !cartDetailsStable
        ? undefined
        : generateGamesWithQuantityOutOfCartDetailsEntries(
            cartDetailsStable,
            cart!
          ),
    [cart, cartDetailsStable]
  );

  let content;
  if (cart && cart.length === 0)
    content = (
      <CartPageHeader>
        Currently your cart is empty. Feel free to add some products
      </CartPageHeader>
    );
  if (cartDetailsError)
    content = (
      <>
        <CartPageHeader>Failed to load your cart content!</CartPageHeader>
        <Error message={cartDetailsError.message} />
      </>
    );
  if (isLogged && userContactInformationError)
    content = (
      <>
        <CartPageHeader>Failed to load your account data!</CartPageHeader>
        <Error message={userContactInformationError.message} />
      </>
    );
  if (isLoading)
    content = (
      <>
        <CartPageHeader>Loading your cart content</CartPageHeader>
        <LoadingFallback />
      </>
    );
  if (isReady) {
    content = (
      <>
        <CartPageHeader>Your cart:</CartPageHeader>
        <article className="w-7/8 flex">
          <section className="w-3/4">
            <GamesResults
              games={gamesWithQuantityStable!}
              largeFormat
              moveHighlight={false}
              headerLinkInsteadOfWholeGameContainer={true}
              AdditionalGameInformation={AdditionalGameInformation}
            />
          </section>
          <section className="w-1/4 bg-darkerBg rounded-xl flex flex-col items-center justify-start py-6 px-4 gap-6 self-center">
            <p className="text-lg flex items-center gap-2">
              Total price:
              <span className="font-bold text-highlightRed text-xl">
                {priceFormat.format(cartDetailsData?.data?.cartTotalPrice)}
              </span>
            </p>
            <Button
              onClick={() =>
                navigate(
                  !hasToProvideContactInformation
                    ? "/order"
                    : navigatePaths.userPanelContact
                )
              }
            >
              {!hasToProvideContactInformation
                ? "Fulfill your order"
                : "Provide contact details to proceed"}
            </Button>
          </section>
        </article>
      </>
    );
  }
  return (
    <MainWrapper>
      <article className="cart-content-wrapper text-center flex-col items-center w-full p-4">
        {content}
      </article>
    </MainWrapper>
  );
}
