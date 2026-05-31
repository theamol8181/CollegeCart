export async function createRazorpayOrder(amount: number, receipt: string) {
  const response = await fetch("/api/razorpay/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount, currency: "INR", receipt })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create order");
  }

  return response.json();
}

export async function verifyRazorpayPayment(
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string
) {
  const response = await fetch("/api/razorpay/verify-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Payment verification failed");
  }

  return response.json();
}

export function loadRazorpayScript() {
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay script"));
    document.body.appendChild(script);
  });
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  orderId: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  handler?: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
}

export function openRazorpayCheckout(options: RazorpayOptions) {
  if (typeof window === "undefined") {
    throw new Error("Window object not available");
  }

  const windowWithRazorpay = window as unknown as Record<string, any>;
  if (!windowWithRazorpay.Razorpay) {
    throw new Error("Razorpay script not loaded");
  }

  const Razorpay = windowWithRazorpay.Razorpay;
  const checkout = new Razorpay(options);
  checkout.open();
}
