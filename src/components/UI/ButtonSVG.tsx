import Button from "./Button";

export default function ButtonSVG({ src, alt }: { src: string; alt: string }) {
  return (
    <Button useBorder={false} useBgColor={false} additionalTailwindCSS={null}>
      <img src={src} alt={alt} className="w-12 h-12" />
    </Button>
  );
}
