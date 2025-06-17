import { JSX, IntentTypes, ComponentChildren, classSet } from '../.deps.ts';

export enum ActionStyleTypes {
  Solid = 1 << 0,
  Outline = 1 << 1,
  Link = 1 << 2,
  Rounded = 1 << 3,
  Icon = 1 << 4,
  None = 1 << 5,
  Thin = 1 << 6,
  UltraThin = 1 << 7,
  Fat = 1 << 8,
}

export type ActionBaseProps = {
  styleType?: ActionStyleTypes;
  intentType?: IntentTypes;
  children?: ComponentChildren;
};

export type ActionButtonProps = JSX.HTMLAttributes<HTMLButtonElement> &
  ActionBaseProps;
export type ActionAnchorProps = JSX.HTMLAttributes<HTMLAnchorElement> &
  ActionBaseProps;

export type ActionProps = (ActionButtonProps | ActionAnchorProps) & {
  href?: string;
};

export function Action(props: ActionProps): JSX.Element {
  const {
    styleType = ActionStyleTypes.Solid | ActionStyleTypes.Rounded,
    intentType = IntentTypes.Primary,
    href,
    children,
    disabled,
    ...rest
  } = props;

  const baseClasses =
    '-:inline-flex -:items-center -:justify-center -:font-semibold -:transition-all -:duration-200 -:ease-out';
  let styleClasses = '';
  let intentClasses = '';

  if (!(styleType & ActionStyleTypes.Icon)) {
    if (styleType & ActionStyleTypes.UltraThin) {
      styleClasses += ' -:px-2 -:py-0.5';
    } else if (styleType & ActionStyleTypes.Thin) {
      styleClasses += ' -:px-3 -:py-1';
    } else if (styleType & ActionStyleTypes.Fat) {
      styleClasses += ' -:px-6 -:py-3';
    } else {
      styleClasses += ' -:px-4 -:py-2';
    }
  }

  if (styleType & ActionStyleTypes.Solid) {
    styleClasses += ' ';
  }

  if (styleType & ActionStyleTypes.Outline) {
    styleClasses += ' -:border -:bg-transparent';
  }

  if (styleType & ActionStyleTypes.Link) {
    styleClasses += ' -:bg-transparent -:underline';
  }

  if (styleType & ActionStyleTypes.Rounded) {
    styleClasses += ' -:rounded-md';
  }

  if (styleType & ActionStyleTypes.Icon) {
    styleClasses += ' -:rounded-full -:p-2';
  }

  const solidBackground = (styleType & ActionStyleTypes.Solid) !== 0;

  switch (intentType) {
    case IntentTypes.Primary:
      if (solidBackground) {
        intentClasses =
          '-:bg-neon-violet-500 -:hover:bg-neon-violet-600 -:text-white -:border-neon-violet-500';
      } else {
        intentClasses =
          '-:text-neon-violet-400 -:hover:text-neon-violet-300 -:border-neon-violet-400';
      }
      break;

    case IntentTypes.Secondary:
      if (solidBackground) {
        intentClasses =
          '-:bg-neon-indigo-500 -:hover:bg-neon-indigo-600 -:text-white -:border-neon-indigo-500';
      } else {
        intentClasses =
          '-:text-neon-indigo-400 -:hover:text-neon-indigo-300 -:border-neon-indigo-400';
      }
      break;

    case IntentTypes.Tertiary:
      if (solidBackground) {
        intentClasses =
          '-:bg-neon-blue-500 -:hover:bg-neon-blue-600 -:text-white -:border-neon-blue-500';
      } else {
        intentClasses =
          '-:text-neon-blue-500 -:hover:text-neon-blue-600 -:border-neon-blue-500';
      }
      break;

    case IntentTypes.Warning:
      if (solidBackground) {
        intentClasses =
          '-:bg-neon-yellow-400 -:hover:bg-neon-yellow-500 -:text-black -:border-neon-yellow-400';
      } else {
        intentClasses =
          '-:text-neon-yellow-400 -:hover:text-neon-yellow-500 -:border-neon-yellow-400';
      }
      break;

    case IntentTypes.Info:
      if (solidBackground) {
        intentClasses =
          '-:bg-neon-cyan-400 -:hover:bg-neon-cyan-500 -:text-white -:border-neon-cyan-400';
      } else {
        intentClasses =
          '-:text-neon-cyan-400 -:hover:text-neon-cyan-300 -:border-neon-cyan-400';
      }
      break;

    case IntentTypes.Error:
      if (solidBackground) {
        intentClasses =
          '-:bg-neon-red-500 -:hover:bg-neon-red-600 -:text-white -:border-neon-red-500';
      } else {
        intentClasses =
          '-:text-neon-red-400 -:hover:text-neon-red-300 -:border-neon-red-400';
      }
      break;
  }

  const disabledClasses = disabled
    ? ' -:opacity-50 -:pointer-events-none -:cursor-not-allowed'
    : '';

  const classes = `${baseClasses}${styleClasses} ${intentClasses} ${disabledClasses}`;

  if (href && !disabled) {
    return (
      <a
        {...(rest as JSX.HTMLAttributes<HTMLAnchorElement>)}
        href={href}
        class={classSet([classes], rest)}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      {...(rest as JSX.HTMLAttributes<HTMLButtonElement>)}
      type="button"
      disabled={disabled}
      class={classSet([classes], rest)}
    >
      {children}
    </button>
  );
}
