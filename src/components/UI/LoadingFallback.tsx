import Spinner from "./Spinner";

export default function LoadingFallback() {
  return (
    <>
      <p className="py-4">Processing data...</p>
      <Spinner />
    </>
  );
}
