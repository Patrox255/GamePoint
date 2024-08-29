import { motion } from "framer-motion";
import { ReactNode, useContext } from "react";

import { DetailedContactInformationDefaultContent } from "../../../orderPage/DetailedContactInformation";
import { tabsSectionElementTransitionProperties } from "../../../structure/TabsComponent";
import { UpdateOrderDetailsContext } from "../../../../store/userPanel/admin/orders/UpdateOrderDetailsContext";
import Button from "../../../UI/Button";
import OrderFindingSummaryOrdererAvailableContactInformationOverviews from "./OrderFindingSummaryOrdererAvailableContactInformationOverviews";

const OrderFindingSummaryDetailedContactInformationSection = ({
  children,
}: {
  children: ReactNode;
}) => (
  <motion.section {...tabsSectionElementTransitionProperties}>
    {children}
  </motion.section>
);

export default function OrderFindingSummaryDetailedContactInformation() {
  const {
    selectedContactInformationEntryIdToChangeTheOrderOneTo, // it is undefined when admin hasn't initiated the procedure of changing contact information
    // entry, otherwise it is equal to the selected entry id or "" in case admin hasn't selected any of the entries
    setSelectedContactInformationEntryIdToChangeTheOrderOneTo,
  } = useContext(UpdateOrderDetailsContext);

  let contactInformationContent = (
    <DetailedContactInformationDefaultContent>
      <Button
        onClick={() =>
          setSelectedContactInformationEntryIdToChangeTheOrderOneTo("")
        }
      >
        Change the selected orderer's contact details entry used for this order
      </Button>
    </DetailedContactInformationDefaultContent>
  );

  if (selectedContactInformationEntryIdToChangeTheOrderOneTo !== undefined)
    contactInformationContent = (
      <OrderFindingSummaryOrdererAvailableContactInformationOverviews />
    );

  return (
    <OrderFindingSummaryDetailedContactInformationSection>
      {contactInformationContent}
    </OrderFindingSummaryDetailedContactInformationSection>
  );
}
