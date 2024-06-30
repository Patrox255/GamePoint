import { Link } from "react-router-dom";
import Button from "./Button";

const Nav = () => {
  return (
    <nav
      className={`w-full h-[15vh] flex items-center justify-between pt-6 pb-3 fixed top-0 left-0 z-10 bg-bodyBg opacity-80 hover:opacity-100 transition-all duration-1000`}
    >
      <header className="min-w-[20%] px-6 text-4xl text-highlightRed font-bold tracking-widest">
        <Link to="/" className="w-4/12 block">
          <img
            src="logo.png"
            alt="G letter with a gamepad next to it"
            className="w-full space rounded-[100px]"
          />
        </Link>
      </header>
      <div className="px-6">
        <Button>Log in</Button>
      </div>
    </nav>
  );
};

export default Nav;
