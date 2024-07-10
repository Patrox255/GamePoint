import { ReactNode } from "react";
import TagComponent from "./TagComponent";
import { Link } from "react-router-dom";
import Button from "../../UI/Button";
export default function TagsComponent({
  tags,
  paramName,
  children = (tag: string) => (
    <Button>
      <Link to={`/products?${paramName ? `${paramName}=${tag}` : ""}`}>
        {tag}
      </Link>
    </Button>
  ),
}: {
  tags: string[];
  paramName?: string;
  children?: (tag: string) => ReactNode;
}) {
  return (
    <ul className="flex flex-row flex-wrap w-full justify-center items-center gap-x-1 gap-y-2">
      {tags.map((tag) => (
        <TagComponent tag={tag} key={tag}>
          {children(tag)}
        </TagComponent>
      ))}
    </ul>
  );
}
