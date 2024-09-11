import { useQuery } from "@tanstack/react-query";

import { getGameData, IGetGameDataNecessaryInformation } from "../../lib/fetch";
import { IExtendedGamePreviewGameArg } from "../../components/products/ExtendedGamePreview";
import { useMemo } from "react";

export default function useQueryGetGameData({
  productId,
  productSlug,
}: IGetGameDataNecessaryInformation) {
  const {
    data: gameData,
    error: gameDataError,
    isLoading: gameDataIsLoading,
  } = useQuery({
    queryFn: ({ signal }) =>
      getGameData<IExtendedGamePreviewGameArg>({
        signal,
        productSlug,
        productId,
      }),
    queryKey: ["games", productSlug ?? productId],
  });

  const gameStable = useMemo(() => gameData?.data, [gameData]);
  return { gameStable, gameData, gameDataError, gameDataIsLoading };
}
