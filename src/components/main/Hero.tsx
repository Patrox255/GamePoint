import heroImg from "../../assets/hero.png";
import AnimatedAppearance from "../UI/AnimatedAppearance";

export default function Hero() {
  return (
    <figure className="flex w-full relative bg-transparent">
      <AnimatedAppearance>
        <figcaption className="mt-8 xs:mt-0 md:mt-8 lg:mt-0 absolute top-0 left-0 w-1/2 2xs:w-2/5 md:w-1/4 xs:w-3/4 text-center pl-4 h-full flex flex-col justify-center items-center">
          <div className="bg-bodyBg/60 rounded-lg p-2">
            <header>
              <h1 className="text-xs+ md:text-xl lg:text-2xl xs:text-sm text-highlightRed">
                Fuel Your Gaming Passion with us
              </h1>
            </header>
            <p className="py-4 sm-xs+ lg:text-base xs:text-sm text-xs">
              Welcome to{" "}
              <span className="text-highlightRed font-bold">GamePoint</span>,
              your ultimate destination for the latest and greatest in gaming.
              Whether you're a casual player or a hardcore enthusiast, we've got
              something for everyone. Dive into our vast collection of games,
              consoles, and accessories, and level up your gaming experience.
              Join our community of gamers and embark on your next epic quest
              today!"
            </p>
          </div>
        </figcaption>
      </AnimatedAppearance>
      <img
        src={heroImg}
        alt="Blended screenshots from different games"
        className="lg:max-w-screen lg:h-auto w-screen h-[50vh] object-cover"
      />
    </figure>
  );
}
