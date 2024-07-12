import { IDeveloper } from "../../models/devloper.model";
import { IGenre } from "../../models/genre.model";
import { IPlatform } from "../../models/platform.model";
import { IPublisher } from "../../models/publisher.model";

export type useQueryGetTagsAvailableTagsNames =
  | "genres"
  | "platforms"
  | "developers"
  | "publishers";

export type receivedTagInterface<
  gameDocumentTagPropertyName extends useQueryGetTagsAvailableTagsNames
> = gameDocumentTagPropertyName extends "genres"
  ? IGenre
  : gameDocumentTagPropertyName extends "platforms"
  ? IPlatform
  : gameDocumentTagPropertyName extends "developers"
  ? IDeveloper
  : gameDocumentTagPropertyName extends "publishers"
  ? IPublisher
  : undefined;
