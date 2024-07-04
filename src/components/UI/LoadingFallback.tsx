import Spinner from "./Spinner";

export default function LoadingFallback() {
  return (
    <div className="flex flex-col justify-center items-center">
      <p className="py-4">Processing data...</p>
      <Spinner />
    </div>
  );
}
