import AnimatedAppearance from "../../UI/AnimatedAppearance";
import TagComponent from "./TagComponent";
export default function TagsComponent({
  tags,
  paramName,
}: {
  tags: string[];
  paramName: string;
}) {
  return (
    <AnimatedAppearance>
      <ul className="flex flex-row flex-wrap w-full justify-center items-center gap-x-1 gap-y-2">
        {tags.map((tag) => (
          <TagComponent tag={tag} paramName={paramName} key={tag} />
        ))}
      </ul>
    </AnimatedAppearance>
  );
}
