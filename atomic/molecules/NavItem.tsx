import { ComponentChildren, JSX } from '../.deps.ts';

export interface NavItemProps {
  icon?: ComponentChildren;
  label: ComponentChildren;
  href?: string;
}

export function NavItem({ icon, label, href }: NavItemProps): JSX.Element {
  const content = (
    <span class='flex items-center gap-2 px-2 py-1 rounded hover:bg-neutral-800 cursor-pointer'>
      {icon && <span class='w-4 h-4'>{icon}</span>}
      <span class='flex-1'>{label}</span>
    </span>
  );

  return href ? <a href={href}>{content}</a> : content;
}

