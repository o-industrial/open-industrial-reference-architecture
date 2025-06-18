import { Icon, IconProps, JSX } from "./icon.deps.ts"

export function FrustratedIcon(props: IconProps): JSX.Element {
  return <Icon {...props} src="/icons/iconset" icon="frustrated" />;
}
