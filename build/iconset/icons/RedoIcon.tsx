import { Icon, IconProps, JSX } from "./icon.deps.ts"

export function RedoIcon(props: IconProps): JSX.Element {
  return <Icon {...props} src="/icons/iconset" icon="redo" />;
}
