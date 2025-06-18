import { Icon, IconProps, JSX } from "./icon.deps.ts"

export function SurfaceIcon(props: IconProps): JSX.Element {
  return <Icon {...props} src="/icons/iconset" icon="surface" />;
}
