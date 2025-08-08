import type { FunctionalComponent, JSX } from 'npm:preact@10.20.1';

interface SurfaceWarmQueryModalQueryProps {
  query: string;
  onQueryChange: (name: string) => void;
  errors: string;
}

export const SurfaceWarmQueryModalQuery: FunctionalComponent<SurfaceWarmQueryModalQueryProps> = ({
  query,
  onQueryChange,
  errors,
}) => {
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
    <div class='pl-6 pr-6 pt-6 pb-0 rounded-sm'>
      <div>
        <div>
          <label class='flex items-center gap-2 text-neutral-900 dark:text-white font-semibold mb-2'>
            <Icon>
              <path d='M18.68 12.32a4.49 4.49 0 0 0-6.36.01a4.49 4.49 0 0 0 0 6.36a4.51 4.51 0 0 0 5.57.63L21 22.39L22.39 21l-3.09-3.11c1.13-1.77.87-4.09-.62-5.57m-1.41 4.95c-.98.98-2.56.97-3.54 0c-.97-.98-.97-2.56.01-3.54c.97-.97 2.55-.97 3.53 0c.97.98.97 2.56 0 3.54M10.9 20.1a6.5 6.5 0 0 1-1.48-2.32C6.27 17.25 4 15.76 4 14v3c0 2.21 3.58 4 8 4c-.4-.26-.77-.56-1.1-.9M4 9v3c0 1.68 2.07 3.12 5 3.7v-.2c0-.93.2-1.85.58-2.69C6.34 12.3 4 10.79 4 9m8-6C7.58 3 4 4.79 4 7c0 2 3 3.68 6.85 4h.05c1.2-1.26 2.86-2 4.6-2c.91 0 1.81.19 2.64.56A3.22 3.22 0 0 0 20 7c0-2.21-3.58-4-8-4' />
            </Icon>
            Query <small class='text-gray-500'>Maximum 5000 characters.</small>
          </label>
          <textarea
            id='query'
            name='query'
            type='text'
            value={query}
            onInput={(e) => onQueryChange(e.currentTarget.value)}
            required
            maxLength={5000}
            placeholder='Enter query'
            class='text-sm w-full h-60 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400 p-4 rounded-sm border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-neon-blue-500 resize-none'
          />
          {/* Console Label */}
          <div class='mt-4 flex items-center gap-2 mb-2'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='24'
              height='24'
              viewBox='0 0 24 24'
              class='text-red-600'
            >
              <path
                fill='currentColor'
                d='M20 19V7H4v12zm0-16a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm-7 14v-2h5v2zm-3.42-4L5.57 9H8.4l3.3 3.3c.39.39.39 1.03 0 1.42L8.42 17H5.59z'
              />
            </svg>
            <strong>Console</strong>
          </div>
          <textarea
            id='errors'
            name='errors'
            type='text'
            value={errors}
            placeholder='>'
            disabled
            class='text-sm w-full h-20 bg-black text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400 p-4 rounded-sm border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-neon-blue-500 resize-none'
          />
        </div>
      </div>
    </div>
  );
};
