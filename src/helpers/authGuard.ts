import { LoaderFunction, redirect } from "react-router-dom";
import { getAuthData, IGetAuthResponse, queryClient } from "../lib/fetch";
import createSearchParamsFromRequestURL from "./createSearchParamsFromRequestURL";

// Returns auth data or nothing if a user hasn't been authorized
export async function authGuardFn(requestURL: string) {
  try {
    const pathName = new URL(requestURL).pathname;
    const {
      data: { isAdmin, login },
    } = await queryClient.fetchQuery<IGetAuthResponse>({
      queryKey: ["userAuth", pathName],
      queryFn: ({ signal }) => getAuthData(signal),
    });
    return { isAdmin, login };
  } catch (e) {
    return false;
  }
}

// Loader to redirect from pages only for authorized users
const authGuard: LoaderFunction = async function ({ request }) {
  const requestURL = request.url;
  const previousPagePathName =
    createSearchParamsFromRequestURL(requestURL)?.get("previousPagePathName") ||
    "/";
  const authGuardFnRes = await authGuardFn(requestURL);
  return authGuardFnRes ? redirect(previousPagePathName) : authGuardFnRes;
};

export default authGuard;
