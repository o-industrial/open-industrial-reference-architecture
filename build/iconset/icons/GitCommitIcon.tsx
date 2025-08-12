import { Icon, IconProps, JSX } from "./icon.deps.ts";

export function GitCommitIcon({ src, ...rest }: IconProps): JSX.Element {
  return <Icon {...rest} src={src ?? '/icons/iconset'} icon="gitCommit" />;
}
