import { useMemo, useState } from 'react';
import { ChevronLeft, CreditCard, MapPin, Percent, ShieldCheck, WalletCards } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { LocationInfo, Product } from '../types';

interface CheckoutSectionProps {
  onClose: () => void;
  location: LocationInfo;
  products: Product[];
  availablePoints: number;
}

export function CheckoutSection({
  onClose,
  location,
  products,
  availablePoints,
}: CheckoutSectionProps) {
  const [usePoints, setUsePoints] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('UPI');

  const cartItems = products.map((product) => ({ ...product, quantity: 1 }));
  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems],
  );
  const baseDiscount = Math.round(subtotal * 0.08);
  const delivery = subtotal > 499 ? 0 : 40;

  const maxPointsByOrderRule = Math.floor((subtotal * 0.15 * 10) / 10);
  const pointsAllowed = Math.min(availablePoints, maxPointsByOrderRule);
  const pointsDiscountValue = Math.floor(pointsAllowed / 10);
  const pointsApplied = usePoints && availablePoints >= 100 ? pointsAllowed : 0;
  const pointsDiscount = usePoints && availablePoints >= 100 ? pointsDiscountValue : 0;
  const finalTotal = Math.max(0, subtotal - baseDiscount - pointsDiscount + delivery);

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="sticky top-0 z-20 border-b border-border bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-4">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2>Checkout</h2>
            <p className="text-sm text-muted-foreground">
              Apply points, verify location and place order securely.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[1fr_0.42fr]">
        <div className="space-y-4">
          <div className="rounded-[28px] bg-white p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-3">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3>Delivery address</h3>
                <p className="text-sm text-muted-foreground">
                  Auto-filled from location detection and editable before placing order.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Full name</Label>
                <Input placeholder="Enter full name" defaultValue="BYNDIO User" />
              </div>
              <div className="space-y-2">
                <Label>Phone number</Label>
                <Input placeholder="+91 98765 43210" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Address</Label>
                <Input defaultValue={`${location.area}, ${location.city}`} />
              </div>
              <div className="space-y-2">
                <Label>City</Label>
                <Input defaultValue={location.city} />
              </div>
              <div className="space-y-2">
                <Label>Pincode</Label>
                <Input defaultValue={location.pincode} />
              </div>
            </div>
          </div>

          <div className="rounded-[28px] bg-white p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-3">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3>Payment method</h3>
                <p className="text-sm text-muted-foreground">Secure payment with UPI, cards and COD.</p>
              </div>
            </div>
            <div className="grid gap-3">
              {[
                { label: 'UPI', hint: 'PhonePe, GPay, Paytm' },
                { label: 'Credit or debit card', hint: 'Visa, Mastercard, RuPay' },
                { label: 'Net banking', hint: 'All major banks' },
                { label: 'Cash on delivery', hint: 'Pay at doorstep' },
              ].map((payment) => {
                const active = selectedPayment === payment.label;
                return (
                  <button
                    key={payment.label}
                    onClick={() => setSelectedPayment(payment.label)}
                    className={`rounded-2xl border p-4 text-left transition ${
                      active ? 'border-primary bg-secondary/50' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="font-medium">{payment.label}</div>
                    <div className="text-sm text-muted-foreground">{payment.hint}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-[28px] bg-white p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-full bg-accent/15 p-3">
                <WalletCards className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h3>Apply reward points</h3>
                <p className="text-sm text-muted-foreground">
                  100 points = Rs 10. Max usage is 15% of order value.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-secondary/40 p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-medium">Available balance: {availablePoints} points</div>
                  <div className="text-sm text-muted-foreground">
                    Eligible for this order: {pointsAllowed} points (Rs {pointsDiscountValue})
                  </div>
                </div>
                <Switch
                  checked={usePoints}
                  onCheckedChange={setUsePoints}
                  disabled={availablePoints < 100}
                />
              </div>

              {availablePoints < 100 ? (
                <div className="text-sm text-muted-foreground">
                  Minimum 100 points are required to redeem at checkout.
                </div>
              ) : (
                <div className="text-sm text-success">
                  {usePoints
                    ? `Using ${pointsApplied} points for Rs ${pointsDiscount} discount.`
                    : 'Enable toggle to apply points instantly.'}
                </div>
              )}
            </div>

            <div className="mt-4 rounded-2xl border border-dashed border-primary/40 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
                <Percent className="h-4 w-4" />
                Coupon and promo
              </div>
              <div className="flex gap-2">
                <Input placeholder="Enter coupon code" />
                <Button variant="outline">Apply</Button>
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="sticky top-24 rounded-[28px] bg-white p-6 shadow-sm">
            <h3>Order summary</h3>

            <div className="mt-4 space-y-3">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-3 rounded-2xl bg-muted/40 p-3">
                  <div className="h-16 w-16 overflow-hidden rounded-xl bg-muted">
                    <ImageWithFallback
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="line-clamp-2 text-sm">{item.name}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{item.brand}</div>
                    <div className="mt-1 text-sm font-medium">Rs {item.price.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>Rs {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-success">
                <span>Marketplace discount</span>
                <span>-Rs {baseDiscount.toLocaleString()}</span>
              </div>
              {pointsDiscount > 0 ? (
                <div className="flex items-center justify-between text-success">
                  <span>Points discount</span>
                  <span>-Rs {pointsDiscount.toLocaleString()}</span>
                </div>
              ) : null}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span>{delivery === 0 ? 'FREE' : `Rs ${delivery}`}</span>
              </div>
            </div>

            <div className="mt-4 border-t border-border pt-4">
              <div className="mb-4 flex items-end justify-between">
                <span>Total payable</span>
                <span className="text-3xl font-semibold">Rs {finalTotal.toLocaleString()}</span>
              </div>

              <Button className="w-full rounded-full" size="lg">
                Place order
              </Button>

              <div className="mt-3 rounded-2xl bg-emerald-50 p-3 text-xs text-emerald-700">
                Checkout is protected with secure payment and anti-abuse points validation.
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-border bg-white p-5 text-sm">
            <div className="mb-2 flex items-center gap-2 font-medium text-primary">
              <ShieldCheck className="h-4 w-4" />
              Trust strip
            </div>
            <div className="space-y-1 text-muted-foreground">
              <div>Free delivery on eligible products</div>
              <div>Easy returns within 7 days</div>
              <div>Secure payment and verified sellers</div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="secondary">Free Delivery</Badge>
              <Badge variant="secondary">Easy Returns</Badge>
              <Badge variant="secondary">Secure Payment</Badge>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
