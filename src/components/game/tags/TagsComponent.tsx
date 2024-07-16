import { ReactNode } from "react";
import TagComponent from "./TagComponent";
import { Link } from "react-router-dom";
import Button from "../../UI/Button";
import { AnimatePresence, motion } from "framer-motion";
export default function TagsComponent<T>({
  tags,
  paramName,
  children = (tag: T) => (
    <Button>
      <Link
        to={`/products?${
          paramName ? `${paramName}=${JSON.stringify(tag)}` : ""
        }`}
      >
        {tag as string}
      </Link>
    </Button>
  ),
  idGathererFn = (tag: T) => tag as string,
}: {
  tags: T[];
  paramName?: string;
  children?: (tag: T) => ReactNode;
  idGathererFn?: (tag: T) => string;
}) {
  return (
    <AnimatePresence>
      {tags.length !== 0 && (
        <motion.ul
          className="flex flex-row flex-wrap justify-center items-center gap-x-1 gap-y-2"
          exit={{ opacity: 0, height: 0 }}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
        >
          <AnimatePresence>
            {tags.map((tag) => (
              <TagComponent tag={idGathererFn(tag)} key={idGathererFn(tag)}>
                {children(tag)}
              </TagComponent>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}
    </AnimatePresence>
  );
}
