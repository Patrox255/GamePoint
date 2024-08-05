import { ReactNode } from "react";

import properties from "../../styles/properties";
import AnimatedSVG from "./svg/AnimatedSVG";
import svgPathBase from "./svg/svgPathBase";

const FooterAnimatedSVG = ({ path }: { path: ReactNode }) => (
  <AnimatedSVG
    svgPath={path}
    additionalTailwindClasses="w-12 h-12"
    defaultFill={properties.defaultFont}
  />
);

export default function Footer() {
  return (
    <footer className="flex flex-col justify-center items-center w-full mt-16 py-8 bg-darkerBg ">
      <p>&copy; Patrox255. All rights reserved</p>
      <p>You can also find us on:</p>
      <nav className="flex py-3 gap-3">
        <a href="http://facebook.com" target="_blank">
          <FooterAnimatedSVG path={svgPathBase.facebookSVG} />
        </a>

        <a href="http://instagram.com" target="_blank">
          <FooterAnimatedSVG path={svgPathBase.instagramSVG} />
        </a>

        <a href="http://x.com" target="_blank">
          <FooterAnimatedSVG path={svgPathBase.twitterSVG} />
        </a>
      </nav>
    </footer>
  );
}
