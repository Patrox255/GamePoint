import { useQuery } from "@tanstack/react-query";
import { useAppSelector } from "../reduxStore";

import {
  IRetrieveOrModifyContactInformationCustomUserDataProperties,
  retrieveContactInformation,
} from "../../lib/fetch";
import { useMemo } from "react";

type customUserContactInformationArg = undefined | string;
export default function useRetrieveContactInformation(
  contactInformationForCustomUserArg?: IRetrieveOrModifyContactInformationCustomUserDataProperties
) {
  let customUserId: customUserContactInformationArg;
  let customUserLogin: customUserContactInformationArg;
  if (contactInformationForCustomUserArg)
    ({ customUserId, customUserLogin } = contactInformationForCustomUserArg);
  const curUserLogin = useAppSelector((state) => state.userAuthSlice.login);
  const isRetrievingContactInformationForCustomLogin =
    customUserLogin && customUserLogin !== curUserLogin;
  const login = isRetrievingContactInformationForCustomLogin
    ? customUserLogin
    : curUserLogin;
  const contactInformationQueryKey = useMemo(
    () => ["contact-information", login],
    [login]
  );

  const { data, error, isLoading } = useQuery({
    queryKey: contactInformationQueryKey,
    queryFn: ({ signal }) =>
      retrieveContactInformation({
        signal,
        ...(isRetrievingContactInformationForCustomLogin && {
          customUserId,
          customUserLogin,
        }),
      }),
  });

  const contactInformationArr = useMemo(() => {
    const retrievedAdditionalContactInformation =
      data?.data?.additionalContactInformation;
    return !isLoading && retrievedAdditionalContactInformation
      ? retrievedAdditionalContactInformation
      : undefined;
  }, [data, isLoading]);
  return {
    data,
    error,
    isLoading,
    contactInformationArr,
    contactInformationQueryKey,
  };
}
