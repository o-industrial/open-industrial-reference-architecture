import {
  JSX,
  WorkspaceManager,
  useEffect,
  useState,
  classSet,
} from '../../.deps.ts';
import {
  Modal,
  Action,
  ActionStyleTypes,
  LoadingIcon,
} from '../../.exports.ts';
import { loadStripe } from 'npm:@stripe/stripe-js@7.8.0';

export type CurrentLicenseModalProps = {
  workspaceMgr: WorkspaceManager;
  onClose: () => void;
};

export function CurrentLicenseModal({
  workspaceMgr,
  onClose,
}: CurrentLicenseModalProps): JSX.Element {
  const {
    license,
    licLookup,
    stripePublishableKey,
    isMonthly,
    activePlan,
    clientSecret,
    error: hookError,
    loading,
    activateMonthly,
    activatePlan,
    setActivePlan,
  } = workspaceMgr.UseLicenses();

  const [submit, setSubmit] = useState<
    ((e: SubmitEvent) => void) | undefined
  >();
  const [payError, setPayError] = useState('');

  const plans = license
    ? Object.keys(license.Plans)
        .map((planLookup) => {
          const plan = license.Plans[planLookup];

          const prices = Object.keys(plan.Prices).map((priceLookup) => {
            const price = plan.Prices[priceLookup];

            return {
              Lookup: `${planLookup}-${price.Details!.Interval}`,
              PlanLookup: planLookup,
              PriceLookup: priceLookup,
              Name: plan.Details!.Name!,
              Description: plan.Details!.Description!,
              Amount: price.Value,
              Interval: price.Details!.Interval,
              Featured: plan.Details!.Featured,
              Features: plan.Details!.Features,
            };
          });

          return prices;
        })
        .flatMap((p) => p)
    : [];

  const intervalPlans = plans.filter(
    (p) => p.Interval === (isMonthly ? 'month' : 'year')
  );

  useEffect(() => {
    if (!clientSecret || !stripePublishableKey) return;

    const configure = async () => {
      const stripe = await loadStripe(stripePublishableKey);

      const elements = stripe!.elements({
        clientSecret,
        appearance: {},
      });

      const paymentElement = elements.create('payment');

      paymentElement.mount('#payment-element');

      const returnUrl = new URL(location.pathname, location.origin);

      setSubmit(() => async (e: SubmitEvent) => {
        e.preventDefault();

        const { error } = await stripe!.confirmPayment({
          elements,
          confirmParams: {
            return_url: returnUrl.toString(),
          },
        });

        if (error) {
          setPayError(error.message ?? '');
        }
      });
    };

    configure();
  }, [clientSecret, stripePublishableKey]);

  if (!license || !licLookup) {
    return (
      <Modal title="Current License" onClose={onClose}>
        <div class="p-4 text-center">Loading...</div>
      </Modal>
    );
  }

  return (
    <Modal title="Current License" onClose={onClose}>
      <div class="space-y-6 text-sm">
        <div class="flex flex-row max-w-sm mx-auto justify-center items-center">
          <span class="mx-4">Monthly</span>
          <input
            type="checkbox"
            checked={!isMonthly}
            onChange={() => activateMonthly()}
          />
          <span class="mx-4">Yearly</span>
        </div>

        {activePlan && (
          <div class="flex flex-row max-w-sm mx-auto justify-center">
            <Action
              styleType={ActionStyleTypes.Link | ActionStyleTypes.Rounded}
              onClick={() => setActivePlan(undefined)}
            >
              Change License {'>'}
            </Action>
          </div>
        )}

        <div
          class={classSet([
            '-:grid -:px-8 -:gap-10 -:text-zinc-800 -:mt-10',
            activePlan ? '-:lg:grid-cols-2' : '-:lg:grid-cols-2',
          ])}
        >
          {intervalPlans.map((plan) => (
            <>
              {(!activePlan || activePlan === plan.PlanLookup) && (
                <div
                  class={classSet([
                    'flex flex-col items-center p-8 rounded-lg shadow-lg max-w-sm relative',
                    plan.Featured
                      ? 'bg-gradient-to-br from-blue-100 via-orange-100 to-purple-100 border-8 border-orange-200'
                      : 'bg-slate-100',
                  ])}
                >
                  {plan.Featured && (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                        class="w-20 h-20 absolute -top-11 -left-11 fill-red-400"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M12.963 2.286a.75.75 0 00-1.071-.136 9.742 9.742 0 00-3.539 6.177A7.547 7.547 0 016.648 6.61a.75.75 0 00-1.152-.082A9 9 0 1015.68 4.534a7.46 7.46 0 01-2.717-2.248zM15.75 14.25a3.75 3.75 0 11-7.313-1.172c.628.465 1.35.81 2.133 1a5.99 5.99 0 011.925-3.545 3.75 3.75 0 013.255 3.717z"
                          clip-rule="evenodd"
                        ></path>
                      </svg>

                      <p class="mono text-sm absolute -top-4 bg-red-400 text-zinc-100 py-0.5 px-2 font-bold tracking-wider rounded text-uppercase">
                        {plan.Featured}
                      </p>
                    </>
                  )}

                  <div>
                    <h2 class="font-extrabold text-3xl text-center mb-2">
                      {plan.Name}
                    </h2>

                    <p class="opacity-60 text-center">{plan.Description}</p>

                    <div class="flex flex-col items-center my-8">
                      <p class="font-extrabold text-4xl">${plan.Amount}</p>

                      <p class="text-sm opacity-60">/{plan.Interval}</p>
                    </div>
                  </div>

                  <div class="flex flex-col gap-1">
                    {plan.Features &&
                      plan.Features.map((feature) => (
                        <p class="flex items-center text-sm">
                          &#x1F5F8;
                          <b class="ml-2">{feature}</b>
                        </p>
                      ))}

                    {activePlan !== plan.PlanLookup && (
                      <div class="flex justify-center mt-8">
                        <Action
                          class={classSet([
                            'w-full md:w-auto text-white font-bold m-1 py-2 px-4 rounded focus:outline-none shadow-lg',
                          ])}
                          onClick={() =>
                            activatePlan(plan.PlanLookup, isMonthly)
                          }
                        >
                          Get Started
                        </Action>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          ))}

          {activePlan && clientSecret && (
            <form id="payment-form" onSubmit={(e) => submit?.(e)}>
              <div id="payment-element"></div>

              {!loading ? (
                <div class="mt-8 flex flex-col">
                  <Action
                    id="submit"
                    type="submit"
                    class={classSet([
                      'w-full md:w-auto text-white font-bold m-1 py-2 px-4 rounded focus:outline-none shadow-lg',
                    ])}
                  >
                    Subscribe
                  </Action>
                </div>
              ) : (
                <LoadingIcon class="w-20 h-20 text-blue-500 animate-spin inline-block" />
              )}

              <div>{hookError || payError}</div>
            </form>
          )}
        </div>
      </div>
    </Modal>
  );
}

CurrentLicenseModal.Modal = (
  workspaceMgr: WorkspaceManager
): {
  Modal: JSX.Element;
  Hide: () => void;
  IsOpen: () => boolean;
  Show: () => void;
} => {
  const [shown, setShow] = useState(false);

  return {
    Modal: (
      <>
        {shown && (
          <CurrentLicenseModal
            workspaceMgr={workspaceMgr}
            onClose={() => setShow(false)}
          />
        )}
      </>
    ),
    Hide: () => setShow(false),
    IsOpen: () => shown,
    Show: () => setShow(true),
  };
};

export default CurrentLicenseModal;
