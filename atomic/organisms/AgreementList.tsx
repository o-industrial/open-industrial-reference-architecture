import { classSet, IntentTypes, JSX, useEffect, useState } from '../.deps.ts';
import { Action, ActionStyleTypes, AgreementCard } from '../.exports.ts';

export type AgreementData = {
  key: string;
  title: string;
  abstract: string;
  documentLink: string;
  version: string;
};

export type AgreementListProps = {
  agreements: AgreementData[];
  onAllAccepted: () => void;
} & JSX.HTMLAttributes<HTMLDivElement>;

export function AgreementList({
  agreements,
  onAllAccepted,
  class: className,
  ...rest
}: AgreementListProps): JSX.Element {
  const [acceptedMap, setAcceptedMap] = useState<Record<string, boolean>>(
    () =>
      Object.fromEntries(
        agreements.map((agreement) => [agreement.key, false]),
      ) as Record<string, boolean>,
  );

  useEffect(() => {
    setAcceptedMap((prev) => {
      const next: Record<string, boolean> = {};
      let changed = false;

      for (const agreement of agreements) {
        const existing = prev[agreement.key];
        if (existing === undefined) {
          changed = true;
        }
        next[agreement.key] = existing ?? false;
      }

      if (!changed) {
        const prevKeys = Object.keys(prev);
        if (prevKeys.length !== agreements.length) {
          changed = true;
        } else {
          for (const key of prevKeys) {
            if (!(key in next)) {
              changed = true;
              break;
            }
          }
        }
      }

      return changed ? next : prev;
    });
  }, [agreements]);

  const hasAgreements = agreements.length > 0;

  const allAccepted = hasAgreements &&
    agreements.every((agreement) => acceptedMap[agreement.key]);

  function updateAgreement(key: string, value: boolean) {
    setAcceptedMap((prev) => {
      if (prev[key] === value) {
        return prev;
      }

      return {
        ...prev,
        [key]: value,
      };
    });
  }

  function handleAccept() {
    if (allAccepted) {
      onAllAccepted();
    }
  }

  return (
    <div class={classSet(['space-y-8'], { class: className })} {...rest}>
      <div class='grid gap-6 grid-cols-1 md:grid-cols-2'>
        {hasAgreements
          ? agreements.map((agreement) => (
            <AgreementCard
              key={agreement.key}
              title={agreement.title}
              abstract={agreement.abstract}
              documentLink={agreement.documentLink}
              checked={acceptedMap[agreement.key] ?? false}
              onCheckedChange={(value) => updateAgreement(agreement.key, value)}
            />
          ))
          : (
            <div class='col-span-1 md:col-span-2 text-center text-sm text-neutral-500'>
              All agreements are up to date.
            </div>
          )}
      </div>

      {hasAgreements && (
        <div class='flex justify-center'>
          <Action
            styleType={ActionStyleTypes.Solid | ActionStyleTypes.Rounded}
            intentType={IntentTypes.Primary}
            disabled={!allAccepted}
            onClick={handleAccept}
          >
            Accept and Continue
          </Action>
        </div>
      )}
    </div>
  );
}
