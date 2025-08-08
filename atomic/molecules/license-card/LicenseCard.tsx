import { JSX, classSet, IntentTypes } from "../../.deps.ts";
import { Action, Badge } from "../../.exports.ts";

export type LicenseCardProps = {
  name: string;
  description?: string;
  amount: number;
  interval: "month" | "year";
  features?: string[];
  featured?: boolean;
  highlightLabel?: string;
  isActive?: boolean;
  onSelect?: () => void;
} & JSX.HTMLAttributes<HTMLDivElement>;

export function LicenseCard({
  name,
  description,
  amount,
  interval,
  features = [],
  featured = false,
  highlightLabel,
  isActive = false,
  onSelect,
  class: className,
  ...rest
}: LicenseCardProps): JSX.Element {
  return (
    <div
      class={classSet(
        [
          "relative flex flex-col rounded-xl border border-neutral-700 bg-neutral-900 p-6 shadow-md transition-all hover:shadow-lg hover:border-neon-violet-500",
          featured ? "ring-1 ring-neon-violet-500" : "",
        ],
        { class: className },
      )}
      {...rest}
    >
      {featured && highlightLabel && (
        <Badge class="absolute -top-3 left-3" intentType={IntentTypes.Primary}>
          {highlightLabel}
        </Badge>
      )}

      <div class="flex flex-col flex-1">
        <div>
          <h3 class="text-xl font-bold text-white text-center">{name}</h3>
          {description && (
            <p class="mt-2 text-sm text-neutral-400 text-center">
              {description}
            </p>
          )}

          <div class="mt-6 mb-4 text-center">
            <span class="text-4xl font-extrabold text-white">${amount}</span>
            <span class="text-sm text-neutral-400">/{interval}</span>
          </div>
        </div>

        {features.length > 0 && (
          <ul class="flex-1 space-y-1">
            {features.map((f) => (
              <li class="flex items-center text-sm text-white" key={f}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="w-4 h-4 text-neon-cyan-400"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span class="ml-2">{f}</span>
              </li>
            ))}
          </ul>
        )}

        <div class="mt-6 flex justify-center">
          <Action class="w-full" disabled={isActive} onClick={onSelect}>
            {isActive ? "Selected" : "Get Started"}
          </Action>
        </div>
      </div>
    </div>
  );
}

export default LicenseCard;
