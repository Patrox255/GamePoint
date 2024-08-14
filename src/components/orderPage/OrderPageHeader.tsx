import { ReactNode } from "react";

import Header from "../UI/headers/Header";

export default function OrderPageHeader({ children }: { children: ReactNode }) {
  return (
    <Header
      size="large"
      additionalTailwindClasses="pb-12 px-4"
      usePaddingBottom={false}
    >
      {children}
    </Header>
  );
}
