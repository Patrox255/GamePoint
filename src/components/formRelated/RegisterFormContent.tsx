import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

import InputFieldElement, {
  InputFieldSingleRow,
} from "../UI/InputFieldElement";
import inputFieldsObjs from "../../lib/inputFieldsObjs";
import DatePickerInputFieldElement from "../UI/DatePickerInputFieldElement";
import LoadingFallback from "../UI/LoadingFallback";
import Error from "../UI/Error";
import { getCountries } from "../../lib/fetch";
import { useContext, useMemo } from "react";
import { IInputFieldsObjs } from "../../lib/inputFieldsObjs";
import { inputValue } from "../UI/Input";
import { ContactInformationFormContentContext } from "./ContactInformationFormContent";

export type IInputFieldsDefaultValues = {
  [key in keyof IInputFieldsObjs]: inputValue;
};

export default function RegisterFormContent({
  defaultValuesObjFromProps,
}: {
  defaultValuesObjFromProps?: IInputFieldsDefaultValues;
}) {
  const defaultValuesObj =
    useContext(ContactInformationFormContentContext).defaultValuesObj ||
    defaultValuesObjFromProps;

  const inputFieldsObjectsWithDefaultValues = useMemo(() => {
    const newInputFields: IInputFieldsObjs = {
      ...inputFieldsObjs,
    };
    if (!defaultValuesObj) return newInputFields;
    [...Object.entries(defaultValuesObj)].forEach((defaultValuesEntry) => {
      if (defaultValuesEntry[0] in newInputFields)
        newInputFields[defaultValuesEntry[0] as keyof IInputFieldsObjs] = {
          ...newInputFields[defaultValuesEntry[0] as keyof IInputFieldsObjs],
          defaultValue: defaultValuesEntry[1],
        };
    });
    return newInputFields;
  }, [defaultValuesObj]);

  const {
    error: countriesError,
    data: countriesData,
    isLoading: countriesIsLoading,
  } = useQuery({
    queryFn: ({ signal }) => getCountries(signal),
    queryKey: ["countries"],
  });

  return (
    <motion.div
      className="contact-information-inputs-container w-full flex flex-col gap-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <InputFieldSingleRow>
        <InputFieldElement
          inputFieldObjFromProps={inputFieldsObjectsWithDefaultValues.firstName}
        />
        <InputFieldElement
          inputFieldObjFromProps={inputFieldsObjectsWithDefaultValues.surName}
        />
      </InputFieldSingleRow>
      <DatePickerInputFieldElement
        inputFieldObjFromProps={inputFieldsObjectsWithDefaultValues.dateOfBirth}
      />
      <InputFieldElement
        inputFieldObjFromProps={inputFieldsObjectsWithDefaultValues.phoneNr}
      />
      {countriesIsLoading && <LoadingFallback />}
      {countriesError && <Error message={countriesError.message} />}
      {!countriesIsLoading &&
        !countriesError &&
        countriesData &&
        countriesData.data && (
          <InputFieldElement
            inputFieldObjFromProps={{
              ...inputFieldsObjectsWithDefaultValues.country,
              selectOptions: countriesData.data.map(
                (country) => country.name.common
              ),
            }}
          />
        )}
      <InputFieldSingleRow>
        <InputFieldElement
          inputFieldObjFromProps={inputFieldsObjectsWithDefaultValues.zipCode}
        />
        <InputFieldElement
          inputFieldObjFromProps={inputFieldsObjectsWithDefaultValues.city}
        />
      </InputFieldSingleRow>
      <InputFieldSingleRow>
        <InputFieldElement
          inputFieldObjFromProps={inputFieldsObjectsWithDefaultValues.street}
        />
        <InputFieldElement
          inputFieldObjFromProps={inputFieldsObjectsWithDefaultValues.house}
        />
        <InputFieldElement
          inputFieldObjFromProps={inputFieldsObjectsWithDefaultValues.flat}
        />
      </InputFieldSingleRow>
    </motion.div>
  );
}
