import { useState } from 'react';
import { Check, HelpCircle, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';

export function SellerOnboarding({ onClose }: { onClose: () => void }) {
  const [hasGST, setHasGST] = useState(false);
  const [sellAllIndia, setSellAllIndia] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [step, setStep] = useState(1);

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-10 bg-white border-b border-border px-4 py-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2>Become a BYNDIO Seller</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
          </div>

          <div className="flex items-center gap-2">
            {[1, 2, 3].map((num) => (
              <div key={num} className="flex items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                  step >= num ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                }`}>
                  {step > num ? <Check className="w-4 h-4" /> : num}
                </div>
                {num < 3 && (
                  <div className={`flex-1 h-1 ${step > num ? 'bg-primary' : 'bg-muted'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4 pb-24 space-y-6">
        {step === 1 && (
          <>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-sm">Start selling in your local area and grow to all of India!</div>
                  <div className="text-xs text-muted-foreground">With or without GST, we have options for everyone.</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3>Business Information</h3>

              <div className="space-y-2">
                <Label>Business Name</Label>
                <Input placeholder="Enter your business name" />
              </div>

              <div className="space-y-2">
                <Label>Owner Name</Label>
                <Input placeholder="Enter owner's full name" />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="business@example.com" />
              </div>

              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input type="tel" placeholder="+91 98765 43210" />
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span>I have GST registration</span>
                    <button className="text-muted-foreground">
                      <HelpCircle className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {hasGST ? 'You can sell across India' : 'You can sell locally in your area'}
                  </div>
                </div>
                <Switch checked={hasGST} onCheckedChange={setHasGST} />
              </div>

              {hasGST && (
                <div className="space-y-2">
                  <Label>GST Number</Label>
                  <Input placeholder="27AAPFU0939F1ZV" />
                  <div className="flex items-center gap-2 text-xs text-success">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Valid GST format</span>
                  </div>
                </div>
              )}

              {!hasGST && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
                  <h4 className="text-sm">Selling Without GST</h4>
                  <ul className="text-xs space-y-1 text-muted-foreground">
                    <li>• You can sell to customers in your local area only</li>
                    <li>• Annual turnover limited to ₹20 lakhs</li>
                    <li>• You can upgrade to GST later to sell pan-India</li>
                  </ul>
                </div>
              )}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="space-y-4">
              <h3>Selling Preferences</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button className={`p-4 rounded-lg border-2 text-left transition-colors ${
                  !sellAllIndia ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                }`} onClick={() => setSellAllIndia(false)}>
                  <div className="mb-2">📍 Local Selling</div>
                  <div className="text-sm text-muted-foreground">Deliver to customers within 10-20 km</div>
                  <div className="mt-2">
                    <Badge variant="secondary" className="text-xs">Fast delivery</Badge>
                  </div>
                </button>

                <button className={`p-4 rounded-lg border-2 text-left transition-colors ${
                  sellAllIndia ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                } ${!hasGST && 'opacity-50 cursor-not-allowed'}`}
                onClick={() => hasGST && setSellAllIndia(true)}>
                  <div className="mb-2">🇮🇳 All India</div>
                  <div className="text-sm text-muted-foreground">Deliver anywhere in India</div>
                  <div className="mt-2">
                    {!hasGST ? (
                      <Badge variant="secondary" className="text-xs">Requires GST</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Wider reach</Badge>
                    )}
                  </div>
                </button>
              </div>

              <div className="space-y-2">
                <Label>Store Address</Label>
                <Input placeholder="Street address" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input placeholder="Mumbai" />
                </div>
                <div className="space-y-2">
                  <Label>Pincode</Label>
                  <Input placeholder="400001" />
                </div>
              </div>

              <div className="space-y-3">
                <h4>Bank Details</h4>

                <div className="space-y-2">
                  <Label>Bank Account Number</Label>
                  <Input placeholder="Enter account number" />
                </div>

                <div className="space-y-2">
                  <Label>IFSC Code</Label>
                  <Input placeholder="SBIN0001234" />
                </div>

                <div className="space-y-2">
                  <Label>Account Holder Name</Label>
                  <Input placeholder="As per bank records" />
                </div>
              </div>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="space-y-4">
              <h3>Review & Submit</h3>

              <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl p-6 space-y-4">
                <div className="text-center space-y-2">
                  <div className="text-4xl">🎉</div>
                  <h4>You're almost there!</h4>
                  <p className="text-sm text-muted-foreground">Review your information and agree to our terms</p>
                </div>
              </div>

              <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                <h4>Important Policies</h4>

                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    <span>Commission: 8-15% based on category</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    <span>Payment cycle: Weekly settlements</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    <span>RTO charges: Borne by seller (₹50-150 per order)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    <span>Return window: 7 days for most products</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    <span>Free seller training & support</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white border border-border rounded-lg">
                <Checkbox
                  id="terms"
                  checked={agreeToTerms}
                  onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                />
                <label htmlFor="terms" className="text-sm cursor-pointer">
                  I agree to BYNDIO's{' '}
                  <button className="text-primary hover:underline">Terms & Conditions</button>,{' '}
                  <button className="text-primary hover:underline">Seller Policy</button>, and{' '}
                  <button className="text-primary hover:underline">Return Policy</button>
                </label>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <HelpCircle className="w-5 h-5 text-blue-600 shrink-0" />
                  <div className="space-y-2">
                    <div className="text-sm">Need Help?</div>
                    <div className="text-xs text-muted-foreground">
                      Our seller support team is available 9 AM - 9 PM
                    </div>
                    <Button variant="outline" size="sm" className="mt-2">
                      Contact Support
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border p-4">
        <div className="max-w-3xl mx-auto flex gap-3">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          )}
          <Button
            className="flex-1"
            onClick={() => {
              if (step < 3) {
                setStep(step + 1);
              } else {
                alert('Application submitted! We will review and get back to you within 24 hours.');
                onClose();
              }
            }}
            disabled={step === 3 && !agreeToTerms}
          >
            {step === 3 ? 'Submit Application' : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
}
