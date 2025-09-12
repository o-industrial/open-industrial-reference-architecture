import { JSX, classSet } from '../../.deps.ts';
import { Action } from '../../atoms/Action.tsx';

export type CloudConnectAzureFormProps = {
  action?: string;
  actionText?: string;
  description?: string;
  title?: string;
} & JSX.HTMLAttributes<HTMLFormElement>;

export function CloudConnectAzureForm(
  props: CloudConnectAzureFormProps,
): JSX.Element {
  const title = props.title ?? 'Connect to Azure';
  const description = props.description ??
    'To get started in the cloud, please connect your Azure account.';
  const actionText = props.actionText ?? 'Connect Now';

  const { class: className, ...rest } = props as any;

  return (
    <form
      method="post"
      action={props.action ?? '/azure/oauth/signin'}
      {...rest}
      class={classSet([
        'w-full max-w-sm md:max-w-md mx-auto py-3 mt-2',
        className ?? '',
      ], props)}
    >
      <div class="flex flex-col gap-2 mb-4">
        <label class="block uppercase tracking-wide font-bold text-lg">
          {title}
        </label>
        <p class="text-sm text-neutral-300">{description}</p>
      </div>

      <div class="flex justify-start">
        <Action type="submit">{actionText}</Action>
      </div>
    </form>
  );
}

export default CloudConnectAzureForm;

