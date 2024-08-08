import { useQuery } from "@tanstack/react-query";

import MainWrapper from "../components/structure/MainWrapper";
import Header from "../components/UI/headers/Header";
import { useAppDispatch, useAppSelector } from "../hooks/reduxStore";
import { getCartDetails } from "../lib/fetch";
import { ReactNode, useCallback, useEffect, useState } from "react";
import Error from "../components/UI/Error";
import LoadingFallback from "../components/UI/LoadingFallback";
import GamesResults from "../components/main/nav/GamesResults";
import { IGame } from "../models/game.model";
import { priceFormat } from "../components/game/PriceTag";
import Button from "../components/UI/Button";
import Input from "../components/UI/Input";
import { modifyCartQuantityAction } from "../store/customActions";
import HeaderLinkOrHeaderAnimation from "../components/UI/headers/HeaderLinkOrHeaderAnimation";
import { useNavigate } from "react-router-dom";
import { IModifyProductQuantityPayload } from "../store/cartSlice";

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

  return (
    <>
      <div className="final-cart-price font-bold text-highlightRed text-xl">
        {priceFormat.format(game.finalPrice * gameQuantityFromCart)}
      </div>
      <div className="game-cart-controls flex gap-2 justify-center items-center">
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
  const cart = useAppSelector((state) => state.cartSlice.cart);

  const { data, error, isLoading } = useQuery({
    queryFn: ({ signal }) => getCartDetails(signal, cart),
    queryKey: ["cart-details", cart.map((cartEntry) => cartEntry.id)],
    enabled: cart.length > 0,
    refetchInterval: 30000, // monitoring prices
  });

  const cartDetails = data?.data;

  const navigate = useNavigate();

  let content;
  if (cart.length === 0)
    content = (
      <CartPageHeader>
        Currently your cart is empty. Feel free to add some products
      </CartPageHeader>
    );
  if (error)
    content = (
      <>
        <CartPageHeader>Failed to load your cart content!</CartPageHeader>
        <Error message={error.message} />
      </>
    );
  if (isLoading)
    content = (
      <>
        <CartPageHeader>Loading your cart content</CartPageHeader>
        <LoadingFallback />
      </>
    );
  if (cartDetails) {
    const gamesWithQuantity = cartDetails.map((cartDetailsEntry) => ({
      ...cartDetailsEntry.id,
      quantity: cart.find(
        (cartEntry) => cartEntry.id === cartDetailsEntry.id._id
      )!.quantity,
    }));
    content = (
      <>
        <CartPageHeader>Your cart:</CartPageHeader>
        <article className="w-7/8 flex">
          <section className="w-3/4">
            <GamesResults
              games={gamesWithQuantity}
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
                {priceFormat.format(
                  gamesWithQuantity.reduce(
                    (totalPrice, game) =>
                      totalPrice + game.quantity * game.finalPrice,
                    0
                  )
                )}
              </span>
            </p>
            <Button onClick={() => navigate("/order")}>
              Fulfill your order
            </Button>
          </section>
        </article>
      </>
    );
  }
  return <MainWrapper>{content}</MainWrapper>;
}
