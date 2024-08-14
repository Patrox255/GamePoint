import { useContext, useState } from "react";
import Button from "../UI/Button";
import { dateTimeFormat } from "../../helpers/dateTimeFormat";
import { ChangeActiveUserContactInformationContext } from "./UserContactInformation";
import Error from "../UI/Error";
import { IAdditionalContactInformation } from "../../models/additionalContactInformation.model";

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

export default function UserContactInformationOverviews({
  contactInformationArrFromProps,
  handleApplyClickFromProps,
  userActiveContactInformationIdFromProps,
  omitShowingControlButtons = false,
  externalContactInformationIdSet,
  externalContactInformationIdState,
  additionalTailwindClasses = "",
}: {
  contactInformationArrFromProps?: IAdditionalContactInformation[];
  handleApplyClickFromProps?: (newContactInformationId: string) => void;
  userActiveContactInformationIdFromProps?: string;
  omitShowingControlButtons?: boolean;
  externalContactInformationIdState?: string;
  externalContactInformationIdSet?: React.Dispatch<
    React.SetStateAction<string>
  >;
  additionalTailwindClasses?: string;
}) {
  const {
    activeContactInformationOverviewIdFromReq:
      activeContactInformationOverviewIdFromCtx,
    contactInformationArr: contactInformationArrFromCtx,
    error,
    handleApplyClick: handleApplyClickFromCtx,
    data,
    setContactInformationSectionState,
  } = useContext(ChangeActiveUserContactInformationContext);

  const activeContactInformationOverviewIdFromReq =
    activeContactInformationOverviewIdFromCtx ??
    userActiveContactInformationIdFromProps;
  const handleApplyClick = handleApplyClickFromCtx || handleApplyClickFromProps;
  const contactInformationArr =
    contactInformationArrFromProps || contactInformationArrFromCtx;

  const [
    curActiveContactInformationOverviewIdState,
    setCurActiveContactInformationOverviewIdState,
  ] = useState<string>(activeContactInformationOverviewIdFromReq!);

  if (
    activeContactInformationOverviewIdFromReq === undefined &&
    externalContactInformationIdState === undefined &&
    !externalContactInformationIdSet
  )
    return (
      <Error message="Has to provide initial contact information entry id or such a state managing this property by context or props for this component to operate properly!" />
    );

  const validationOrOverallError = error
    ? Array.isArray(error)
      ? error[0]
      : error
    : data?.data && typeof data.data === "object"
    ? data.data
    : undefined;

  const curActiveContactInformationOverviewId =
    externalContactInformationIdState ??
    curActiveContactInformationOverviewIdState;
  const setCurActiveContactInformationOverviewId =
    externalContactInformationIdSet ||
    setCurActiveContactInformationOverviewIdState;

  return (
    <>
      <ul
        className={`contact-information-overviews-container w-full flex justify-center items-center gap-4 ${additionalTailwindClasses}`}
      >
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
      {!omitShowingControlButtons && (
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
      )}
      {validationOrOverallError && (
        <Error message={validationOrOverallError.message} smallVersion />
      )}
    </>
  );
}
