import { JSX, classSet, useCallback, IS_BROWSER } from '../../.deps.ts';
import { Action } from '../../atoms/Action.tsx';

export type CloudConnectAzureFormProps = {
  action?: string;
  actionText?: string;
  description?: string;
  title?: string;
  successPath?: string;
  submitDisabled?: boolean;
} & JSX.HTMLAttributes<HTMLFormElement>;

export function CloudConnectAzureForm(
  props: CloudConnectAzureFormProps,
): JSX.Element {
  const {
    action: providedAction,
    actionText = 'Connect Now',
    description = 'To get started in the cloud, please connect your Azure account.',
    title = 'Connect to Azure',
    successPath = '/workspace/azure/connected',
    submitDisabled = false,
    class: className,
    onSubmit,
    ...rest
  } = props as CloudConnectAzureFormProps & JSX.HTMLAttributes<HTMLFormElement> & {
    class?: string;
    onSubmit?: JSX.EventHandler<JSX.TargetedEvent<HTMLFormElement, SubmitEvent>>;
  };

  const formAction = providedAction ?? '/azure/oauth/signin';

  const handleSubmit = useCallback<JSX.EventHandler<JSX.TargetedEvent<HTMLFormElement, SubmitEvent>>>(
    (event: JSX.TargetedEvent<HTMLFormElement, SubmitEvent>) => {
      onSubmit?.(event);

      if (event.defaultPrevented) {
        return;
      }

      event.preventDefault();

      if (!IS_BROWSER) {
        return;
      }

      let targetUrl: URL;

      try {
        targetUrl = new URL(formAction, window.location.origin);
      } catch (_) {
        targetUrl = new URL('/azure/oauth/signin', window.location.origin);
      }

      if (!targetUrl.searchParams.has('success_url')) {
        targetUrl.searchParams.set('success_url', successPath);
      }

      const width = 600;
      const height = 700;
      const left = Math.max(0, Math.round((window.screen.width - width) / 2));
      const top = Math.max(0, Math.round((window.screen.height - height) / 2));

      const features = [
        `width=${width}`,
        `height=${height}`,
        `left=${left}`,
        `top=${top}`,
        'menubar=no',
        'toolbar=no',
        'location=no',
        'status=no',
        'resizable=yes',
        'scrollbars=yes',
      ].join(',');

      const popup = window.open(targetUrl.toString(), 'azure-oauth', features);

      if (popup) {
        popup.focus();
        return;
      }

      window.location.href = targetUrl.toString();
    },
    [onSubmit, formAction, successPath],
  );

  return (
    <form
      method="post"
      action={formAction}
      onSubmit={handleSubmit}
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

      <div class="flex flex-col gap-2">
        <Action type="submit" disabled={submitDisabled}>{actionText}</Action>
      </div>
    </form>
  );
}

export default CloudConnectAzureForm;
