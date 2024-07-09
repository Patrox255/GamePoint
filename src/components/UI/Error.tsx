export default function Error({
  title = "An Error occured!",
  message = "",
  status = 404,
}) {
  return (
    <div className="flex flex-col justify-center items-center w-full text-center p-3 bg-highlightRed/20 rounded-xl">
      <h1 className="text-2xl text-highlightRed">{title}</h1>
      <p>
        {message} Error code: {status}. Please try again later!
      </p>
    </div>
  );
}
