import { classSet, ComponentChildren, JSX } from '../../.deps.ts';
import { Action, ActionStyleTypes } from '../../atoms/Action.tsx';
import {
  SectionSurface,
  type SectionSurfaceProps,
} from '../../atoms/marketing/SectionSurface.tsx';
import {
  SectionHeader,
  type SectionHeaderProps,
} from '../../molecules/marketing/SectionHeader.tsx';
import { type MediaAsset, MediaSpotlight } from '../../molecules/marketing/MediaSpotlight.tsx';
import { HubspotForm } from './HubspotForm.tsx';

export type HeroShowcaseActionIntent = 'primary' | 'secondary' | 'ghost';

export type HeroShowcaseAction = {
  label: string;
  href: string;
  intent?: HeroShowcaseActionIntent;
  external?: boolean;
};

export type HeroShowcaseProps = {
  header: SectionHeaderProps;
  media?: MediaAsset;
  primaryAction?: HeroShowcaseAction;
  secondaryAction?: HeroShowcaseAction;
  hubspotFormId?: string;
  children?: ComponentChildren;
} & Omit<SectionSurfaceProps, 'children' | 'tone'>;

function mapIntent(intent?: HeroShowcaseActionIntent): ActionStyleTypes {
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

export function HeroShowcase({
  header,
  media,
  primaryAction,
  secondaryAction,
  hubspotFormId,
  children,
  class: className,
  ...rest
}: HeroShowcaseProps): JSX.Element {
  return (
    <SectionSurface
      tone='default'
      {...rest}
      class={classSet(['pt-32 sm:pt-40'], { class: className })}
    >
      <div class='grid gap-16 lg:grid-cols-2 lg:items-center'>
        <div class='space-y-8'>
          <SectionHeader {...header} align={header.align ?? 'left'} />

          <div class='flex flex-col gap-4 sm:flex-row sm:items-center'>
            {primaryAction
              ? (
                <Action
                  href={primaryAction.href}
                  styleType={mapIntent(primaryAction.intent)}
                  target={primaryAction.external ? '_blank' : undefined}
                  rel={primaryAction.external ? 'noopener noreferrer' : undefined}
                >
                  {primaryAction.label}
                </Action>
              )
              : null}
            {secondaryAction
              ? (
                <Action
                  href={secondaryAction.href}
                  styleType={mapIntent(secondaryAction.intent)}
                  target={secondaryAction.external ? '_blank' : undefined}
                  rel={secondaryAction.external ? 'noopener noreferrer' : undefined}
                >
                  {secondaryAction.label}
                </Action>
              )
              : null}
          </div>

          {hubspotFormId
            ? (
              <div class='max-w-lg rounded-2xl border border-neutral-200/80 bg-white/80 p-6 dark:border-white/10 dark:bg-neutral-900/80'>
                <HubspotForm id={`hero-${hubspotFormId}`} formId={hubspotFormId} />
              </div>
            )
            : null}

          {children}
        </div>

        {media ? <MediaSpotlight media={media} /> : null}
      </div>
    </SectionSurface>
  );
}
