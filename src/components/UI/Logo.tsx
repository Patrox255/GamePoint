import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";

export default function Logo() {
  return (
    <Link to="/" className={`flex justify-center w-16 xl:w-40 xs:w-24 lg:w-32`}>
      <img
        src={logo}
        alt="G letter with a gamepad next to it"
        className="w-full space rounded-[100px]"
      />
    </Link>
  );
}
