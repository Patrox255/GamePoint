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
      } w-full text-center px-1 xs:px-3 py:2 ${
        !smallVersion ? "xs:py-9" : "xs:py-3"
      }  bg-highlightRed/20 rounded-xl`}
    >
      {!smallVersion && (
        <h1 className="text-xs xs:text-lg sm:text-2xl text-highlightRed">
          {title}
        </h1>
      )}
      <p className="text-xs sm:text-xl xs:text-sm">
        {message}
        {!smallVersion && showDetails
          ? `Error code: ${status}. Please try again later!`
          : ""}
      </p>
    </div>
  );
}
