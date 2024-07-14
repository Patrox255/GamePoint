import { IDeveloper } from "./devloper.model";
import { IGenre } from "./genre.model";
import { IMongooseDocument } from "./mongooseDocument.model";
import { IPlatform } from "./platform.model";
import { IPublisher } from "./publisher.model";

export interface IGame extends IMongooseDocument {
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
  finalPrice: number;
  slug?: string;
  storyLine?: string;
}
