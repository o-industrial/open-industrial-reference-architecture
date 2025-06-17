import { Icon, IconProps, JSX } from "./icon.deps.ts"

export function BlockedIcon(props: IconProps): JSX.Element {
  return <Icon {...props} src="/icons/iconset" icon="blocked" />;
}
