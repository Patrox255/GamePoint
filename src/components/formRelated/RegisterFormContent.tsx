import { motion } from "framer-motion";
import InputFieldElement, {
  InputFieldSingleRow,
} from "../UI/InputFieldElement";
import inputFieldsObjs from "../../lib/inputFieldsObjs";
import DatePickerInputFieldElement from "../UI/DatePickerInputFieldElement";
import LoadingFallback from "../UI/LoadingFallback";
import Error from "../UI/Error";
import { getCountries } from "../../lib/fetch";
import { useQuery } from "@tanstack/react-query";

export default function RegisterFormContent() {
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
        <InputFieldElement inputFieldObjFromProps={inputFieldsObjs.firstName} />
        <InputFieldElement inputFieldObjFromProps={inputFieldsObjs.surName} />
      </InputFieldSingleRow>
      <DatePickerInputFieldElement
        inputFieldObjFromProps={inputFieldsObjs.dateOfBirth}
      />
      <InputFieldElement inputFieldObjFromProps={inputFieldsObjs.phoneNr} />
      {countriesIsLoading && <LoadingFallback />}
      {countriesError && <Error message={countriesError.message} />}
      {!countriesIsLoading &&
        !countriesError &&
        countriesData &&
        countriesData.data && (
          <InputFieldElement
            inputFieldObjFromProps={{
              ...inputFieldsObjs.country,
              selectOptions: countriesData.data.map(
                (country) => country.name.common
              ),
            }}
          />
        )}
      <InputFieldSingleRow>
        <InputFieldElement inputFieldObjFromProps={inputFieldsObjs.zipCode} />
        <InputFieldElement inputFieldObjFromProps={inputFieldsObjs.city} />
      </InputFieldSingleRow>
      <InputFieldSingleRow>
        <InputFieldElement inputFieldObjFromProps={inputFieldsObjs.street} />
        <InputFieldElement inputFieldObjFromProps={inputFieldsObjs.house} />
        <InputFieldElement inputFieldObjFromProps={inputFieldsObjs.flat} />
      </InputFieldSingleRow>
    </motion.div>
  );
}
