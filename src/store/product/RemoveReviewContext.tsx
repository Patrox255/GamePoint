import { createContext, ReactNode, useCallback, useContext } from "react";
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
import { ProductContext } from "./ProductContext";
import useCreateHelperFunctionsRelatedToNotificationManagement from "../../hooks/notificationSystemRelated/useCreateHelperFunctionsRelatedToNotificationManagement";

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
  const { productId } = useContext(ProductContext);
  const { gameDataKey, reviewsKey } =
    useGetQueryKeysForOptimisticUpdate(productId);
  const handleMutationErrorQueryKeysBound = useCallback(
    (ctx: IAddReviewMutationCtx) =>
      handleMutationError(reviewsKey, gameDataKey, ctx),
    [gameDataKey, reviewsKey]
  );

  const {
    generateErrorNotificationInCaseOfQueryErrStable,
    generateLoadingInformationNotificationStable,
    generateSuccessNotificationStable,
  } = useCreateHelperFunctionsRelatedToNotificationManagement("removeReview");

  const { isPending, data, error, mutate } = useMutation({
    mutationFn: removeReview,
    onMutate: async () => {
      generateLoadingInformationNotificationStable("default", {
        text: "Deleting your review...",
      });
      return await optimisticUpdateForReview(gameDataKey, reviewsKey);
    },
    onError: async (err, __, ctx) => {
      generateErrorNotificationInCaseOfQueryErrStable(err);
      await handleMutationErrorQueryKeysBound(ctx!);
    },
    onSuccess: async (data, _, ctx) => {
      const queryData = data?.data;
      generateErrorNotificationInCaseOfQueryErrStable(queryData);
      if (typeof queryData === "object")
        return await handleMutationErrorQueryKeysBound(ctx);
      generateSuccessNotificationStable("default", {
        text: "Your review has been deleted!",
      });
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: gameDataKey });
    },
  });
  // Had not to use my hook which automatically plugs my back-end query responses to appropriate notifications as invalidating
  // game data makes it so it loses the removed review and therefore reevaluates this component and as a result my hook won't catch
  // the received data and react to it

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
