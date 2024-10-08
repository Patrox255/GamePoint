import { ReactNode } from "react";
import TagComponent from "./TagComponent";
import { Link } from "react-router-dom";
import Button from "../../UI/Button";
import { AnimatePresence, motion } from "framer-motion";
export default function TagsComponent<T>({
  tags,
  paramName,
  children = (tag: T) => (
    <Link
      to={`/products?${paramName ? `${paramName}=${JSON.stringify(tag)}` : ""}`}
    >
      <Button>{tag as string}</Button>
    </Link>
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
          variants={{
            hidden: { opacity: 0, height: 0 },
            visible: { opacity: 1, height: "auto" },
          }}
          exit="hidden"
          initial="hidden"
          animate="visible"
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
