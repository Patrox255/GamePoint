import { motion } from "framer-motion";
import Header from "../../UI/headers/Header";
import HeaderLinkOrHeaderAnimation from "../../UI/headers/HeaderLinkOrHeaderAnimation";

export default function NavUserPanelLink({
  actionOnClick,
  header,
}: {
  actionOnClick?: () => void;
  header: string;
}) {
  return (
    <motion.li
      className="w-full"
      variants={{
        initial: { opacity: 0.7, scale: 1 },
        hover: { opacity: 1, scale: 1.1 },
      }}
      initial="initial"
      whileHover="hover"
    >
      <HeaderLinkOrHeaderAnimation
        {...(!actionOnClick
          ? {
              href: `/user`,
              sendCurrentPageInformation: true,
            }
          : { onlyAnimation: true, onClick: actionOnClick })}
        additionalTailwindClasses="w-full"
      >
        <header className="user-panel-nav-link-header px-3 w-full">
          <Header additionalTailwindClasses="break-words">{header}</Header>
        </header>
        <div className="user-panel-nav-link-highlight-container flex w-full justify-center">
          <motion.div
            className="text-highlight-line bg-highlightRed h-[0.1rem]"
            variants={{
              initial: {
                opacity: 0,
                y: -10,
                width: 0,
              },
              hover: {
                width: "100%",
                opacity: 1,
                y: 0,
              },
            }}
          ></motion.div>
        </div>
      </HeaderLinkOrHeaderAnimation>
    </motion.li>
  );
}
