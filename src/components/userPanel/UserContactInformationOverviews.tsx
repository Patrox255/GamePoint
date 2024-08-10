import { ReactNode, useContext, useState } from "react";
import Button from "../UI/Button";
import { dateTimeFormat } from "../../helpers/dateTimeFormat";
import { ChangeActiveUserContactInformationContext } from "./UserContactInformation";
import Error from "../UI/Error";

export default function UserContactInformationOverviews({
  children,
}: {
  children: ReactNode;
}) {
  const {
    activeContactInformationOverviewIdFromReq,
    contactInformationArr,
    error,
    handleApplyClick,
    data,
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
      <ul className="contact-information-overviews-container w-full flex flex-col justify-center items-center">
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
                    <>&nbsp;contactInformationEntry.flat</>
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
          Apply changes
        </Button>
        {children}
      </div>
      {validationOrOverallError && (
        <Error message={validationOrOverallError.message} smallVersion />
      )}
    </>
  );
}
