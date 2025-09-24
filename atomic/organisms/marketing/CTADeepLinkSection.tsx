import { classSet, JSX } from '../../.deps.ts';
import { Action, ActionStyleTypes } from '../../atoms/Action.tsx';
import { SectionSurface, type SectionSurfaceProps } from '../../atoms/marketing/SectionSurface.tsx';

export type MarketingActionIntent = 'primary' | 'secondary' | 'ghost';

export type MarketingAction = {
  label: string;
  href: string;
  intent?: MarketingActionIntent;
  external?: boolean;
  onClick?: JSX.EventHandler<JSX.TargetedMouseEvent<EventTarget>>;
  onKeyUp?: JSX.EventHandler<JSX.TargetedKeyboardEvent<EventTarget>>;
};

export type CTAContent = {
  title: JSX.Element | string;
  description?: JSX.Element | string;
  primaryAction?: MarketingAction;
  secondaryAction?: MarketingAction;
};

export type CTADeepLinkSectionProps = {
  content: CTAContent;
} & Omit<SectionSurfaceProps, 'children' | 'tone' | 'content'>;

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
      class={classSet(['relative overflow-hidden'], { class: className })}
    >
      <div aria-hidden='true' class='pointer-events-none absolute inset-0'>
        <div class='absolute inset-0 bg-[radial-gradient(circle,_rgba(91,142,255,0.16),_rgba(255,255,255,0)_72%)] blur-[140px] dark:bg-[radial-gradient(circle,_rgba(91,142,255,0.25),_rgba(255,255,255,0)_75%)]' />
        <div class='absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent dark:via-white/10' />
      </div>
      <div class='relative mx-auto flex max-w-4xl flex-col items-center gap-6 text-center'>
        <h2 class='text-3xl font-semibold text-neutral-100 dark:text-white'>
          {content.title}
        </h2>
        {content.description
          ? (
            <p class='text-lg text-neutral-300 dark:text-neutral-300'>
              {content.description}
            </p>
          )
          : null}
        <div class='flex flex-col gap-3 sm:flex-row'>
          {content.primaryAction
            ? (
              <Action
                href={content.primaryAction.href}
                styleType={mapIntent(content.primaryAction.intent)}
                target={content.primaryAction.external ? '_blank' : undefined}
                rel={content.primaryAction.external ? 'noopener noreferrer' : undefined}
                onClick={content.primaryAction.onClick}
                onKeyUp={content.primaryAction.onKeyUp}
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
                onClick={content.secondaryAction.onClick}
                onKeyUp={content.secondaryAction.onKeyUp}
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
