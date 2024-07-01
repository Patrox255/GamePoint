import { defer } from "react-router-dom";
import Hero from "../components/main/Hero";
import MostPopularGames from "../components/main/MostPopularGames";
import MainWrapper from "../components/structure/MainWrapper";
import { getJSON } from "../lib/fetch";
import { API_URL } from "../lib/config";
import { IGame } from "../models/game.model";
import { IGenre } from "../models/genre.model";
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

export const load10MostPopularProducts = async () => {
  const data = await getJSON<IGame>(`${API_URL}/products`);
  return data;
};

export const load10MostPopularGenres = async () => {
  const data = await getJSON<IGenre>(`${API_URL}/popular-genres`);
  console.log(data);
  return data;
};

export const loader = async () => {
  try {
    return defer({
      products: await load10MostPopularProducts(),
      popularGenres: load10MostPopularGenres(),
    });
  } catch (err) {
    return { error: err };
  }
};
