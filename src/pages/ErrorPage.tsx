import { useRouteError } from "react-router-dom";
import MainWrapper from "../components/structure/MainWrapper";
import Error from "../components/UI/Error";

interface INotFoundError {
  error: {
    message: string;
  };
}

export default function ErrorPage() {
  const error = useRouteError();
  return (
    <MainWrapper>
      <Error
        message={`${
          ((error as { message?: string }).message &&
            (error as { message?: string }).message) ||
          ((error as INotFoundError).error &&
            (error as INotFoundError).error.message) ||
          ""
        }`}
      />
    </MainWrapper>
  );
}
