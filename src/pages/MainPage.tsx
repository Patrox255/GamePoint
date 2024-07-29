import Hero from "../components/main/Hero";
import MostPopularGames from "../components/main/MostPopularGames";
import MainWrapper from "../components/structure/MainWrapper";
import MostPopularGenres from "../components/main/MostPopularGenres";

export default function MainPage() {
  return (
    <MainWrapper>
      <Hero />
      <MostPopularGames />
      <MostPopularGenres />
    </MainWrapper>
  );
}
