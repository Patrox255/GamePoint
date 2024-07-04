import TagComponent from "./TagComponent";
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
        <TagComponent tag={tag} paramName={paramName} key={tag} />
      ))}
    </ul>
  );
}
