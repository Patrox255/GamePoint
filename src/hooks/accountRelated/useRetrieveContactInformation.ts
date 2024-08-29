import { useQuery } from "@tanstack/react-query";
import { useAppSelector } from "../reduxStore";

import { retrieveContactInformation } from "../../lib/fetch";
import { useMemo } from "react";

export default function useRetrieveContactInformation(customLogin?: string) {
  const curUserLogin = useAppSelector((state) => state.userAuthSlice.login);
  const login = customLogin ? customLogin : curUserLogin;

  const { data, error, isLoading } = useQuery({
    queryKey: ["contact-information", login],
    queryFn: ({ signal }) => retrieveContactInformation(signal),
  });

  const contactInformationArr = useMemo(() => {
    const retrievedAdditionalContactInformation =
      data?.data?.additionalContactInformation;
    return !isLoading && retrievedAdditionalContactInformation
      ? retrievedAdditionalContactInformation
      : undefined;
  }, [data, isLoading]);
  return { data, error, isLoading, contactInformationArr };
}
