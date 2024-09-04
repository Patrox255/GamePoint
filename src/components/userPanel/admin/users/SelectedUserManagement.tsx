import { Link, useLocation } from "react-router-dom";
import createUrlWithCurrentSearchParams from "../../../../helpers/createUrlWithCurrentSearchParams";
import { useMemo } from "react";

const searchParamsEntriesToOverrideToGetToTheDesiredOrderSummary = (
  orderId: string
) => ({ adminSelectedOrder: orderId });

export default function SelectedUserManagement({
  selectedUserLogin,
}: {
  selectedUserLogin: string;
}) {
  const { search, pathname } = useLocation();
  const searchParamsStable = useMemo(
    () => new URLSearchParams(search),
    [search]
  );

  return (
    <p>
      <Link
        to={createUrlWithCurrentSearchParams({
          searchParams: searchParamsStable,
          pathname,
          searchParamsEntriesToOverride:
            searchParamsEntriesToOverrideToGetToTheDesiredOrderSummary(
              "66ce1fe90132d9281d5bec17"
            ),
        })}
      >
        Order&nbsp;{selectedUserLogin}
      </Link>
    </p>
  );
}
