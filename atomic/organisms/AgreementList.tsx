import { JSX, useState, classSet, IntentTypes } from '../.deps.ts';
import { AgreementCard, Action, ActionStyleTypes } from '../.exports.ts';

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
  const [accepted, setAccepted] = useState<boolean[]>(
    agreements.map(() => false)
  );

  const allAccepted = accepted.every((a) => a);

  function updateAgreement(index: number, value: boolean) {
    const next = [...accepted];
    next[index] = value;
    setAccepted(next);
  }

  function handleAccept() {
    if (allAccepted) {
      onAllAccepted();
    }
  }

  return (
    <div class={classSet(['space-y-8'], { class: className })} {...rest}>
      <div class="grid gap-6 grid-cols-1 md:grid-cols-2">
        {agreements.map((agreement, idx) => (
          <AgreementCard
            key={idx}
            title={agreement.title}
            abstract={agreement.abstract}
            documentLink={agreement.documentLink}
            checked={accepted[idx]}
            onCheckedChange={(value) => updateAgreement(idx, value)}
          />
        ))}
      </div>

      <div class="flex justify-center">
        <Action
          styleType={ActionStyleTypes.Solid | ActionStyleTypes.Rounded}
          intentType={IntentTypes.Primary}
          disabled={!allAccepted}
          onClick={handleAccept}
        >
          Accept and Continue
        </Action>
      </div>
    </div>
  );
}
