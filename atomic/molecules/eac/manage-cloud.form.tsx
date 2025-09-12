import { Action } from '../../atoms/Action.tsx';
import { JSX, classSet } from '../../.deps.ts';
import { Input } from '../../atoms/forms/Input.tsx';

export type EaCManageCloudFormProps = JSX.HTMLAttributes<HTMLFormElement> & {
  cloudApplicationID?: string;
  cloudAuthKey?: string;
  cloudDescription?: string;
  cloudLookup?: string;
  cloudName?: string;
  cloudSubscriptionID?: string;
  cloudTenantID?: string;
  entLookup?: string;
};

export function EaCManageCloudForm(
  props: EaCManageCloudFormProps,
): JSX.Element {
  const { class: className, ...rest } = props as any;

  return (
    <form
      method="post"
      {...rest}
      class={classSet([
        'w-full max-w-sm md:max-w-md mx-auto py-3 mt-2 space-y-4',
        className ?? '',
      ], props)}
    >
      <Input id="entLookup" name="entLookup" type="hidden" value={props.entLookup} />
      <Input id="cloudLookup" name="cloudLookup" type="hidden" value={props.cloudLookup} />

      <div class="grid grid-cols-1 gap-4">
        <div>
          <Input
            id="name"
            name="name"
            type="text"
            label="Name"
            value={props.cloudName || ''}
            required
            placeholder="Enter cloud name"
          />
        </div>

        <div>
          <Input
            id="description"
            name="description"
            type="text"
            label="Description"
            value={props.cloudDescription || ''}
            multiline
            placeholder="Enter cloud description"
          />
        </div>

        <div>
          <Input
            id="tenant-id"
            name="tenant-id"
            type="text"
            label="Tenant ID"
            value={props.cloudTenantID || ''}
            required
            placeholder="Enter tenant ID"
          />
        </div>

        <div>
          <Input
            id="subscription-id"
            name="subscription-id"
            type="text"
            label="Subscription ID"
            value={props.cloudSubscriptionID || ''}
            required
            placeholder="Enter subscription ID"
          />
        </div>

        <div>
          <Input
            id="application-id"
            name="application-id"
            type="text"
            label="Application ID"
            value={props.cloudApplicationID || ''}
            required
            placeholder="Enter application (client) ID"
          />
        </div>

        <div>
          <Input
            id="auth-key"
            name="auth-key"
            type="password"
            label="Application Auth Key"
            value={props.cloudAuthKey || ''}
            required
            placeholder="Enter application client secret"
          />
        </div>
      </div>

      <div class="flex justify-start pt-2">
        <Action type="submit">Connect Subscription</Action>
      </div>
    </form>
  );
}

export default EaCManageCloudForm;

