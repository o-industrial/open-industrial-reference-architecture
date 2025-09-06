import { classSet, JSX, useRef, useState } from '../../.deps.ts';
import { Action, ActionStyleTypes, Icon } from '../../.exports.ts';
import { Input, type InputProps } from './Input.tsx';

export type CopyInputProps = {
  icons?: {
    CheckIcon?: string;
    CopyIcon?: string;
    IconSet?: string;
  };
} & InputProps;

export function CopyInput(props: CopyInputProps): JSX.Element {
  const copyRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const [success, setSuccess] = useState(false);

  const copyToClipboard = async (
    _e: JSX.TargetedMouseEvent<HTMLButtonElement>,
  ) => {
    const value = (props.value ?? '').toString();
    try {
      await navigator.clipboard.writeText(value);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (_) {
      // noop
    }
  };

  return (
    <div class='flex items-start gap-2'>
      {(() => {
        const value = (props.value ?? '').toString();
        const isLong = value.length > 60 || props.multiline;
        const rows = props.rows ?? (value.length > 200 ? 4 : value.length > 100 ? 3 : 2);

        return (
          <div class='flex-1 min-w-0'>
            <Input
              {...props}
              type={isLong ? undefined : 'text'}
              multiline={isLong as any}
              readOnly
              rows={isLong ? rows : undefined}
              class={classSet([
                'w-full font-mono text-xs',
                isLong
                  ? 'whitespace-pre-wrap break-all max-h-40 overflow-y-auto'
                  : 'whitespace-nowrap overflow-x-auto',
              ], props)}
              ref={copyRef as any}
            />
          </div>
        );
      })()}

      <Action
        type='button'
        styleType={ActionStyleTypes.Icon}
        onClick={copyToClipboard}
        title='Copy to clipboard'
        class='flex-none'
      >
        <Icon
          class={classSet([
            'w-5 h-5 text-neon-green-400',
            success ? 'block' : 'hidden',
          ])}
          src={props.icons?.IconSet || '/icons/iconset'}
          icon={props.icons?.CheckIcon || 'check'}
        />
        <Icon
          class={classSet(['w-5 h-5', !success ? 'block' : 'hidden'])}
          src={props.icons?.IconSet || '/icons/iconset'}
          icon={props.icons?.CopyIcon || 'copy'}
        />
      </Action>
    </div>
  );
}
