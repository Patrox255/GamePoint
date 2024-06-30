import { ReactNode } from "react";

export default function MainWrapper({ children }: { children: ReactNode }) {
  return (
    <main
      className={`flex w-full justify-center flex-col items-center pt-[15vh] min-h-screen`}
    >
      {children}
    </main>
  );
}
