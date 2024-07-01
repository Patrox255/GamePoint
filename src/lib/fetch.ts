export const getJSON = async function <dataInterface>(url: string) {
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok)
    throw new Error(
      `${(data as { message?: string }).message || "Failed to fetch data."}, ${
        res.status
      }`
    );

  return { data } as { data: dataInterface[] };
};

export interface ILoaderResult<resultInterface> {
  data?: resultInterface[];
  error?: { message: string; status: number };
}
