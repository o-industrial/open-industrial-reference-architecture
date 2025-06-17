import { Icon, IconProps, JSX } from "./icon.deps.ts"

export function DeleteIcon(props: IconProps): JSX.Element {
  return <Icon {...props} src="/icons/iconset" icon="delete" />;
}
