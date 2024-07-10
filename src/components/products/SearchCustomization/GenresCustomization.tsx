import { useContext, useState } from "react";
import useQueryGetTheMostPopularGenres from "../../../hooks/useQueryGetTheMostPopularGenres";
import TagsComponent from "../../game/tags/TagsComponent";
import Input from "../../UI/Input";
import { useInput } from "../../../hooks/useInput";
import { useQuery } from "@tanstack/react-query";
import LoadingFallback from "../../UI/LoadingFallback";
import Error from "../../UI/Error";
import { loadGenres } from "../../../lib/fetch";
import { SearchCustomizationContext } from "../../../store/SearchCustomizationContext";
import Button from "../../UI/Button";

export default function GenresCustomization() {
  const {
    data: mostPopularGenresData,
    error: mostPopularGenresError,
    isLoading: mostPopularGenresIsLoading,
  } = useQueryGetTheMostPopularGenres();

  const [genreSearch, setGenreSearch] = useState<string>("");
  const { handleInputChange, queryDebouncingState } = useInput({
    stateValue: genreSearch,
    setStateValue: setGenreSearch,
    searchParamName: "genreSearch",
    saveDebouncedStateInSearchParamsAndSessionStorage: false,
  });

  const {
    data: queryGenresData,
    isLoading: queryGenresIsLoading,
    error: queryGenresError,
  } = useQuery({
    queryFn: ({ signal, queryKey }) => {
      const [, , limit, query] = queryKey;
      return loadGenres({
        signal,
        limit: limit as number,
        query: query as string,
      });
    },
    queryKey: ["games", "genres", 10, queryDebouncingState],
  });

  const typedCustomQuery = queryDebouncingState !== "";

  const { selectedGenresState, selectedGenresDispatch } = useContext(
    SearchCustomizationContext
  );

  console.log(selectedGenresState);

  let content;
  if (
    (typedCustomQuery && queryGenresIsLoading) ||
    (!typedCustomQuery && mostPopularGenresIsLoading)
  )
    content = <LoadingFallback />;
  else if (typedCustomQuery && queryGenresError)
    content = <Error message={queryGenresError.message} />;
  else if (!typedCustomQuery && mostPopularGenresError)
    content = <Error message={mostPopularGenresError.message} />;
  else if (
    typedCustomQuery &&
    queryGenresData &&
    queryGenresData.data.length === 0
  )
    content = <p>No genres similar to the provided query have been found</p>;
  else if (
    (typedCustomQuery && queryGenresData) ||
    (!typedCustomQuery && mostPopularGenresData)
  )
    content = (
      <TagsComponent
        tags={
          typedCustomQuery
            ? queryGenresData!.data.map((genre) => genre.name)
            : mostPopularGenresData!.data.map((genre) => genre.name)
        }
      >
        {(tag) => (
          <Button
            onClick={() =>
              selectedGenresDispatch({
                type: selectedGenresState.genres.includes(tag)
                  ? "REMOVE_GENRE"
                  : "ADD_GENRE",
                payload: {
                  genreName: tag,
                },
              })
            }
          >
            {tag}
          </Button>
        )}
      </TagsComponent>
    );

  return (
    <article className="flex flex-col justify-center items-center gap-3 py-2 w-full">
      <h2 className="text-highlightRed">Genres</h2>
      <div className="flex flex-col justify-center items-center gap-3">
        <TagsComponent tags={selectedGenresState.genres}>
          {(tag) => (
            <Button
              onClick={() =>
                selectedGenresDispatch({
                  type: "REMOVE_GENRE",
                  payload: {
                    genreName: tag,
                  },
                })
              }
            >
              {tag}
            </Button>
          )}
        </TagsComponent>
        <div className="w-full py-3">
          <Input
            placeholder="Type in a genre name"
            value={genreSearch}
            onChange={handleInputChange}
            width="w-1/2"
          />
        </div>
        {content}
      </div>
    </article>
  );
}
