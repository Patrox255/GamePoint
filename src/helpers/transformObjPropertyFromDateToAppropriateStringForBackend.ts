type transformationResObj<T extends object, K extends keyof T> = Omit<T, K> & {
  [P in K]: string;
};

const transformObjPropertiesFromDateToAppropriateStringForBackend = <
  T extends object,
  K extends keyof T
>(
  obj: T,
  properties: K[]
): transformationResObj<T, K> =>
  Object.fromEntries(
    [...Object.entries(obj)].map((objEntry) => {
      if (!properties.includes(objEntry[0] as K)) return objEntry;
      return [
        objEntry[0],
        `${objEntry[1].getFullYear()}-${
          objEntry[1].getMonth() + 1
        }-${objEntry[1].getDate()}`,
      ];
    })
  ) as unknown as transformationResObj<T, K>;

export default transformObjPropertiesFromDateToAppropriateStringForBackend;
