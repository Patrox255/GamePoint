import { ReactNode } from "react";
import TagComponent from "./TagComponent";
import { Link } from "react-router-dom";
import Button from "../../UI/Button";
import { AnimatePresence, motion } from "framer-motion";
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
    <AnimatePresence>
      {tags.length !== 0 && (
        <motion.ul
          className="flex flex-row flex-wrap w-full justify-center items-center gap-x-1 gap-y-2"
          exit={{ opacity: 0, height: 0 }}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
        >
          <AnimatePresence>
            {tags.map((tag) => (
              <TagComponent tag={tag} key={tag}>
                {children(tag)}
              </TagComponent>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}
    </AnimatePresence>
  );
}
