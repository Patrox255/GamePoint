export interface IMongooseDocument {
  _id: string;
}

export type mongooseDocumentEntryPossibleToBePopulated<populatedType> =
  | populatedType
  | string;
