import { useRouteError } from "react-router-dom";
import MainWrapper from "../components/structure/MainWrapper";
import Error from "../components/UI/Error";

export default function ErrorPage() {
  const error = useRouteError();
  console.log(error);
  return (
    <MainWrapper>
      <Error
        message={`${(error as { message?: string }).message + " " || ""}`}
      />
    </MainWrapper>
  );
}
