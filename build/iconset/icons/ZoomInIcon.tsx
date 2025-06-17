import { Icon, IconProps, JSX } from "./icon.deps.ts"

export function ZoomInIcon(props: IconProps): JSX.Element {
  return <Icon {...props} src="/icons/iconset" icon="zoomIn" />;
}
