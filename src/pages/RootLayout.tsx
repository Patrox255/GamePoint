import { Link, Outlet } from "react-router-dom";
import Button from "../components/UI/Button";

export default function RootLayout() {
  return (
    <>
      <nav className="w-screen min-h-[10vh] flex items-center justify-between py-6">
        <header className="min-w-[20%] px-6 text-4xl text-highlightRed font-bold tracking-widest">
          <Link to="/">
            <img
              src="logo.png"
              alt="G letter with a gamepad next to it"
              className="w-5/12 space rounded-[100px]"
            />
          </Link>
        </header>
        <div className="px-6">
          <Button>Log in</Button>
        </div>
      </nav>
      <main className="flex w-full justify-center flex-col items-center">
        <Outlet />
      </main>
    </>
  );
}
