import {
  EverythingAsCode,
  EverythingAsCodeLicensing,
} from "../../../src/eac/.deps.ts";
import {
  JSX,
  WorkspaceManager,
  useEffect,
  useState,
  classSet,
} from "../../.deps.ts";
import {
  Modal,
  Action,
  ActionStyleTypes,
  LoadingIcon,
  ToggleCheckbox,
  LicenseCard,
} from "../../.exports.ts";
import { loadStripe } from "npm:@stripe/stripe-js@7.8.0";

export type CurrentLicenseModalProps = {
  eac: EverythingAsCode & EverythingAsCodeLicensing;
  workspaceMgr: WorkspaceManager;
  onClose: () => void;
};

export function CurrentLicenseModal({
  eac,
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
  } = workspaceMgr.UseLicenses(eac);

  const [submit, setSubmit] = useState<
    ((e: SubmitEvent) => void) | undefined
  >();
  const [payError, setPayError] = useState("");

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
              Featured: !!plan.Details!.Featured,
              Highlight: plan.Details!.Featured,
              Features: plan.Details!.Features,
            };
          });

          return prices;
        })
        .flatMap((p) => p)
    : [];

  const intervalPlans = plans.filter(
    (p) => p.Interval === (isMonthly ? "month" : "year"),
  );

  useEffect(() => {
    if (!clientSecret || !stripePublishableKey) return;

    const configure = async () => {
      const stripe = await loadStripe(stripePublishableKey);

      const elements = stripe!.elements({
        clientSecret,
        appearance: {},
      });

      const paymentElement = elements.create("payment");

      paymentElement.mount("#payment-element");

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
          setPayError(error.message ?? "");
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
          <ToggleCheckbox
            checked={!isMonthly}
            onToggle={() => activateMonthly()}
            title="Toggle billing interval"
          />
          <span class="mx-4">Yearly</span>
        </div>

        {activePlan && (
          <div class="flex flex-row max-w-sm mx-auto justify-center">
            <Action
              styleType={ActionStyleTypes.Link | ActionStyleTypes.Rounded}
              onClick={() => setActivePlan(undefined)}
            >
              Change License {">"}
            </Action>
          </div>
        )}

        <div class={classSet(["grid px-4 gap-6 mt-10 md:grid-cols-2"])}>
          {intervalPlans
            .filter((p) => !activePlan || activePlan === p.PlanLookup)
            .map((plan) => (
              <LicenseCard
                key={plan.Lookup}
                name={plan.Name}
                description={plan.Description}
                amount={plan.Amount}
                interval={plan.Interval}
                features={plan.Features}
                featured={plan.Featured}
                highlightLabel={plan.Highlight}
                isActive={activePlan === plan.PlanLookup}
                onSelect={() => activatePlan(plan.PlanLookup, isMonthly)}
              />
            ))}
        </div>

        {activePlan && clientSecret && (
          <form id="payment-form" onSubmit={(e) => submit?.(e)} class="mt-8">
            <div
              id="payment-element"
              class="p-4 rounded-md border border-neon-violet-500 bg-neutral-900"
            ></div>

            {!loading ? (
              <div class="mt-8 flex flex-col">
                <Action
                  id="submit"
                  type="submit"
                  class={classSet([
                    "w-full md:w-auto text-white font-bold m-1 py-2 px-4 rounded focus:outline-none shadow-lg",
                  ])}
                >
                  Subscribe
                </Action>
              </div>
            ) : (
              <LoadingIcon class="w-20 h-20 text-neon-blue-500 animate-spin inline-block" />
            )}

            <div>{hookError || payError}</div>
          </form>
        )}
      </div>
    </Modal>
  );
}

CurrentLicenseModal.Modal = (
  eac: EverythingAsCode & EverythingAsCodeLicensing,
  workspaceMgr: WorkspaceManager,
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
            eac={eac}
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
