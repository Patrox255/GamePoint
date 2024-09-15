export type changeStrPrefix<
  str extends string,
  curPrefix extends string,
  newPrefix extends string,
  changeFirstCharacterToSuitCamelCase extends boolean = false
> = str extends `${curPrefix}${infer Rest}`
  ? `${newPrefix}${changeFirstCharacterToSuitCamelCase extends false
      ? Rest
      : Rest extends `${infer First}${infer Remaining}`
      ? `${Lowercase<First>}${Remaining}`
      : Rest}`
  : str;

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
