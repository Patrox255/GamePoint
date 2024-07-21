import { ReactNode, useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion";

import { IGame } from "../../models/game.model";
import HeaderLinkOrHeaderAnimation from "../UI/headers/HeaderLinkOrHeaderAnimation";
import Header from "../UI/headers/Header";
import { IDeveloper } from "../../models/developer.model";
import { IPublisher } from "../../models/publisher.model";
import TagsComponent from "../game/tags/TagsComponent";
import { IGenre } from "../../models/genre.model";
import { IPlatform } from "../../models/platform.model";
import Button from "../UI/Button";

export interface IAdditionalInformationGathererEntry<T extends keyof IGame> {
  additionalInformationEntryVisibleName: string;
  AdditionalInformationEntryContentGeneratorFn: ({
    gameDocumentKeyValue,
  }: {
    gameDocumentKeyValue: IGame[T];
  }) => ReactNode;
}

type IAdditionalInformationGatherer = {
  [T in keyof IGame]?: IAdditionalInformationGathererEntry<T>;
};

export default function ProductAdditionalInformation({
  game,
}: {
  game: IGame;
}) {
  const tagGenresEntryContentGeneratorFnStable = useCallback(
    ({ gameDocumentKeyValue }: { gameDocumentKeyValue: IGenre[] }) => (
      <TagsComponent
        tags={gameDocumentKeyValue.map(
          (tagObj: { name: string }) => tagObj.name
        )}
        paramName="genre"
      />
    ),
    []
  );

  const tagPlatformsEntryContentGeneratorFnStable = useCallback(
    ({ gameDocumentKeyValue }: { gameDocumentKeyValue: IPlatform[] }) => (
      <TagsComponent
        tags={gameDocumentKeyValue.map(
          (tagObj: { name: string }) => tagObj.name
        )}
        paramName="platform"
      />
    ),
    []
  );

  const tagEntryGameDocumentKeyGeneratorFnStableMap = useMemo(
    () =>
      new Map([
        ["genres", tagGenresEntryContentGeneratorFnStable],
        ["platforms", tagPlatformsEntryContentGeneratorFnStable],
      ]),
    [
      tagGenresEntryContentGeneratorFnStable,
      tagPlatformsEntryContentGeneratorFnStable,
    ]
  );

  const tagEntryGeneratorForGathererObj = useCallback(
    (
      tagGameDocumentKeyName: "genres" | "platforms",
      tagVisisbleName: string
    ) => ({
      [tagGameDocumentKeyName]: {
        additionalInformationEntryVisibleName: tagVisisbleName,
        AdditionalInformationEntryContentGeneratorFn:
          tagEntryGameDocumentKeyGeneratorFnStableMap.get(
            tagGameDocumentKeyName
          ),
      },
    }),
    [tagEntryGameDocumentKeyGeneratorFnStableMap]
  );

  const publisherEntryContentGeneratorFnStable = useCallback(
    ({
      gameDocumentKeyValue: publisher,
    }: {
      gameDocumentKeyValue: IPublisher | undefined;
    }) => (
      <HeaderLinkOrHeaderAnimation
        href={`/products`}
        searchParams={{ publisher: publisher?.name }}
      >
        <Header>{publisher?.name}</Header>
      </HeaderLinkOrHeaderAnimation>
    ),
    []
  );

  const developerEntryContentGeneratorFnStable = useCallback(
    ({
      gameDocumentKeyValue: developer,
    }: {
      gameDocumentKeyValue: IDeveloper | undefined;
    }) => (
      <HeaderLinkOrHeaderAnimation
        href={`/products`}
        searchParams={{ developer: developer?.name }}
      >
        <Header>{developer?.name}</Header>
      </HeaderLinkOrHeaderAnimation>
    ),
    []
  );

  const additionalInformationGathererObj: IAdditionalInformationGatherer =
    useMemo(
      () => ({
        ...tagEntryGeneratorForGathererObj("genres", "Genres"),
        ...tagEntryGeneratorForGathererObj("platforms", "Platforms"),
        publisher: {
          additionalInformationEntryVisibleName: "Publisher",
          AdditionalInformationEntryContentGeneratorFn:
            publisherEntryContentGeneratorFnStable,
        },
        developer: {
          additionalInformationEntryVisibleName: "Developer",
          AdditionalInformationEntryContentGeneratorFn:
            developerEntryContentGeneratorFnStable,
        },
      }),
      [
        developerEntryContentGeneratorFnStable,
        publisherEntryContentGeneratorFnStable,
        tagEntryGeneratorForGathererObj,
      ]
    );

  const additionalInformationGatherer = useMemo(
    () => [...Object.entries(additionalInformationGathererObj)],
    [additionalInformationGathererObj]
  );

  const [
    activeAdditionalInformationBlock,
    setActiveAdditionalInformationBlock,
  ] = useState<keyof IGame>("genres");

  const additionalInformationBlocksContent = useMemo(
    () =>
      additionalInformationGatherer.map(
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
    [activeAdditionalInformationBlock, additionalInformationGatherer, game]
  );

  return (
    <motion.section className="product-details-additional-information flex flex-col justify-center items-center gap-10">
      <section className="additional-information-control flex gap-3">
        <TagsComponent tags={additionalInformationGatherer}>
          {(additionalInformationGathererEntry) => {
            const isActive =
              additionalInformationGathererEntry[0] ===
              activeAdditionalInformationBlock;
            return (
              <Button
                onClick={() =>
                  setActiveAdditionalInformationBlock(
                    additionalInformationGathererEntry[0] as keyof IGame
                  )
                }
                active={isActive}
                key={`product-additional-information-control-${
                  additionalInformationGathererEntry[0]
                }${isActive ? "-active" : ""}`}
              >
                {
                  additionalInformationGathererEntry[1]
                    .additionalInformationEntryVisibleName
                }
              </Button>
            );
          }}
        </TagsComponent>
      </section>
      <section className="additional-information-blocks">
        {additionalInformationBlocksContent}
      </section>
    </motion.section>
  );
}
