import { classSet, JSX } from '../../.deps.ts';
import { Action, ActionStyleTypes } from '../../atoms/Action.tsx';
import { SectionSurface } from '../../atoms/marketing/SectionSurface.tsx';

export type MarketingActionIntent = 'primary' | 'secondary' | 'ghost';

export type MarketingAction = {
  label: string;
  href: string;
  intent?: MarketingActionIntent;
  external?: boolean;
};

export type CTAContent = {
  title: JSX.Element | string;
  description?: JSX.Element | string;
  primaryAction?: MarketingAction;
  secondaryAction?: MarketingAction;
};

export type CTADeepLinkSectionProps = {
  content: CTAContent;
} & Omit<JSX.HTMLAttributes<HTMLElement>, 'content'>;

function mapIntent(intent?: MarketingActionIntent): ActionStyleTypes {
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

export function CTADeepLinkSection({
  content,
  class: className,
  ...rest
}: CTADeepLinkSectionProps): JSX.Element {
  return (
    <SectionSurface
      tone='muted'
      {...rest}
      class={classSet([], { class: className })}
    >
      <div class='mx-auto flex max-w-4xl flex-col items-center gap-6 text-center'>
        <h2 class='text-3xl font-semibold text-neutral-900 dark:text-white'>{content.title}</h2>
        {content.description
          ? <p class='text-lg text-neutral-600 dark:text-neutral-300'>{content.description}</p>
          : null}
        <div class='flex flex-col gap-3 sm:flex-row'>
          {content.primaryAction
            ? (
              <Action
                href={content.primaryAction.href}
                styleType={mapIntent(content.primaryAction.intent)}
                target={content.primaryAction.external ? '_blank' : undefined}
                rel={content.primaryAction.external ? 'noopener noreferrer' : undefined}
              >
                {content.primaryAction.label}
              </Action>
            )
            : null}
          {content.secondaryAction
            ? (
              <Action
                href={content.secondaryAction.href}
                styleType={mapIntent(content.secondaryAction.intent)}
                target={content.secondaryAction.external ? '_blank' : undefined}
                rel={content.secondaryAction.external ? 'noopener noreferrer' : undefined}
              >
                {content.secondaryAction.label}
              </Action>
            )
            : null}
        </div>
      </div>
    </SectionSurface>
  );
}
