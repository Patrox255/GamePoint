import { createContext, ReactNode, useCallback } from "react";
import { IReview } from "../../models/review.model";
import { useMutation } from "@tanstack/react-query";
import { queryClient, removeReview } from "../../lib/fetch";
import { FormActionBackendResponse } from "../../components/UI/FormWithErrorHandling";
import useGetQueryKeysForOptimisticUpdate from "../../hooks/gameReviews/useGetQueryKeysForOptimisticUpdate";
import {
  handleMutationError,
  IAddReviewMutationCtx,
  optimisticUpdateForReview,
} from "./AddReviewContext";

export const RemoveReviewContext = createContext<{
  review: IReview | undefined;
  removeReviewHandler: (reviewId: string) => void;
  isRemoving: boolean;
  removingData?: FormActionBackendResponse;
  removingError: Error | null;
}>({
  review: undefined,
  removeReviewHandler: () => {},
  isRemoving: false,
  removingData: undefined,
  removingError: null,
});

export default function RemoveReviewContextProvider({
  children,
  review,
}: {
  children: ReactNode;
  review: IReview;
}) {
  const { gameDataKey, reviewsKey } = useGetQueryKeysForOptimisticUpdate();
  const handleMutationErrorQueryKeysBound = useCallback(
    (ctx: IAddReviewMutationCtx) =>
      handleMutationError(reviewsKey, gameDataKey, ctx),
    [gameDataKey, reviewsKey]
  );

  const { isPending, data, error, mutate } = useMutation({
    mutationFn: removeReview,
    onMutate: async () => optimisticUpdateForReview(gameDataKey, reviewsKey),
    onError: async (_, __, ctx) => {
      await handleMutationErrorQueryKeysBound(ctx!);
    },
    onSuccess: async (data, _, ctx) => {
      if (typeof data.data === "object")
        return await handleMutationErrorQueryKeysBound(ctx);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: gameDataKey });
    },
  });

  const removeReviewHandler = useCallback(
    (reviewId: string) => mutate(reviewId),
    [mutate]
  );

  return (
    <RemoveReviewContext.Provider
      value={{
        review,
        removeReviewHandler,
        isRemoving: isPending,
        removingError: error,
        removingData: data,
      }}
    >
      {children}
    </RemoveReviewContext.Provider>
  );
}
