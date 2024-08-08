import Hero from "../components/main/Hero";
import MostPopularGames from "../components/main/MostPopularGames";
import MainWrapper from "../components/structure/MainWrapper";
import MostPopularGenres from "../components/main/MostPopularGenres";
import DelayGenresAppearanceToTheFirstGameImageContextProvider from "../store/mainPage/DelayGenresRenderToTheFirstGameImageContext";

export default function MainPage() {
  return (
    <MainWrapper>
      <Hero />
      <DelayGenresAppearanceToTheFirstGameImageContextProvider>
        <MostPopularGames />
        <MostPopularGenres />
      </DelayGenresAppearanceToTheFirstGameImageContextProvider>
    </MainWrapper>
  );
}
