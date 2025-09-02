import type { FunctionalComponent, JSX } from 'npm:preact@10.20.1';
import { useEffect } from '../../.deps.ts';

interface SurfaceWarmQueryModalDetailsProps {
  queryName: string;
  queryDescription: string;
  queryApiPath: string;
  onQueryNameChange: (name: string) => void;
  onQueryDescriptionChange: (desc: string) => void;
  onQueryApiPathChange: (apiPath: string) => void;
}

export const SurfaceWarmQueryModalDetails: FunctionalComponent<SurfaceWarmQueryModalDetailsProps> =
  ({
    queryName,
    queryDescription,
    queryApiPath,
    onQueryNameChange,
    onQueryDescriptionChange,
    onQueryApiPathChange,
  }) => {
    const handleQueryNameChange = (
      e: string | JSX.TargetedEvent<HTMLInputElement, Event>,
    ) => {
      const inputValue = typeof e === 'string' ? e : e.currentTarget.value;

      if (inputValue.length == 0) {
        document.getElementById('queryName').style.borderColor = 'red';
        if (!document.getElementById('saveWrap').title.includes('Query Name Required')) {
          document.getElementById('saveWrap').title =
            document.getElementById('saveWrap').title == ''
              ? 'Query Name Required'
              : document.getElementById('saveWrap').title + '\nQuery Name Required';
        }
      } else {
        document.getElementById('queryName').style.borderColor = '';
        document.getElementById('saveWrap').title = document.getElementById('saveWrap').title
          .replace('\nQuery Name Required', '').replace('Query Name Required', '');
      }
      onQueryNameChange(inputValue);
    };
    const handleQueryApiPathChange = (
      e: string | JSX.TargetedEvent<HTMLInputElement, Event>,
    ) => {
      const inputValue = typeof e === 'string' ? e : e.currentTarget.value;

      // Allow lowercase letters, numbers, and dashes only
      const filteredValue = inputValue.replace(/[^a-z0-9-]/g, '');

      if (filteredValue.length == 0) {
        document.getElementById('queryApiPath').style.borderColor = 'red';
        if (!document.getElementById('saveWrap').title.includes('Query API Path Required')) {
          document.getElementById('saveWrap').title =
            document.getElementById('saveWrap').title == ''
              ? 'Query API Path Required'
              : document.getElementById('saveWrap').title + '\nQuery Api Path Required';
        }
      } else {
        document.getElementById('queryApiPath').style.borderColor = '';
        document.getElementById('saveWrap').title = document.getElementById('saveWrap').title
          .replace('\nQuery API Path Required', '').replace('Query API Path Required', '');
      }
      onQueryApiPathChange(filteredValue);
    };

    const handleQueryApiPathKeyDown = (e: KeyboardEvent) => {
      const validKeys = /^[a-z0-9-]$/;

      // Allow navigation and editing keys
      const allowedControlKeys = [
        'Backspace',
        'Delete',
        'ArrowLeft',
        'ArrowRight',
        'ArrowUp',
        'ArrowDown',
        'Tab',
        'Home',
        'End',
      ];

      if (
        !validKeys.test(e.key) &&
        !allowedControlKeys.includes(e.key) &&
        !(e.ctrlKey || e.metaKey) // Allow copy/paste/cut with Ctrl/Cmd
      ) {
        e.preventDefault();
      }
    };

    const handleQueryDescriptionChange = (
      e: string | JSX.TargetedEvent<HTMLInputElement, Event>,
    ) => {
      const inputValue = typeof e === 'string' ? e : e.currentTarget.value;

      if (inputValue.length == 0) {
        document.getElementById('queryDescription').style.borderColor = 'red';
        if (!document.getElementById('saveWrap').title.includes('Query Description Required')) {
          document.getElementById('saveWrap').title =
            document.getElementById('saveWrap').title == ''
              ? 'Query Description Required'
              : document.getElementById('saveWrap').title + '\nQuery Description Required';
        }
      } else {
        document.getElementById('queryDescription').style.borderColor = '';
        document.getElementById('saveWrap').title = document.getElementById('saveWrap').title
          .replace('\nQuery Description Required', '').replace('Query Description Required', '');
      }
      onQueryDescriptionChange(inputValue);
    };

    useEffect(() => {
      handleQueryNameChange(queryName);
      handleQueryApiPathChange(queryApiPath);
      handleQueryDescriptionChange(queryDescription);
    }, []);

    // Helper for inline SVG icon wrapper
    const Icon = ({ children }: { children: JSX.Element | JSX.Element[] }) => (
      <svg
        class='w-6 h-6 text-neon-yellow-500 dark:text-neon-yellow-300 '
        viewBox='0 0 24 24'
        fill='currentColor'
      >
        {children}
      </svg>
    );

    return (
      <div class='p-6 rounded-sm'>
        <div class='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {/* Left Column */}
          <div class='space-y-6'>
            {/* Name Field */}
            <div>
              <label class='flex items-center gap-2 text-neutral-900 dark:text-white font-semibold mb-2'>
                <Icon>
                  <path d='m14.06 9l.94.94L5.92 19H5v-.92zm3.6-6c-.25 0-.51.1-.7.29l-1.83 1.83l3.75 3.75l1.83-1.83c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29m-3.6 3.19L3 17.25V21h3.75L17.81 9.94z' />
                </Icon>
                Name
              </label>
              <input
                id='queryName'
                name='queryName'
                type='text'
                value={queryName}
                onInput={(e) => handleQueryNameChange(e)}
                required
                maxLength={30}
                placeholder='Name (max 30)'
                class='text-xs w-full bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400 px-4 py-2 rounded-sm border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-neon-blue-500 invalid:border-red-500 invalid:focus:ring-red-500'
              />
              <small class='text-gray-500'>Maximum 30 characters.</small>
            </div>
          </div>
          {/* Right Column */}
          <div class='space-y-6'>
            {/* API Field */}
            <div>
              <label class='flex items-center gap-2 text-neutral-900 dark:text-white font-semibold mb-2'>
                <Icon>
                  <path
                    class='text-blue-500'
                    fill-rule='evenodd'
                    d='M12.415 4.84a4.775 4.775 0 0 1 6.752 6.752l-.013.013l-2.264 2.265a4.776 4.776 0 0 1-7.201-.516a1 1 0 0 1 1.601-1.198a2.774 2.774 0 0 0 4.185.3l2.259-2.259a2.776 2.776 0 0 0-3.925-3.923L12.516 7.56a1 1 0 0 1-1.41-1.418l1.298-1.291zM8.818 9.032a4.775 4.775 0 0 1 5.492 1.614a1 1 0 0 1-1.601 1.198a2.775 2.775 0 0 0-4.185-.3l-2.258 2.259a2.775 2.775 0 0 0 3.923 3.924l1.285-1.285a1 1 0 1 1 1.414 1.414l-1.291 1.291l-.012.013a4.775 4.775 0 0 1-6.752-6.752l.012-.013L7.11 10.13a4.8 4.8 0 0 1 1.708-1.098'
                    clip-rule='evenodd'
                  />
                </Icon>
                API Path
              </label>
              <input
                id='queryApiPath'
                name='queryApiPath'
                type='text'
                value={queryApiPath}
                onInput={(e) => handleQueryApiPathChange(e)} // Handle input change
                onKeyDown={handleQueryApiPathKeyDown} // Handle keydown to prevent invalid characters
                required
                maxLength={30}
                placeholder='API path (lowercase, numbers, dashes, max 30)'
                class='text-xs w-full bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400 px-4 py-2 rounded-sm border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-neon-blue-500 invalid:border-red-500 invalid:focus:ring-red-500'
              />
              <small class='text-gray-500'>
                Maximum 30 characters (lowercase, numbers, dashes).
              </small>
            </div>
          </div>
        </div>
        {/* Profile Details */}
        <div class='mt-8 space-y-6'>
          {/* Bio */}
          <div>
            <label class='flex items-center gap-2 text-neutral-900 dark:text-white font-semibold mb-2'>
              <Icon>
                <path d='m14.06 9l.94.94L5.92 19H5v-.92zm3.6-6c-.25 0-.51.1-.7.29l-1.83 1.83l3.75 3.75l1.83-1.83c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29m-3.6 3.19L3 17.25V21h3.75L17.81 9.94z' />
              </Icon>
              Description
            </label>
            <textarea
              id='queryDescription'
              name='queryDescription'
              type='text'
              value={queryDescription}
              onInput={(e) => handleQueryDescriptionChange(e)}
              required
              maxLength={200}
              placeholder='Description (max 200)'
              class='text-xs w-full h-24 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400 p-4 rounded-sm border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-neon-blue-500 resize-none invalid:border-red-500 invalid:focus:ring-red-500'
            />
            <small class='text-gray-500'>Maximum 200 characters.</small>
          </div>
        </div>
      </div>
    );
  };
