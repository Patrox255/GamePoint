import { useState } from "react";

export default function usePages() {
  const [pageNr, setPageNr] = useState<number>(0);

  return { pageNr, setPageNr };
}
