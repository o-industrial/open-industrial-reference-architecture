import { Icon, IconProps, JSX } from "./icon.deps.ts"

export function TimelineIcon(props: IconProps): JSX.Element {
  return <Icon {...props} src="/icons/iconset" icon="timeline" />;
}
