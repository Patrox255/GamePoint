import { Link } from "react-router-dom";
import Button from "../UI/Button";

export default function TagsComponent({
  tags,
  paramName,
}: {
  tags: string[];
  paramName: string;
}) {
  return (
    <ul className="flex flex-row flex-wrap w-full justify-center items-center gap-x-1 gap-y-2">
      {tags.map((tag) => (
        <li key={tag}>
          <Button>
            <Link to={`/products?${paramName}=${tag}`}>{tag}</Link>
          </Button>
        </li>
      ))}
    </ul>
  );
}
