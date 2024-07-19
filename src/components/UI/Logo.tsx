import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";

export default function Logo({
  widthTailwindClass = "w-4/12",
}: {
  widthTailwindClass?: string;
}) {
  return (
    <Link to="/" className={`${widthTailwindClass} block`}>
      <img
        src={logo}
        alt="G letter with a gamepad next to it"
        className="w-full space rounded-[100px]"
      />
    </Link>
  );
}
