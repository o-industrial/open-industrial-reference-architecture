import { Icon, IconProps, JSX } from "./icon.deps.ts"

export function WalkthroughIcon(props: IconProps): JSX.Element {
  return <Icon {...props} src="/icons/iconset" icon="walkthrough" />;
}
