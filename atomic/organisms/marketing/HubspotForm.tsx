import { JSX, useEffect, useRef } from '../../.deps.ts';

export const IsIsland = true;

// deno-lint-ignore no-explicit-any
declare const hbspt: any;

export type HubspotFormProps = {
  id?: string;
  portalId?: string;
  formId?: string;
};

export function HubspotForm({
  id = 'hubspot-form',
  portalId = '2687377',
  formId = '560105cb-d75e-480b-9e1a-cdbd10172e56',
}: HubspotFormProps): JSX.Element {
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const waitForHbspt = () => {
      if (typeof hbspt !== 'undefined' && typeof hbspt.forms?.create === 'function') {
        hbspt.forms.create({
          portalId,
          formId,
          region: 'na1',
          target: `#${id}`,
        });
      } else {
        setTimeout(waitForHbspt, 100);
      }
    };

    waitForHbspt();
  }, [id, portalId, formId]);

  return <div ref={formRef} id={id} class='w-full max-w-xl mx-auto' />;
}
