import properties from "../../../styles/properties";

export default function CheckMarkSVG({
  additionalTailwindClasses,
}: {
  additionalTailwindClasses?: React.SVGAttributes<SVGSVGElement>["className"];
}) {
  return (
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 130.2 130.2"
      className={additionalTailwindClasses}
    >
      <circle
        className="check-path circle"
        fill="none"
        stroke={properties.highlightGreen}
        strokeWidth="6"
        strokeMiterlimit="10"
        cx="65.1"
        cy="65.1"
        r="62.1"
      />
      <polyline
        className="check-path check"
        fill="none"
        stroke={properties.highlightGreen}
        strokeWidth="6"
        strokeLinecap="round"
        strokeMiterlimit="10"
        points="100.2,40.2 51.5,88.8 29.8,67.5 "
      />
    </svg>
  );
}
