import { Icon, IconProps, JSX } from "./icon.deps.ts"

export function SendIcon(props: IconProps): JSX.Element {
  return <Icon {...props} src="/icons/iconset" icon="send" />;
}
