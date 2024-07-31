import { useMutation, useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useMemo, useState } from "react";

import MainWrapper from "../components/structure/MainWrapper";
import FormWithErrorHandling, {
  FormActionBackendErrorResponse,
  FormActionBackendResponse,
} from "../components/UI/FormWithErrorHandling";
import { getCountries, register } from "../lib/fetch";
import inputFieldsObjs from "../lib/inputFieldsObjs";
import Button from "../components/UI/Button";
import InputFieldElement, {
  InputFieldSingleRow,
} from "../components/UI/InputFieldElement";
import LoadingFallback from "../components/UI/LoadingFallback";
import Error from "../components/UI/Error";
import DatePickerInputFieldElement from "../components/UI/DatePickerInputFieldElement";

export interface IActionMutateArgsRegister {
  login: string;
  password: string;
  confirmedPassword: string;
  email: string;
  firstName: string;
  surName: string;
  dateOfBirth: string;
  phoneNr: string;
  country: string;
  zipCode: string;
  city: string;
  street: string;
  house: string;
  flat?: string;
}

const registerInputFields = [
  inputFieldsObjs.login,
  inputFieldsObjs.password,
  inputFieldsObjs.confirmPassword,
  inputFieldsObjs.email,
].map((inputFieldObj) => ({ ...inputFieldObj, renderLabel: true }));

export default function RegisterPage() {
  const { mutate, error, data, isPending } = useMutation<
    FormActionBackendResponse,
    FormActionBackendErrorResponse,
    IActionMutateArgsRegister
  >({
    mutationFn: register,
  });

  const {
    error: countriesError,
    data: countriesData,
    isLoading: countriesIsLoading,
  } = useQuery({
    queryFn: ({ signal }) => getCountries(signal),
    queryKey: ["countries"],
  });

  const queryRelatedToActionStateStable = useMemo(
    () => ({
      error,
      data,
      isPending,
    }),
    [data, error, isPending]
  );

  const handleFormSubmit = useCallback(
    (formDataObj: IActionMutateArgsRegister) => {
      mutate(formDataObj);
    },
    [mutate]
  );

  const [expandedContactInformation, setExpandedContactInformation] =
    useState<boolean>(false);

  return (
    <MainWrapper>
      <FormWithErrorHandling
        onSubmit={handleFormSubmit}
        queryRelatedToActionState={queryRelatedToActionStateStable}
        inputFields={registerInputFields}
      >
        <InputFieldElement
          inputFieldObjFromProps={inputFieldsObjs.expandedContactInformation}
          onChangeCheckbox={setExpandedContactInformation}
          checkedCheckbox={expandedContactInformation}
        />
        {expandedContactInformation && (
          <AnimatePresence mode="wait">
            <motion.div
              className="contact-information-inputs-container w-full flex flex-col gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <InputFieldSingleRow>
                <InputFieldElement
                  inputFieldObjFromProps={inputFieldsObjs.firstName}
                />
                <InputFieldElement
                  inputFieldObjFromProps={inputFieldsObjs.surName}
                />
              </InputFieldSingleRow>
              <DatePickerInputFieldElement
                inputFieldObjFromProps={inputFieldsObjs.dateOfBirth}
              />
              <InputFieldElement
                inputFieldObjFromProps={inputFieldsObjs.phoneNr}
              />
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
                <InputFieldElement
                  inputFieldObjFromProps={inputFieldsObjs.zipCode}
                />
                <InputFieldElement
                  inputFieldObjFromProps={inputFieldsObjs.city}
                />
              </InputFieldSingleRow>
              <InputFieldSingleRow>
                <InputFieldElement
                  inputFieldObjFromProps={inputFieldsObjs.street}
                />
                <InputFieldElement
                  inputFieldObjFromProps={inputFieldsObjs.house}
                />
                <InputFieldElement
                  inputFieldObjFromProps={inputFieldsObjs.flat}
                />
              </InputFieldSingleRow>
            </motion.div>
          </AnimatePresence>
        )}
        <div className="form-controls flex gap-3 justify-between w-full py-6">
          <Button
            type="reset"
            onClick={() => setExpandedContactInformation(false)}
          >
            Reset fields
          </Button>
          <Button>Register</Button>
        </div>
      </FormWithErrorHandling>
    </MainWrapper>
  );
}
