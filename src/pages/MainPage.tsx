import Hero from "../components/main/Hero";
import MostPopularGames from "../components/main/MostPopularGames";
import MainWrapper from "../components/structure/MainWrapper";

export default function MainPage() {
  return (
    <MainWrapper>
      <Hero />
      <MostPopularGames />
    </MainWrapper>
  );
}
