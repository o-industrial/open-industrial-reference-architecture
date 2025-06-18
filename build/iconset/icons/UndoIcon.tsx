import { Icon, IconProps, JSX } from "./icon.deps.ts"

export function UndoIcon(props: IconProps): JSX.Element {
  return <Icon {...props} src="/icons/iconset" icon="undo" />;
}
