import PriceCustomization from "./PriceCustomization";

export default function SearchCustomization() {
  return (
    <div className="flex w-full h-full flex-col justify-start text-center gap-4">
      <h1 className="text-highlightRed text-xl font-bold">
        Customize your search
      </h1>
      <section className="flex flex-col w-full gap-2">
        <h2 className="text-highlightRed">Price</h2>
        <div className="flex w-full gap-3 items-center justify-center">
          <PriceCustomization />
        </div>
      </section>
    </div>
  );
}
