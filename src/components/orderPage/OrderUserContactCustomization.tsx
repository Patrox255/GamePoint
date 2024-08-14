import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Error from "../UI/Error";
import UserContactInformationOverviews from "../userPanel/UserContactInformationOverviews";
import { OrderUserContactCustomizationContext } from "../../store/orderPage/OrderUserContactCustomizationContext";
import Button from "../UI/Button";
import navigatePaths from "../../helpers/navigatePaths";
import { IAdditionalContactInformation } from "../../models/additionalContactInformation.model";

export default function OrderUserContactCustomization({
  handleSelectContactInformation,
  contactInformationArr,
  contactInformationError,
  curUserActiveContactInformationId,
}: {
  handleSelectContactInformation: () => void;
  contactInformationArr: IAdditionalContactInformation[] | undefined;
  curUserActiveContactInformationId: string | undefined;
  contactInformationError: Error | null;
}) {
  const {
    curSelectedContactInformationOverviewId,
    setCurSelectedContactInformationOverviewId,
  } = useContext(OrderUserContactCustomizationContext);

  const navigate = useNavigate();

  useEffect(() => {
    setCurSelectedContactInformationOverviewId(
      curUserActiveContactInformationId!
    );
  }, [
    curUserActiveContactInformationId,
    setCurSelectedContactInformationOverviewId,
  ]);

  const [
    noSelectedContactInformationError,
    setNoSelectedContactInformationError,
  ] = useState<boolean>(false);

  let content;
  if (contactInformationError)
    content = <Error message={contactInformationError.message} />;
  if (contactInformationArr && curUserActiveContactInformationId !== undefined)
    content = (
      <article className="w-full flex flex-col gap-8 justify-center items-center">
        <UserContactInformationOverviews
          omitShowingControlButtons
          contactInformationArrFromProps={contactInformationArr}
          externalContactInformationIdState={
            curSelectedContactInformationOverviewId
          }
          externalContactInformationIdSet={
            setCurSelectedContactInformationOverviewId
          }
        />
        <article className="contact-information-overviews-control flex justify-center items-center gap-4">
          <Button
            disabled={curSelectedContactInformationOverviewId === ""}
            onClick={() => {
              if (curSelectedContactInformationOverviewId === "")
                return setNoSelectedContactInformationError(true);
              handleSelectContactInformation();
            }}
          >
            Select
          </Button>
          <Button onClick={() => navigate(navigatePaths.userPanelContact)}>
            Customize your contact details
          </Button>
        </article>
        {noSelectedContactInformationError && (
          <Error
            message="You haven't selected any contact details entry! Please do so in order to proceed with the order."
            smallVersion
          />
        )}
      </article>
    );
  return content;
}
