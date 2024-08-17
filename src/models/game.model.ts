import { IDeveloper } from "./developer.model";
import { IGenre } from "./genre.model";
import { IMongooseDocument } from "./mongooseDocument.model";
import { IPlatform } from "./platform.model";
import { IPublisher } from "./publisher.model";
import { IReview } from "./review.model";

export interface IProductPriceInformation {
  price: number;
  finalPrice: number;
  discount: number;
}

export interface IGame extends IMongooseDocument, IProductPriceInformation {
  title: string;
  discount: number;
  releaseDate: Date;
  genres: IGenre[];
  platforms: IPlatform[];
  developer?: IDeveloper;
  publisher?: IPublisher;
  popularity?: number;
  artworks: string[];
  summary: string;
  slug?: string;
  storyLine?: string;
  reviews: IReview[];
}
