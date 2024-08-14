import { useCallback, useContext, useMemo } from "react";

import { OrderSummaryContentContext } from "../../store/orderPage/OrderSummaryContext";
import inputFieldsObjs, { IInputFieldsObjs } from "../../lib/inputFieldsObjs";
import { IFormInputField } from "../UI/FormWithErrorHandling";
import { dateTimeFormat } from "../../helpers/dateTimeFormat";

const customLookingContactInformationInputFieldsPropertiesNames = [
  "firstName",
  "surName",
  "zipCode",
  "city",
  "street",
  "house",
  "flat",
];

type IContactInformationInputFieldEntry = (string | IFormInputFieldWithValue)[];
type IFormInputFieldWithValue = IFormInputField & { value: string };
const FilledContactInformationInputFieldsRepresentationGenerationFn =
  function ({
    propertyNameAndRelatedInputFieldArr,
    displayInputFieldsInOneRow = false,
  }: {
    propertyNameAndRelatedInputFieldArr: IContactInformationInputFieldEntry[];
    displayInputFieldsInOneRow?: boolean;
  }) {
    const res = propertyNameAndRelatedInputFieldArr.map(
      (propertyNameAndRelatedInputFieldArrEntry) => (
        <FilledContactInformationInputFieldRepresentation
          propertyNameAndRelatedInputField={
            propertyNameAndRelatedInputFieldArrEntry
          }
          key={`user-contact-information-${propertyNameAndRelatedInputFieldArrEntry[0]}`}
        />
      )
    );
    return displayInputFieldsInOneRow ? (
      <section className="user-contact-information-group flex gap-4 flex-wrap justify-center items-center">
        {res}
      </section>
    ) : (
      res
    );
  };

const FilledContactInformationInputFieldRepresentation = function ({
  propertyNameAndRelatedInputField,
}: {
  propertyNameAndRelatedInputField: IContactInformationInputFieldEntry;
}) {
  const inputFieldObj =
    propertyNameAndRelatedInputField[1] as IFormInputFieldWithValue;
  const inputFieldValue = inputFieldObj.value;

  return (
    <section
      className={`user-contact-information-${propertyNameAndRelatedInputField[0]}`}
    >
      {inputFieldObj.propertyNameToDisplay}:{" "}
      {inputFieldObj.type === "date"
        ? dateTimeFormat.format(inputFieldValue as unknown as Date)
        : inputFieldValue}
    </section>
  );
};

export default function FilledContactInformationInputFieldsRepresentation() {
  const contactInformationToRender = useContext(OrderSummaryContentContext)
    .contactInformationToRender!;
  const contactInformationPropertiesWithAssociatedInputFields = useMemo(
    () =>
      [...Object.entries(contactInformationToRender || {})]
        .filter(
          (contactInformationToRenderEntry) =>
            contactInformationToRenderEntry[1]
        )
        .map((contactInformationToRenderEntry) => {
          const relatedInputFieldObj =
            inputFieldsObjs[
              contactInformationToRenderEntry[0] as keyof IInputFieldsObjs
            ];
          if (!relatedInputFieldObj) return null;
          return [
            contactInformationToRenderEntry[0],
            {
              ...relatedInputFieldObj,
              value: contactInformationToRenderEntry[1],
            },
          ];
        })
        .filter(
          (contactInformationToRenderEntry) =>
            contactInformationToRenderEntry !== null
        ),
    [contactInformationToRender]
  );
  const contactInformationPropertiesWithAssociatedInputFieldsBesidesCustomLookingOnes =
    useMemo(
      () =>
        contactInformationPropertiesWithAssociatedInputFields.filter(
          (contactInformationPropertiesWithAssociatedInputFieldsEntry) =>
            !customLookingContactInformationInputFieldsPropertiesNames.includes(
              contactInformationPropertiesWithAssociatedInputFieldsEntry[0] as string
            )
        ),
      [contactInformationPropertiesWithAssociatedInputFields]
    );

  const FirstAndLastNameInputFieldsRepresentation = useCallback(
    () => (
      <FilledContactInformationInputFieldsRepresentationGenerationFn
        propertyNameAndRelatedInputFieldArr={contactInformationPropertiesWithAssociatedInputFields.filter(
          (contactInformationPropertiesWithAssociatedInputFieldsEntry) =>
            contactInformationPropertiesWithAssociatedInputFieldsEntry[0] ===
              "firstName" ||
            contactInformationPropertiesWithAssociatedInputFieldsEntry[0] ===
              "surName"
        )}
        displayInputFieldsInOneRow
      />
    ),
    [contactInformationPropertiesWithAssociatedInputFields]
  );
  const ResidentialAddressInputFieldsRepresentation = useCallback(
    () => (
      <FilledContactInformationInputFieldsRepresentationGenerationFn
        propertyNameAndRelatedInputFieldArr={contactInformationPropertiesWithAssociatedInputFields.filter(
          (contactInformationPropertiesWithAssociatedInputFieldsEntry) =>
            customLookingContactInformationInputFieldsPropertiesNames
              .slice(2)
              .includes(
                contactInformationPropertiesWithAssociatedInputFieldsEntry[0] as string
              )
        )}
        displayInputFieldsInOneRow
      />
    ),
    [contactInformationPropertiesWithAssociatedInputFields]
  );

  return (
    <>
      <FirstAndLastNameInputFieldsRepresentation />
      <FilledContactInformationInputFieldsRepresentationGenerationFn
        propertyNameAndRelatedInputFieldArr={
          contactInformationPropertiesWithAssociatedInputFieldsBesidesCustomLookingOnes
        }
      />
      <ResidentialAddressInputFieldsRepresentation />
    </>
  );
}
