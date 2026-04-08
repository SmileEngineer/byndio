import { useState } from 'react';
import { MapPin, CreditCard, Tag, ChevronLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function CheckoutSection({ onClose }: { onClose: () => void }) {
  const [usePoints, setUsePoints] = useState(false);
  const availablePoints = 2450;
  const pointsValue = Math.floor(availablePoints / 10);

  const cartItems = [
    {
      id: '1',
      name: 'Premium Cotton T-Shirt',
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop',
      price: 799,
      quantity: 1,
      size: 'M'
    },
    {
      id: '2',
      name: 'Denim Jeans',
      image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=200&h=200&fit=crop',
      price: 1499,
      quantity: 1,
      size: 'L'
    }
  ];

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = 200;
  const delivery = 0;
  const pointsDiscount = usePoints ? pointsValue : 0;
  const total = subtotal - discount - pointsDiscount + delivery;

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="sticky top-0 z-10 bg-white border-b border-border px-4 py-4 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h2>Checkout</h2>
      </div>

      <div className="max-w-5xl mx-auto p-4 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <h3>Delivery Address</h3>
            </div>

            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input placeholder="Enter full name" />
              </div>

              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input type="tel" placeholder="+91 98765 43210" />
              </div>

              <div className="space-y-2">
                <Label>Address</Label>
                <Input placeholder="House no, Building name" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Pincode</Label>
                  <Input placeholder="400001" />
                </div>
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input placeholder="Mumbai" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <h3>Payment Method</h3>
            </div>

            <div className="space-y-3">
              {[
                { label: 'UPI', sublabel: 'PhonePe, GPay, Paytm' },
                { label: 'Credit/Debit Card', sublabel: 'Visa, Mastercard, RuPay' },
                { label: 'Net Banking', sublabel: 'All major banks' },
                { label: 'Cash on Delivery', sublabel: 'Pay when you receive' }
              ].map((method, idx) => (
                <button
                  key={idx}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                    idx === 0 ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div>{method.label}</div>
                  <div className="text-sm text-muted-foreground">{method.sublabel}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                <Tag className="w-5 h-5 text-accent" />
              </div>
              <h3>Apply Coupon</h3>
            </div>

            <div className="flex gap-2">
              <Input placeholder="Enter coupon code" className="flex-1" />
              <Button>Apply</Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span>Use Reward Points</span>
                  <Badge variant="secondary">{availablePoints} pts</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Save ₹{pointsValue} on this order
                </div>
              </div>
              <Switch checked={usePoints} onCheckedChange={setUsePoints} />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl p-6 space-y-4 sticky top-24">
            <h3>Order Summary</h3>

            <div className="space-y-3">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
                    <ImageWithFallback
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm line-clamp-2">{item.name}</div>
                    <div className="text-xs text-muted-foreground">Size: {item.size}</div>
                    <div className="text-sm mt-1">₹{item.price}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-success">
                <span>Discount</span>
                <span>-₹{discount}</span>
              </div>
              {usePoints && (
                <div className="flex justify-between text-sm text-success">
                  <span>Points Discount</span>
                  <span>-₹{pointsDiscount}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery</span>
                <span className="text-success">{delivery === 0 ? 'FREE' : `₹${delivery}`}</span>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <div className="flex justify-between items-baseline mb-4">
                <span>Total</span>
                <span className="text-2xl">₹{total.toLocaleString()}</span>
              </div>

              <Button className="w-full" size="lg">
                Place Order
              </Button>
            </div>

            {usePoints && (
              <div className="bg-success/10 border border-success/20 rounded-lg p-3 text-sm text-success">
                You're saving ₹{pointsDiscount} with reward points! 🎉
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
