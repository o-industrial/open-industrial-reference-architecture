import { Icon, IconProps, JSX } from "./icon.deps.ts"

export function GitopsIcon(props: IconProps): JSX.Element {
  return <Icon {...props} src="/icons/iconset" icon="gitops" />;
}
