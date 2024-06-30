export default function Error({
  title = "An Error occured!",
  message = "",
  status = 404,
}) {
  return (
    <>
      <h1>{title}</h1>
      <p>
        {message} Error code: {status}. Please try again later!
      </p>
    </>
  );
}
