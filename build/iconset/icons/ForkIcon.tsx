import { Icon, IconProps, JSX } from "./icon.deps.ts"

export function ForkIcon(props: IconProps): JSX.Element {
  return <Icon {...props} src="/icons/iconset" icon="fork" />;
}
