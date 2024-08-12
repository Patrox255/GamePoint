import { useContext, useState } from "react";
import Button from "../UI/Button";
import { dateTimeFormat } from "../../helpers/dateTimeFormat";
import { ChangeActiveUserContactInformationContext } from "./UserContactInformation";
import Error from "../UI/Error";

export const AddANewContactDetailsEntry = function () {
  const { setContactInformationSectionState } = useContext(
    ChangeActiveUserContactInformationContext
  );

  return (
    <Button onClick={() => setContactInformationSectionState("add")}>
      Add a new contact details entry
    </Button>
  );
};

export default function UserContactInformationOverviews() {
  const {
    activeContactInformationOverviewIdFromReq,
    contactInformationArr,
    error,
    handleApplyClick,
    data,
    setContactInformationSectionState,
  } = useContext(ChangeActiveUserContactInformationContext);

  const [
    curActiveContactInformationOverviewId,
    setCurActiveContactInformationOverviewId,
  ] = useState<string>(activeContactInformationOverviewIdFromReq);

  const validationOrOverallError = error
    ? Array.isArray(error)
      ? error[0]
      : error
    : data?.data && typeof data.data === "object"
    ? data.data
    : undefined;

  return (
    <>
      <ul className="contact-information-overviews-container w-full flex justify-center items-center gap-4">
        {contactInformationArr.map((contactInformationEntry) => {
          const activeEntry =
            contactInformationEntry._id ===
            curActiveContactInformationOverviewId;
          return (
            <Button
              key={contactInformationEntry._id}
              useBgColor={false}
              active={activeEntry}
              canClickWhileActive
              onClick={() =>
                activeEntry
                  ? setCurActiveContactInformationOverviewId("")
                  : setCurActiveContactInformationOverviewId(
                      contactInformationEntry._id
                    )
              }
            >
              <div className="flex flex-col">
                <p>
                  {contactInformationEntry.firstName}&nbsp;
                  {contactInformationEntry.surName}
                </p>
                <p>
                  {dateTimeFormat.format(contactInformationEntry.dateOfBirth)}
                </p>
                <p>{contactInformationEntry.phoneNr}</p>
                <p>
                  {contactInformationEntry.zipCode}&nbsp;
                  {contactInformationEntry.city}&nbsp;
                  {contactInformationEntry.house}
                  {contactInformationEntry.flat ? (
                    <>&nbsp;{contactInformationEntry.flat}</>
                  ) : (
                    ""
                  )}
                </p>
              </div>
            </Button>
          );
        })}
      </ul>
      <div className="user-contact-information-overviews-control flex gap-4 justify-center items-center py-12">
        <Button
          disabled={
            curActiveContactInformationOverviewId ===
            activeContactInformationOverviewIdFromReq
          }
          onClick={() =>
            handleApplyClick(curActiveContactInformationOverviewId)
          }
        >
          Set as active contact details
        </Button>
        <Button
          disabled={curActiveContactInformationOverviewId === ""}
          onClick={() =>
            setContactInformationSectionState(
              curActiveContactInformationOverviewId
            )
          }
        >
          Edit selected contact details
        </Button>
        <AddANewContactDetailsEntry />
      </div>
      {validationOrOverallError && (
        <Error message={validationOrOverallError.message} smallVersion />
      )}
    </>
  );
}
