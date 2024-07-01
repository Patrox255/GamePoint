import { IDeveloper } from "./devloper.model";
import { IGenre } from "./genre.model";
import { IPlatform } from "./platform.model";
import { IPublisher } from "./publisher.model";

export interface IGame {
  title: string;
  price: number;
  discount: number;
  releaseDate: Date;
  genres: IGenre[];
  platforms: IPlatform[];
  developer?: IDeveloper;
  publisher?: IPublisher;
  popularity?: number;
  artworks: string[];
  summary: string;
}
