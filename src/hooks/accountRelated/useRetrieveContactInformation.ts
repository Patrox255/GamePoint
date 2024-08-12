import { useQuery } from "@tanstack/react-query";
import { useAppSelector } from "../reduxStore";

import { retrieveContactInformation } from "../../lib/fetch";

export default function useRetrieveContactInformation() {
  const login = useAppSelector((state) => state.userAuthSlice.login);

  const { data, error, isLoading } = useQuery({
    queryKey: ["contact-information", login],
    queryFn: ({ signal }) => retrieveContactInformation(signal),
  });
  return { data, error, isLoading };
}
