import { JSX, IntentTypes, classSet } from '../.deps.ts';
import { Badge as StatusBadge } from '../.exports.ts';

type ResourceStatus = {
  name: string;
  status: string;
  intentType?: IntentTypes;
};

type ResourceStatusListProps = {
  resources: ResourceStatus[];
  class?: string;
} & JSX.HTMLAttributes<HTMLDivElement>;

export function ResourceStatusList({
  resources,
  class: className,
  ...rest
}: ResourceStatusListProps): JSX.Element {
  return (
    <div
      {...rest}
      class={classSet(['flex flex-col divide-y divide-neutral-700', className])}
    >
      {resources.map((res) => (
        <div class="flex items-center justify-between py-2" key={res.name}>
          <span class="text-sm text-gray-300">{res.name}</span>
          <StatusBadge intentType={res.intentType}>{res.status}</StatusBadge>
        </div>
      ))}
    </div>
  );
}

