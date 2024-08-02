export default function Error({
  title = "An Error occured!",
  message = "",
  status = 404,
  smallVersion = false,
  showDetails = true,
}) {
  return (
    <div
      className={`flex flex-col justify-center items-${
        !smallVersion ? "center" : "start"
      } w-full text-center px-3 py-${
        !smallVersion ? "9" : "3"
      } bg-highlightRed/20 rounded-xl`}
    >
      {!smallVersion && <h1 className="text-2xl text-highlightRed">{title}</h1>}
      <p className={smallVersion ? "text-xl" : ""}>
        {message}
        {!smallVersion && showDetails
          ? `Error code: ${status}. Please try again later!`
          : ""}
      </p>
    </div>
  );
}
