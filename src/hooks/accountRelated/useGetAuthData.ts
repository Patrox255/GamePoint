import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";

import { getAuthData } from "../../lib/fetch";

export default function useGetAuthData() {
  const location = useLocation();

  const { data, error, isLoading } = useQuery({
    queryKey: ["userAuth", location.pathname],
    queryFn: ({ signal }) => getAuthData(signal),
    retry: false,
  });

  return { authData: { data, error, isLoading }, location };
}
