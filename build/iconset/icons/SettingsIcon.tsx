import { Icon, IconProps, JSX } from "./icon.deps.ts"

export function SettingsIcon(props: IconProps): JSX.Element {
  return <Icon {...props} src="/icons/iconset" icon="settings" />;
}
