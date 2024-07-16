import { motion } from "framer-motion";

import PagesManagerContextProvider from "../../store/products/PagesManagerContext";
import SliderProductElementContent from "../main/slider/SliderProductElementContent";
import AnimatedAppearance from "../UI/AnimatedAppearance";
import Button from "../UI/Button";
import PagesElement from "../UI/PagesElement";
import { IGame } from "../../models/game.model";
import TagsComponent from "../game/tags/TagsComponent";
import { ReactNode, useMemo, useState } from "react";
import HeaderMedium from "../UI/headers/HeaderMedium";
import HeaderLink from "../UI/headers/HeaderLink";
import AddReviewContextProvider from "../../store/product/AddReviewContext";
import AddReview from "../product/AddReview";
import useCompareComplexForUseMemo from "../../hooks/useCompareComplexForUseMemo";

export default function ExtendedGamePreview({ game }: { game: IGame }) {
  type IAdditionalInformationGatherer = {
    [T in keyof IGame]?: {
      additionalInformationEntryVisibleName: string;
      AdditionalInformationEntryContentGeneratorFn: ({
        gameDocumentKeyValue,
      }: {
        gameDocumentKeyValue: IGame[T];
      }) => ReactNode;
    };
  };

  const tagEntryLinkSearchParamMap = new Map([
    ["genres", "genre"],
    ["platforms", "platform"],
  ]);

  const tagEntryGeneratorForGathererObj = (
    tagGameDocumentKeyName: "genres" | "platforms",
    tagVisisbleName: string
  ) => ({
    [tagGameDocumentKeyName]: {
      additionalInformationEntryVisibleName: tagVisisbleName,
      AdditionalInformationEntryContentGeneratorFn: ({
        gameDocumentKeyValue,
      }: {
        gameDocumentKeyValue: IGame[typeof tagGameDocumentKeyName];
      }) => (
        <TagsComponent
          tags={gameDocumentKeyValue.map(
            (tagObj: { name: string }) => tagObj.name
          )}
          paramName={tagEntryLinkSearchParamMap.get(tagGameDocumentKeyName)}
        />
      ),
    },
  });

  const additionalInformationGathererObj: IAdditionalInformationGatherer = {
    ...tagEntryGeneratorForGathererObj("genres", "Genres"),
    ...tagEntryGeneratorForGathererObj("platforms", "Platforms"),
    publisher: {
      additionalInformationEntryVisibleName: "Publisher",
      AdditionalInformationEntryContentGeneratorFn: ({
        gameDocumentKeyValue: publisher,
      }) => (
        <HeaderLink
          href={`/products`}
          searchParams={{ publisher: publisher?.name }}
        >
          <HeaderMedium>{publisher?.name}</HeaderMedium>
        </HeaderLink>
      ),
    },
    developer: {
      additionalInformationEntryVisibleName: "Developer",
      AdditionalInformationEntryContentGeneratorFn: ({
        gameDocumentKeyValue: developer,
      }) => (
        <HeaderLink
          href={`/products`}
          searchParams={{ developer: developer?.name }}
        >
          <HeaderMedium>{developer?.name}</HeaderMedium>
        </HeaderLink>
      ),
    },
  };

  const additionalInformationGatherer = [
    ...Object.entries(additionalInformationGathererObj),
  ];
  const additionalInformationGathererStable = useCompareComplexForUseMemo(
    additionalInformationGatherer
  );

  const [
    activeAdditionalInformationBlock,
    setActiveAdditionalInformationBlock,
  ] = useState<keyof IGame>("genres");

  const additionalInformationBlocksContent = useMemo(
    () =>
      additionalInformationGathererStable.map(
        (additionalInformationGathererEntry) => {
          const { AdditionalInformationEntryContentGeneratorFn } =
            additionalInformationGathererEntry[1];
          const gameKey = additionalInformationGathererEntry[0] as keyof IGame;
          return gameKey === activeAdditionalInformationBlock ? (
            <motion.article
              initial={{ opacity: 0, height: 0, translateY: "2rem" }}
              animate={{
                opacity: 1,
                height: "auto",
                translateY: 0,
              }}
              exit={{ opacity: 0, height: 0 }}
              key={`additional-information-${gameKey}`}
            >
              <AdditionalInformationEntryContentGeneratorFn
                gameDocumentKeyValue={game[gameKey] as never}
                key={gameKey}
              />
            </motion.article>
          ) : (
            ""
          );
        }
      ),
    [
      activeAdditionalInformationBlock,
      additionalInformationGathererStable,
      game,
    ]
  );

  return (
    <>
      <article className="product-overview">
        <PagesManagerContextProvider>
          <SliderProductElementContent
            element={game}
            showTags={false}
            showSummary={false}
            sliderImageOverviewFn={(SliderImageOverviewPrepared) => (
              <AnimatedAppearance>
                <SliderImageOverviewPrepared />
                <PagesElement
                  amountOfElementsPerPage={5}
                  totalAmountOfElementsToDisplayOnPages={game.artworks.length}
                />
              </AnimatedAppearance>
            )}
          >
            {(element) => (
              <Button
                onClick={() => {
                  console.log(`${element.title} added to cart!`);
                }}
              >
                Add to cart
              </Button>
            )}
          </SliderProductElementContent>
        </PagesManagerContextProvider>
      </article>
      <motion.article
        className="product-details flex flex-col text-center bg-darkerBg p-8 rounded-xl gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        whileHover={{ opacity: 1 }}
      >
        <AnimatedAppearance>
          <motion.section className="product-details-summary">
            <HeaderMedium>Summary</HeaderMedium>
            <p>{game.summary}</p>
          </motion.section>
        </AnimatedAppearance>
        {game.storyLine && (
          <AnimatedAppearance>
            <motion.section className="product-details-storyline">
              <HeaderMedium>Storyline</HeaderMedium>
              <p>{game.storyLine}</p>
            </motion.section>
          </AnimatedAppearance>
        )}
        <motion.section className="product-details-additional-information flex flex-col justify-center items-center gap-10">
          <section className="additional-information-control flex gap-3">
            <AnimatedAppearance>
              <TagsComponent tags={additionalInformationGatherer}>
                {(additionalInformationGathererEntry) => (
                  <Button
                    onClick={() =>
                      setActiveAdditionalInformationBlock(
                        additionalInformationGathererEntry[0] as keyof IGame
                      )
                    }
                    active={
                      additionalInformationGathererEntry[0] ===
                      activeAdditionalInformationBlock
                    }
                  >
                    {
                      additionalInformationGathererEntry[1]
                        .additionalInformationEntryVisibleName
                    }
                  </Button>
                )}
              </TagsComponent>
            </AnimatedAppearance>
          </section>
          <section className="additional-information-blocks">
            {additionalInformationBlocksContent}
          </section>
        </motion.section>
        <AnimatedAppearance>
          <section className="product-details-reviews w-full">
            <HeaderMedium>Reviews</HeaderMedium>
            <AddReviewContextProvider>
              <AddReview />
            </AddReviewContextProvider>
          </section>
        </AnimatedAppearance>
      </motion.article>
    </>
  );
}
