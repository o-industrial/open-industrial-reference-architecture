import { Icon, IconProps, JSX } from "./icon.deps.ts"

export function ArchiveIcon(props: IconProps): JSX.Element {
  return <Icon {...props} src="/icons/iconset" icon="archive" />;
}
