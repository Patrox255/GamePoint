import Header, {
  IHeaderPropsSharedWithHighlightCounter,
} from "./headers/Header";

export default function HighlightCounter({
  children,
  ...headerProps
}: IHeaderPropsSharedWithHighlightCounter & { children: number }) {
  return (
    <Header
      motionAnimationProperties={{
        initial: { scale: 2 },
        animate: { scale: 1 },
      }}
      key={children}
      {...headerProps}
    >
      {children}
    </Header>
  );
}
