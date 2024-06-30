import heroImg from "../../assets/hero.png";

export default function Hero() {
  return (
    <figure className="flex w-full relative bg-transparent">
      <figcaption className="absolute top-0 left-0 w-1/4 text-center pl-4 h-full flex flex-col justify-center items-center">
        <header>
          <h1 className="text-2xl text-highlightRed">
            Fuel Your Gaming Passion with us
          </h1>
        </header>
        <p className="py-4">
          Welcome to{" "}
          <span className="text-highlightRed font-bold">GamePoint</span>, your
          ultimate destination for the latest and greatest in gaming. Whether
          you're a casual player or a hardcore enthusiast, we've got something
          for everyone. Dive into our vast collection of games, consoles, and
          accessories, and level up your gaming experience. Join our community
          of gamers and embark on your next epic quest today!"
        </p>
      </figcaption>
      <img
        src={heroImg}
        alt="Blended screenshots from different games"
        className="max-w-screen h-auto"
      />
    </figure>
  );
}
