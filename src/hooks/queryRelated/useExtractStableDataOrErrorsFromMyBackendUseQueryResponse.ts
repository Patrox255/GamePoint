import { useMemo } from "react";

import {
  FormActionBackendErrorResponse,
  FormActionBackendResponse,
} from "../../components/UI/FormWithErrorHandling";

export default function useExtractStableDataOrErrorsFromMyBackendUseQueryResponse<
  T
>(
  data: FormActionBackendResponse<T> | undefined,
  error: FormActionBackendErrorResponse | null
) {
  const stableValidationErrors = useMemo(
    () => Array.isArray(error) && error.length > 0 && error,
    [error]
  );
  const stableOtherErrors = useMemo(
    () =>
      !Array.isArray(error) && error
        ? error
        : (data?.data as { message?: string })?.message
        ? (data!.data as Error)
        : null,
    [error, data]
  );
  const stableData = useMemo(
    () =>
      !error && !stableOtherErrors && (data?.data as T)
        ? (data?.data as T)
        : undefined,
    [data, error, stableOtherErrors]
  );

  return { stableData, stableOtherErrors, stableValidationErrors };
}
