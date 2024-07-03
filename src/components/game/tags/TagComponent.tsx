import { motion } from "framer-motion";
import Button from "../../UI/Button";
import { Link } from "react-router-dom";

export default function TagComponent({
  tag,
  paramName,
}: {
  tag: string;
  paramName: string;
}) {
  return (
    <motion.li
      key={tag}
      variants={{
        hidden: {
          opacity: 0,
          scale: "0.5",
          translateX: "1rem",
        },
        visible: {
          opacity: 1,
          scale: "1",
          translateX: "0",
        },
      }}
    >
      <Button>
        <Link to={`/products?${paramName}=${tag}`}>{tag}</Link>
      </Button>
    </motion.li>
  );
}
