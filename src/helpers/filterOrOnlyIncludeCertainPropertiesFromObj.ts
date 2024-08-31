const filterOrOnlyIncludeCertainPropertiesFromObj = (
  obj: object,
  properties: string[],
  onlyInclude: boolean = false
) => ({
  ...Object.fromEntries(
    Object.entries(obj).filter((objEntry) => {
      const curProperty = properties.find(
        (propertiesEntry) => propertiesEntry === objEntry[0]
      );
      return onlyInclude ? curProperty : !curProperty;
    })
  ),
});

export default filterOrOnlyIncludeCertainPropertiesFromObj;
