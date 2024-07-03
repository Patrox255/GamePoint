import Hero from "../components/main/Hero";
import MostPopularGames from "../components/main/MostPopularGames";
import MainWrapper from "../components/structure/MainWrapper";
import MostPopularGenres from "../components/main/MostPopularGenres";
import { LoaderFunction } from "react-router-dom";
import { load10MostPopularGames, queryClient } from "../lib/fetch";

export default function MainPage() {
  return (
    <MainWrapper>
      <Hero />
      <MostPopularGames />
      <MostPopularGenres />
    </MainWrapper>
  );
}

export const loader: LoaderFunction = async function () {
  try {
    await queryClient.fetchQuery({
      queryKey: ["games", "most-popular"],
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        load10MostPopularGames(signal),
    });
  } catch (err) {
    // If this loader function catches an error from fetchQuery then we only log it
    // and if it also reoccurs in our frontend while useQuery function is being executed then the error is properly handled there
    console.error(err);
  }
  return null;
};
// Also we only preload most popular games as I believe that user can easily wait on the actual page for the genres to appear
