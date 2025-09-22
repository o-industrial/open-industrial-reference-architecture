import { classSet, JSX, useState } from '../../.deps.ts';
import { Action, ActionStyleTypes } from '../../atoms/Action.tsx';

export type MarketingNavLink = {
  label: string;
  href: string;
  external?: boolean;
};

export type MarketingNavCTA = MarketingNavLink & {
  intent?: 'primary' | 'secondary' | 'ghost';
};

export type MarketingNavigationProps = {
  links: MarketingNavLink[];
  ctas?: MarketingNavCTA[];
  currentPath?: string;
} & JSX.HTMLAttributes<HTMLElement>;

function isActiveLink(href: string, currentPath?: string): boolean {
  if (!currentPath) {
    return false;
  }

  return currentPath === href || currentPath.startsWith(`${href}/`);
}

function mapIntent(intent?: MarketingNavCTA['intent']): ActionStyleTypes {
  switch (intent) {
    case 'secondary':
      return ActionStyleTypes.Outline | ActionStyleTypes.Rounded;
    case 'ghost':
      return ActionStyleTypes.Thin | ActionStyleTypes.Link;
    case 'primary':
    default:
      return ActionStyleTypes.Solid | ActionStyleTypes.Rounded;
  }
}

export function MarketingNavigation({
  links,
  ctas = [],
  currentPath,
  class: className,
  ...rest
}: MarketingNavigationProps): JSX.Element {
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleMobile = () => setMobileOpen((open) => !open);
  const closeMobile = () => setMobileOpen(false);

  return (
    <nav
      {...rest}
      class={classSet(['relative flex items-center gap-4'], rest)}
    >
      <div class='hidden md:flex items-center gap-8'>
        {links.map((link) => {
          const active = isActiveLink(link.href, currentPath);

          return (
            <a
              key={link.href}
              href={link.href}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noopener noreferrer' : undefined}
              class={classSet([
                'text-sm font-medium transition-colors',
                active
                  ? 'text-neutral-900 dark:text-white'
                  : 'text-neutral-700 hover:text-neutral-900 dark:text-neutral-200 dark:hover:text-white',
              ])}
            >
              {link.label}
            </a>
          );
        })}
      </div>

      <div class='hidden md:flex items-center gap-3'>
        {ctas.map((cta) => (
          <Action
            key={cta.href}
            href={cta.href}
            styleType={mapIntent(cta.intent)}
            target={cta.external ? '_blank' : undefined}
            rel={cta.external ? 'noopener noreferrer' : undefined}
          >
            {cta.label}
          </Action>
        ))}
      </div>

      <div class='md:hidden ml-auto'>
        <button
          type='button'
          onClick={toggleMobile}
          class='flex items-center gap-2 rounded-full border border-neutral-300/60 px-3 py-2 text-sm font-medium text-neutral-700 transition-colors dark:border-white/10 dark:text-neutral-200'
          aria-expanded={mobileOpen ? 'true' : 'false'}
          aria-label='Toggle navigation menu'
        >
          <span class='flex flex-col gap-1'>
            <span class='block h-0.5 w-5 rounded-full bg-current' />
            <span class='block h-0.5 w-5 rounded-full bg-current' />
            <span class='block h-0.5 w-5 rounded-full bg-current' />
          </span>
          <span>Menu</span>
        </button>
      </div>

      {mobileOpen
        ? (
          <div class='absolute right-0 top-full mt-3 w-64 rounded-2xl border border-neutral-200/80 bg-white/95 p-4 shadow-xl dark:border-white/10 dark:bg-neutral-900/95'>
            <div class='flex flex-col gap-3'>
              {links.map((link) => (
                <a
                  key={`mobile-${link.href}`}
                  href={link.href}
                  onClick={closeMobile}
                  target={link.external ? '_blank' : undefined}
                  rel={link.external ? 'noopener noreferrer' : undefined}
                  class='text-base font-medium text-neutral-700 transition-colors hover:text-neutral-900 dark:text-neutral-200 dark:hover:text-white'
                >
                  {link.label}
                </a>
              ))}
            </div>

            {ctas.length
              ? (
                <div class='mt-4 border-t border-neutral-200/60 pt-4 dark:border-white/10'>
                  <div class='flex flex-col gap-2'>
                    {ctas.map((cta) => (
                      <Action
                        key={`mobile-cta-${cta.href}`}
                        href={cta.href}
                        onClick={closeMobile}
                        styleType={mapIntent(cta.intent)}
                        target={cta.external ? '_blank' : undefined}
                        rel={cta.external ? 'noopener noreferrer' : undefined}
                      >
                        {cta.label}
                      </Action>
                    ))}
                  </div>
                </div>
              )
              : null}
          </div>
        )
        : null}
    </nav>
  );
}
