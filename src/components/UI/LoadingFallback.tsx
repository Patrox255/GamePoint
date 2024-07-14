import Spinner from "./Spinner";

export default function LoadingFallback({
  customText = "Processing data...",
}: {
  customText?: string;
}) {
  return (
    <div className="flex flex-col justify-center items-center">
      <p className="py-4">{customText}</p>
      <Spinner />
    </div>
  );
}
