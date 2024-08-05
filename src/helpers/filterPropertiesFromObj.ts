const filterPropertiesFromObj = (obj: object, properties: string[]) => ({
  ...Object.fromEntries(
    Object.entries(obj).filter(
      (objEntry) =>
        !properties.find((propertiesEntry) => propertiesEntry === objEntry[0])
    )
  ),
});

export default filterPropertiesFromObj;
