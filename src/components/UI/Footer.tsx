import facebook from "../../assets/facebook-svgrepo-com.svg";
import instagram from "../../assets/instagram-svgrepo-com.svg";
import x from "../../assets/twitter-svgrepo-com.svg";
import ButtonSVG from "./ButtonSVG";

export default function Footer() {
  return (
    <footer className="flex flex-col justify-center items-center w-full mt-16 py-8 bg-darkerBg ">
      <p>&copy; Patrox255. All rights reserved</p>
      <p>You can also find us on:</p>
      <nav className="flex py-3 gap-3">
        <a href="http://facebook.com" target="_blank">
          <ButtonSVG src={facebook} alt="Facebook icon" />
        </a>

        <a href="http://instagram.com" target="_blank">
          <ButtonSVG src={instagram} alt="Instagram icon" />
        </a>

        <a href="http://x.com" target="_blank">
          <ButtonSVG src={x} alt="X icon" />
        </a>
      </nav>
    </footer>
  );
}
