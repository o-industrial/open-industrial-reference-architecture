import { Icon, IconProps, JSX } from "./icon.deps.ts"

export function EmptyIcon(props: IconProps): JSX.Element {
  return <Icon {...props} src="/icons/iconset" icon="empty" />;
}
