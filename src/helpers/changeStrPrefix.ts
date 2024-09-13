export type changeStrPrefix<
  str extends string,
  curPrefix extends string,
  newPrefix extends string
> = str extends `${curPrefix}${infer Rest}` ? `${newPrefix}${Rest}` : str;

export const changeObjectKeysPrefix = <T extends string, Y>(
  obj: Record<T, Y>,
  prefix: string,
  newPrefix: string,
  convertFinalKeyNameFirstLetterToSuitCamelCaseStyle: boolean = true,
  additionalObjectEntryValueManagementFn: (
    objEntryValue: Y,
    newKeyName: string
  ) => unknown = (objEntryValue) => objEntryValue
) =>
  Object.fromEntries(
    Object.entries<Y>(obj).map((objEntry) => {
      const keyNameWithReplacedPrefix = objEntry[0].replace(prefix, newPrefix);
      const newKeyName = convertFinalKeyNameFirstLetterToSuitCamelCaseStyle
        ? keyNameWithReplacedPrefix.replace(
            keyNameWithReplacedPrefix[0],
            keyNameWithReplacedPrefix[0].toLowerCase()
          )
        : keyNameWithReplacedPrefix;
      return [
        newKeyName,
        additionalObjectEntryValueManagementFn(objEntry[1], newKeyName),
      ];
    })
  );
