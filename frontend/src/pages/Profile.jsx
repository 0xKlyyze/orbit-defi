import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import OrbitProBannerMockup from '@/components/components-mockups/OrbitProBannerMockup';
import { startSubscriptionCheckout, openBillingPortal } from '@/services/stripePayments';
import { toast } from 'sonner';

const Profile = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [busyMonthly, setBusyMonthly] = React.useState(false);
  const [busyYearly, setBusyYearly] = React.useState(false);
  const [busyPortal, setBusyPortal] = React.useState(false);
  const priceMonthly = process.env.REACT_APP_STRIPE_PRICE_MONTHLY;
  const priceYearly = process.env.REACT_APP_STRIPE_PRICE_YEARLY;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (err) {
      // no-op for now; errors can be surfaced via global toasts if desired
    }
  };
  const handleSelectMonthly = async () => {
    if (!priceMonthly) {
      console.warn('[Profile] Monthly price missing. Set REACT_APP_STRIPE_PRICE_MONTHLY in .env.local');
      toast.error('Monthly price ID not set. Configure REACT_APP_STRIPE_PRICE_MONTHLY.');
      return;
    }
    try {
      console.info('[Profile] Start monthly checkout', { priceMonthly });
      setBusyMonthly(true);
      toast.info('Initializing monthly checkout…');
      const url = await startSubscriptionCheckout(priceMonthly, {
        mode: 'subscription',
        successUrl: `${window.location.origin}/profile?status=success`,
        cancelUrl: `${window.location.origin}/profile?status=cancel`,
      });
      if (url) toast.success('Redirecting to Stripe Checkout…');
    } catch (err) {
      toast.error(err?.message || 'Failed to start checkout');
    }
    finally {
      setBusyMonthly(false);
    }
  };
  const handleSelectYearly = async () => {
    if (!priceYearly) {
      console.warn('[Profile] Yearly price missing. Set REACT_APP_STRIPE_PRICE_YEARLY in .env.local');
      toast.error('Yearly price ID not set. Configure REACT_APP_STRIPE_PRICE_YEARLY.');
      return;
    }
    try {
      console.info('[Profile] Start yearly checkout', { priceYearly });
      setBusyYearly(true);
      toast.info('Initializing yearly checkout…');
      const url = await startSubscriptionCheckout(priceYearly, {
        mode: 'subscription',
        successUrl: `${window.location.origin}/profile?status=success`,
        cancelUrl: `${window.location.origin}/profile?status=cancel`,
      });
      if (url) toast.success('Redirecting to Stripe Checkout…');
    } catch (err) {
      toast.error(err?.message || 'Failed to start checkout');
    }
    finally {
      setBusyYearly(false);
    }
  };
  const handleManageBilling = async () => {
    try {
      console.info('[Profile] Open billing portal');
      setBusyPortal(true);
      toast.info('Opening billing portal…');
      const url = await openBillingPortal(`${window.location.origin}/profile`);
      if (url) toast.success('Redirecting to Stripe Billing Portal…');
    } catch (err) {
      toast.error(err?.message || 'Failed to open billing portal');
    }
    finally {
      setBusyPortal(false);
    }
  };
  return (
<main className="p-8 text-white max-w-[1600px] mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-[#666] text-sm">Manage your Orbit settings and preferences.</p>
      </header>

      <section className="grid gap-6 grid-cols-1 md:grid-cols-2">
        <div className="bg-[#141414] border border-[#222] rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-2">Account</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <button
                onClick={handleManageBilling}
                disabled={busyPortal}
                className={`px-4 py-2 rounded-lg ${busyPortal ? 'opacity-70 cursor-not-allowed' : ''} bg-[#FFE066] text-black text-sm font-bold hover:bg-[#FFD633]`}
              >
                {busyPortal ? 'Opening…' : 'Manage Billing'}
              </button>
              <button onClick={handleLogout} className="px-4 py-2 rounded-lg bg-[#0A0A0A] border border-[#222] text-sm hover:border-[#FFE066]">Logout</button>
            </div>
          </div>
        </div>
        <div className="bg-[#141414] border border-[#222] rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-2">Notifications</h2>
          <p className="text-[#999] text-sm">Coming soon.</p>
        </div>
      </section>
      <div className="mt-8">
        <OrbitProBannerMockup
          onSelectMonthly={handleSelectMonthly}
          onSelectYearly={handleSelectYearly}
        />
      </div>
    </main>
  );
};

export default Profile;
