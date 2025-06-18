import { Icon, IconProps, JSX } from "./icon.deps.ts"

export function CompositeSchemaIcon(props: IconProps): JSX.Element {
  return <Icon {...props} src="/icons/iconset" icon="compositeSchema" />;
}
