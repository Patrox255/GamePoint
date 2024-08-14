import { ReactNode } from "react";

import Button from "../UI/Button";
import DetailedContactInformation from "./DetailedContactInformation";
import OrderPageHeader from "./OrderPageHeader";
import OrderCartInformation from "./OrderCartInformation";

export const OrderSummarySectionWrapper = ({
  children,
  additionalClasses = "",
  identificator,
}: {
  children: ReactNode;
  additionalClasses?: string;
  identificator: string;
}) => (
  <section
    id={identificator}
    className={`text-center bg-darkerBg rounded-xl py-8 flex flex-col gap-4 px-4 ${additionalClasses}`}
  >
    {children}
  </section>
);

export default function OrderSummary({
  handleGoBack,
}: {
  handleGoBack: () => void;
}) {
  return (
    <>
      <OrderPageHeader>Order summary</OrderPageHeader>
      <section className="order-details-entries-wrapper flex flex-col gap-8">
        <DetailedContactInformation />
        <OrderCartInformation />
      </section>
      <section className="flex justify-center items-center px-4 py-8 gap-4">
        <Button onClick={handleGoBack}>Go back</Button>
        <Button>Place the order</Button>
      </section>
    </>
  );
}
