import { loadStripe, PaymentRequest } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements, PaymentRequestButtonElement } from '@stripe/react-stripe-js';
import { useState, useEffect } from 'react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

export default function StripeWrapper({ clientSecret, onConfirm, amountCents, hideButton }: { clientSecret: string, onConfirm: (id: string) => void, amountCents: number, hideButton?: boolean }) {
  const options = {
    clientSecret,
    appearance: {
      theme: 'night' as const,
      variables: {
        colorPrimary: '#10b981', // emerald-500
        colorBackground: '#0f172a', // slate-900
        colorText: '#f8fafc',
        borderRadius: '16px',
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm onConfirm={onConfirm} amountCents={amountCents} hideButton={hideButton} />
    </Elements>
  );
}

function CheckoutForm({ onConfirm, amountCents, hideButton }: { onConfirm: (id: string) => void, amountCents: number, hideButton?: boolean }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);

  useEffect(() => {
    if (!stripe) return;

    const pr = stripe.paymentRequest({
      country: 'US',
      currency: 'usd',
      total: {
        label: 'SwiftTor Recovery',
        amount: amountCents,
      },
      requestPayerName: true,
      requestPayerEmail: true,
    });

    pr.canMakePayment().then((result) => {
      if (result) {
        setPaymentRequest(pr);
      }
    });

    pr.on('paymentmethod', async (ev) => {
      // Manual capture as per spec
      const { clientSecret } = await (await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/payments/intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount_cents: amountCents, currency: 'usd', capture_method: 'manual' })
      })).json();

      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        { payment_method: ev.paymentMethod.id },
        { handleActions: false }
      );

      if (confirmError) {
        ev.complete('fail');
      } else {
        ev.complete('success');
        if (paymentIntent.status === "requires_capture") {
          onConfirm(paymentIntent.id);
        }
      }
    });
  }, [stripe, amountCents, onConfirm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order/confirmed`,
      },
      redirect: 'if_required',
    });

    if (confirmError) {
      setError(confirmError.message || 'Payment failed');
      setLoading(false);
    } else if (paymentIntent && (paymentIntent.status === 'requires_capture' || paymentIntent.status === 'succeeded')) {
      onConfirm(paymentIntent.id);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {paymentRequest && (
        <div className="mb-6">
           <PaymentRequestButtonElement options={{ paymentRequest }} />
           <div className="mt-4 flex items-center gap-4">
              <div className="flex-1 h-px bg-white/5" />
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-600">OR PAY WITH CARD</div>
              <div className="flex-1 h-px bg-white/5" />
           </div>
        </div>
      )}
      <PaymentElement />
      {error && <div className="text-red-500 text-sm font-black bg-red-500/10 p-4 rounded-2xl border border-red-500/20">{error}</div>}
      {!hideButton && (
        <button
          disabled={loading || !stripe}
          className="w-full py-6 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white font-black uppercase italic tracking-widest rounded-3xl shadow-xl shadow-emerald-500/20 transition-all active:scale-95"
        >
          {loading ? 'Authorizing Escrow...' : 'Complete Secure Booking'}
        </button>
      )}
    </form>
  );
}
