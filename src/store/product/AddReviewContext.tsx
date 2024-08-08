import {
  createContext,
  memo,
  ReactNode,
  Reducer,
  useCallback,
  useReducer,
  useState,
} from "react";
import { QueryKey, useMutation } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";

import { useInput } from "../../hooks/useInput";
import generateInitialStateFromSearchParamsOrSessionStorage from "../../helpers/generateInitialStateFromSearchParamsOrSessionStorage";
import useChangeSearchParamsWhenUseReducerChanges from "../../hooks/useChangeSearchParamsWhenUseReducerChanges";
import { queryClient, sendReview } from "../../lib/fetch";
import {
  FormActionBackendErrorResponse,
  FormActionBackendResponse,
} from "../../components/UI/FormWithErrorHandling";
import useCompareComplexForUseMemo from "../../hooks/useCompareComplexForUseMemo";
import { IGameReviewsResponse } from "../../components/product/ReviewsWrapper";
import { useAppSelector } from "../../hooks/reduxStore";
import { IUser } from "../../models/user.model";
import { IExtendedGamePreviewGameArg } from "../../components/products/ExtendedGamePreview";
import useGetQueryKeysForOptimisticUpdate from "../../hooks/gameReviews/useGetQueryKeysForOptimisticUpdate";

interface ICriterion {
  criterionName: string;
  rating: number | null;
}

export const optimisticUpdateForReview = async function (
  gameDataKey: QueryKey,
  reviewsKey: QueryKey,
  data?: IReviewDataToSend,
  login?: string
) {
  const { data: oldGameData } = await queryClient.getQueryData<{
    data: IExtendedGamePreviewGameArg;
  }>(gameDataKey)!;
  const removeReview = data === undefined;
  await queryClient.setQueryData(gameDataKey, {
    data: {
      ...oldGameData,
      reviews: oldGameData?.reviews + (removeReview ? -1 : 1),
      userReview: !removeReview,
    },
  });
  const { data: oldReviews } = (await queryClient.getQueryData(reviewsKey)) as {
    data: IGameReviewsResponse;
  };
  const newUserReview = !removeReview
    ? {
        criteria: data.criteria.map((criterion) => ({
          ...criterion,
          rating: criterion.rating || 0,
        })),
        likes: 0,
        date: new Date(),
        content: data.reviewContent,
        userId: { login: login || "" } as IUser,
      }
    : undefined;
  await queryClient.setQueryData(reviewsKey, {
    data: {
      ...oldReviews,
      userReview: newUserReview,
    },
  });
  return {
    oldGameData: { data: oldGameData },
    oldReviews: { data: oldReviews },
  };
};

type currentlyHoveredCriterionState =
  | {
      index: number;
      rating: number;
    }
  | undefined;

export const AddReviewContext = createContext<{
  content: string;
  debouncedContent: string;
  handleContentChange: (newContent: string) => void;
  criteria: ICriterion[];
  debouncedCriteria: ICriterion[];
  criteriaDispatch: React.Dispatch<IAddReviewCriteriaAction>;
  currentlyHoveredCriterion: currentlyHoveredCriterionState;
  setCurrentlyHoveredCriterion: React.Dispatch<
    React.SetStateAction<currentlyHoveredCriterionState>
  >;
  handleReviewSubmit: (reviewToSend: IReviewDataArg) => void;
  isSendingANewReview: boolean;
  sendingNewReviewError: FormActionBackendErrorResponse | null;
  sendingNewReviewData?: FormActionBackendResponse;
}>({
  content: "",
  debouncedContent: "",
  handleContentChange: () => {},
  criteria: [],
  debouncedCriteria: [],
  criteriaDispatch: () => {},
  currentlyHoveredCriterion: undefined,
  setCurrentlyHoveredCriterion: () => {},
  handleReviewSubmit: () => {},
  isSendingANewReview: false,
  sendingNewReviewError: null,
  sendingNewReviewData: undefined,
});

type AddReviewCriteriaReducerActionTypes =
  | "ADD_CRITERION"
  | "REMOVE_CRITERION"
  | "CHANGE_STATE"
  | "CHANGE_CRITERION"
  | "RESET_STATE";

interface IAddReviewCriteriaAction {
  type: AddReviewCriteriaReducerActionTypes;
  payload: {
    newState?: ICriterion[];
    newCriterionName?: string;
    debouncedExecution?: boolean;
    criterionId?: number;
    newCriterionRating?: number | null;
  };
}

const initialCriteriaArr = [{ criterionName: "", rating: null }];

const AddReviewCriteriaReducer: Reducer<
  { criteria: ICriterion[]; debouncedCriteria: ICriterion[] },
  IAddReviewCriteriaAction
> = function (state, action) {
  const {
    type,
    payload: {
      newState,
      newCriterionName,
      debouncedExecution,
      criterionId,
      newCriterionRating,
    },
  } = action;
  const newCriteriaState = { ...state };
  switch (type) {
    case "ADD_CRITERION": {
      newCriteriaState.criteria = [
        ...state.criteria,
        {
          criterionName: "",
          rating: null,
        },
      ];
      return newCriteriaState;
    }
    case "REMOVE_CRITERION": {
      newCriteriaState.criteria = state.criteria.filter(
        (_, i) => i !== criterionId
      );
      return newCriteriaState;
    }
    case "CHANGE_STATE":
      return {
        ...state,
        ...(debouncedExecution
          ? { debouncedCriteria: newState! }
          : { criteria: newState! }),
      };

    case "CHANGE_CRITERION": {
      const criterionToChangeIndex = state.criteria.findIndex(
        (_, i) => i === criterionId
      );
      const newCriteria = state.criteria.map((criterionObj, i) =>
        i === criterionToChangeIndex
          ? {
              ...criterionObj,
              ...(newCriterionName !== undefined && {
                criterionName: newCriterionName,
              }),
              ...(newCriterionRating !== undefined && {
                rating: newCriterionRating,
              }),
            }
          : criterionObj
      ) as ICriterion[];
      return { ...newCriteriaState, criteria: newCriteria };
    }
    case "RESET_STATE":
      return {
        ...state,
        criteria: initialCriteriaArr,
      };

    default:
      return state;
  }
};

interface IReviewDataArg {
  criteria: ICriterion[];
  reviewContent: string;
}

export interface IReviewDataToSend extends IReviewDataArg {
  gameId: string;
}

export interface IAddReviewMutationCtx {
  oldGameData: { data: IExtendedGamePreviewGameArg };
  oldReviews: { data: IGameReviewsResponse };
}

export const handleMutationError = async function (
  reviewsKey: QueryKey,
  gameDataKey: QueryKey,
  ctx: IAddReviewMutationCtx
) {
  const { oldReviews, oldGameData } = ctx!;
  await queryClient.setQueryData(reviewsKey, oldReviews);
  await queryClient.setQueryData(gameDataKey, oldGameData);
};

export const AddReviewContextProvider = memo(
  ({ children, gameId }: { children: ReactNode; gameId: string }) => {
    const location = useLocation();
    const { search } = location;
    const searchParams = new URLSearchParams(search);
    const { gameDataKey, reviewsKey } = useGetQueryKeysForOptimisticUpdate();

    const initialReviewContent =
      generateInitialStateFromSearchParamsOrSessionStorage(
        "",
        searchParams,
        "reviewContent"
      );
    const [reviewContent, setReviewContent] =
      useState<string>(initialReviewContent);
    const { queryDebouncingState, handleInputChange, navigate } = useInput({
      searchParamName: "reviewContent",
      stateValue: reviewContent,
      setStateValue: setReviewContent,
      debouncingTime: 300,
    });

    const initialCriteriaProperty =
      generateInitialStateFromSearchParamsOrSessionStorage(
        initialCriteriaArr,
        searchParams,
        "reviewCriteria"
      );
    const [criteriaState, criteriaDispatch] = useReducer(
      AddReviewCriteriaReducer,
      {
        criteria: initialCriteriaProperty,
        debouncedCriteria: initialCriteriaProperty,
      }
    );

    const criteriaDispatchHookCallback = useCallback(
      (newState: ICriterion[]) =>
        criteriaDispatch({
          type: "CHANGE_STATE",
          payload: { debouncedExecution: true, newState },
        }),
      []
    );

    const login = useAppSelector((state) => state.userAuthSlice.login);

    const handleMutationErrorQueryKeysBound = useCallback(
      (ctx: IAddReviewMutationCtx) =>
        handleMutationError(reviewsKey, gameDataKey, ctx),
      [gameDataKey, reviewsKey]
    );

    const { mutate, isPending, error, data } = useMutation<
      FormActionBackendResponse,
      FormActionBackendErrorResponse,
      IReviewDataToSend,
      IAddReviewMutationCtx
    >({
      mutationFn: sendReview,
      onMutate: async (data) => {
        return optimisticUpdateForReview(gameDataKey, reviewsKey, data, login);
      },
      onError: async (_, __, ctx) => {
        await handleMutationErrorQueryKeysBound(ctx!);
      },
      onSuccess: async (data, _, ctx) => {
        if (typeof data.data === "object")
          return await handleMutationErrorQueryKeysBound(ctx);
        criteriaDispatch({ type: "RESET_STATE", payload: {} });
        handleInputChange("");
      },
      onSettled: async () => {
        await queryClient.invalidateQueries({ queryKey: gameDataKey });
      },
    });

    const handleReviewSubmit = useCallback(
      (reviewToSend: IReviewDataArg) => mutate({ ...reviewToSend, gameId }),
      [mutate, gameId]
    );

    const stableCriteria = useCompareComplexForUseMemo(criteriaState.criteria);

    useChangeSearchParamsWhenUseReducerChanges({
      stateNormalProperty: criteriaState.criteria,
      stateDebouncedProperty: criteriaState.debouncedCriteria,
      searchParamName: "reviewCriteria",
      location,
      navigate,
      dispatchCallbackFn: criteriaDispatchHookCallback,
      timeToWait: 300,
    });

    const [currentlyHoveredCriterion, setCurrentlyHoveredCriterion] =
      useState<currentlyHoveredCriterionState>(undefined);

    return (
      <AddReviewContext.Provider
        value={{
          content: reviewContent,
          debouncedContent: queryDebouncingState,
          handleContentChange: handleInputChange,
          criteriaDispatch,
          criteria: stableCriteria,
          debouncedCriteria: criteriaState.debouncedCriteria,
          currentlyHoveredCriterion,
          setCurrentlyHoveredCriterion,
          handleReviewSubmit,
          isSendingANewReview: isPending,
          sendingNewReviewError: error,
          sendingNewReviewData: data,
        }}
      >
        {children}
      </AddReviewContext.Provider>
    );
  }
);

export default AddReviewContextProvider;
