import { useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  MessageCircle,
  PlayCircle,
  Save,
  Upload,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';

interface SellerOnboardingProps {
  onClose: () => void;
}

export function SellerOnboarding({ onClose }: SellerOnboardingProps) {
  const [step, setStep] = useState(1);
  const [hasGST, setHasGST] = useState(false);
  const [sellAllIndia, setSellAllIndia] = useState(false);
  const [turnover, setTurnover] = useState(12);
  const [acceptedDeclaration, setAcceptedDeclaration] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const turnoverProgress = useMemo(() => Math.min(100, (turnover / 40) * 100), [turnover]);

  return (
    <div className="min-h-screen bg-muted/30 pb-28">
      <div className="sticky top-0 z-20 border-b border-border bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 py-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={onClose}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h2>Become a BYNDIO seller</h2>
                <p className="text-sm text-muted-foreground">
                  GST-aware onboarding for local and all-India selling.
                </p>
              </div>
            </div>
            <Button variant="outline" className="gap-2 rounded-full">
              <Save className="h-4 w-4" />
              Save and continue later
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {[1, 2, 3].map((number) => (
              <div key={number} className="flex flex-1 items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm ${
                    step >= number ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {number}
                </div>
                {number < 3 ? (
                  <div className={`h-1 flex-1 rounded-full ${step > number ? 'bg-primary' : 'bg-muted'}`} />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-6 px-4 py-6">
        {step === 1 ? (
          <>
            <div className="rounded-[28px] border border-border bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3>Business and tax setup</h3>
                  <p className="text-sm text-muted-foreground">
                    GST determines service scope, state restrictions and platform compliance.
                  </p>
                </div>
                <Badge className="rounded-full bg-primary px-3 py-1 text-white">Phase 1</Badge>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Business name</Label>
                  <Input placeholder="Enter business name" />
                </div>
                <div className="space-y-2">
                  <Label>Owner name</Label>
                  <Input placeholder="Enter owner name" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input placeholder="seller@example.com" />
                </div>
                <div className="space-y-2">
                  <Label>Phone number</Label>
                  <Input placeholder="+91 98765 43210" />
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-border bg-secondary/40 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium">I have GST registration</div>
                    <div className="text-sm text-muted-foreground">
                      Toggle to unlock all-India selling and broader logistics.
                    </div>
                  </div>
                  <Switch
                    checked={hasGST}
                    onCheckedChange={(checked) => {
                      setHasGST(checked);
                      if (!checked) {
                        setSellAllIndia(false);
                      }
                    }}
                  />
                </div>

                {hasGST ? (
                  <div className="space-y-2">
                    <Label>GST number</Label>
                    <Input placeholder="27AAPFU0939F1ZV" />
                    <div className="flex items-center gap-2 text-xs text-success">
                      <CheckCircle2 className="h-4 w-4" />
                      GST enables all-India selling and full platform unlock.
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
                    Without GST, selling is limited to your own state and annual turnover must stay below Rs 40 lakh.
                  </div>
                )}
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <button
                  onClick={() => setSellAllIndia(false)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    !sellAllIndia ? 'border-primary bg-secondary/50' : 'border-border'
                  }`}
                >
                  <div className="font-medium">Without GST: local selling only</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Deliver within your state. Lower scale, simpler tax workflow.
                  </div>
                </button>
                <button
                  onClick={() => hasGST && setSellAllIndia(true)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    sellAllIndia ? 'border-primary bg-secondary/50' : 'border-border'
                  } ${!hasGST ? 'cursor-not-allowed opacity-55' : ''}`}
                >
                  <div className="font-medium">With GST: all India selling</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Sell nationwide with broader logistics and higher growth.
                  </div>
                </button>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-[28px] border border-border bg-white p-6">
                <h3>Turnover tracking and upgrade alert</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Live estimate to support legal compliance for non-GST sellers.
                </p>
                <div className="mt-4 space-y-3">
                  <Label>Annual turnover (Rs lakh)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={80}
                    value={turnover}
                    onChange={(event) => setTurnover(Number(event.target.value))}
                  />
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full ${turnover >= 32 ? 'bg-amber-500' : 'bg-primary'}`}
                      style={{ width: `${turnoverProgress}%` }}
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">You are at Rs {turnover}L / Rs 40L limit.</div>
                  {turnover >= 32 ? (
                    <div className="rounded-2xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
                      Upgrade alert: Register GST soon to continue selling without disruption.
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="rounded-[28px] border border-border bg-white p-6">
                <h3>Affiliate system explanation</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Affiliates and creators promote your products to increase conversion.
                </p>
                <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                  <div className="rounded-2xl bg-muted/40 p-4">
                    Creators showcase products with styled content and direct traffic to product pages.
                  </div>
                  <div className="rounded-2xl bg-muted/40 p-4">
                    Seller gets more visibility and orders. Affiliate commission applies per successful sale.
                  </div>
                  <div className="rounded-2xl bg-muted/40 p-4">
                    BYNDIO product cards display commission tags to make affiliate economics transparent.
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <div className="rounded-[28px] border border-border bg-white p-6">
              <h3>Operations and support setup</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Configure logistics behavior, policy visibility and seller support channels.
              </p>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Store address</Label>
                  <Input placeholder="Street and landmark" />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Input placeholder="Enter state" />
                </div>
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input placeholder="Enter city" />
                </div>
                <div className="space-y-2">
                  <Label>Pincode</Label>
                  <Input placeholder="400001" />
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-border bg-secondary/40 p-4">
                <h4>RTO charges rule</h4>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl bg-white p-4 text-sm">
                    <div className="font-medium">Without GST seller (local)</div>
                    <div className="mt-1 text-muted-foreground">
                      Seller pays forward shipping plus return shipping when RTO happens.
                    </div>
                  </div>
                  <div className="rounded-2xl bg-white p-4 text-sm">
                    <div className="font-medium">GST seller (all India)</div>
                    <div className="mt-1 text-muted-foreground">
                      Seller pays both side logistics RTO charges for failed delivery or rejection.
                    </div>
                  </div>
                </div>
                <div className="mt-3 rounded-2xl bg-white p-3 text-sm text-muted-foreground">
                  Optional dashboard metric: RTO risk meter (Low / Medium / High).
                </div>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-[28px] border border-border bg-white p-6">
                <h3>Seller responsibilities</h3>
                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <div>Upload correct product details and clear images.</div>
                  <div>Ensure proper packaging and ship orders on time.</div>
                  <div>Accept valid returns and follow GST compliance rules.</div>
                  <div>Submit verification image before packing and shipping.</div>
                </div>
                <button className="mt-4 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm">
                  <Upload className="h-4 w-4" />
                  Upload packaging verification sample
                </button>
              </div>

              <div className="rounded-[28px] border border-border bg-white p-6">
                <h3>Support and training</h3>
                <div className="mt-4 grid gap-3 text-sm">
                  <div className="rounded-2xl bg-muted/40 p-4">
                    <div className="font-medium">Seller support channels</div>
                    <div className="mt-1 text-muted-foreground">Chat, email and WhatsApp support available.</div>
                  </div>
                  <div className="rounded-2xl bg-muted/40 p-4">
                    <div className="font-medium">Training courses (subscription ready)</div>
                    <div className="mt-1 text-muted-foreground">
                      Product uploads, sales growth and affiliate strategy.
                    </div>
                  </div>
                  <div className="rounded-2xl bg-muted/40 p-4">
                    <div className="font-medium">Onboarding tutorial</div>
                    <div className="mt-1 text-muted-foreground">
                      1-5 minute video walkthrough: register, upload, order and payment.
                    </div>
                    <button className="mt-2 inline-flex items-center gap-1 text-primary">
                      <PlayCircle className="h-4 w-4" />
                      Watch demo placeholder
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}

        {step === 3 ? (
          <>
            <div className="rounded-[28px] border border-border bg-white p-6">
              <h3>Legal declaration and policy acceptance</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Mandatory declaration for GST responsibility, returns and refunds.
              </p>

              <div className="mt-4 space-y-3">
                <label className="flex items-start gap-3 rounded-2xl border border-border p-4">
                  <Checkbox
                    checked={acceptedDeclaration}
                    onCheckedChange={(checked) => setAcceptedDeclaration(Boolean(checked))}
                  />
                  <span className="text-sm">
                    Without GST declaration: I confirm annual turnover is below Rs 40 lakh and I will sell only
                    within my state as per GST rules.
                  </span>
                </label>

                <label className="flex items-start gap-3 rounded-2xl border border-border p-4">
                  <Checkbox
                    checked={acceptedTerms}
                    onCheckedChange={(checked) => setAcceptedTerms(Boolean(checked))}
                  />
                  <span className="text-sm">
                    I agree to seller terms, return and refund policy, and accept responsibility for product
                    quality and fulfillment.
                  </span>
                </label>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-[28px] border border-border bg-white p-6">
                <h3>Return and refund policy</h3>
                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <div>Return window: within 7 days of delivery for valid cases.</div>
                  <div>Valid return reasons: damaged item, wrong item, quality issue.</div>
                  <div>Non-returnable: used products, customer-caused damage, marked non-returnable items.</div>
                  <div>Refunds are initiated after pickup and verification to source payment method or wallet.</div>
                </div>
              </div>

              <div className="rounded-[28px] border border-border bg-white p-6">
                <h3>Help and escalation</h3>
                <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                  <div className="rounded-2xl bg-muted/40 p-4">Chat support for onboarding and policy clarification.</div>
                  <div className="rounded-2xl bg-muted/40 p-4">Email support for GST and legal declaration issues.</div>
                  <div className="rounded-2xl bg-muted/40 p-4">WhatsApp support for quick resolution.</div>
                </div>
                <Button variant="outline" className="mt-4 gap-2 rounded-full">
                  <MessageCircle className="h-4 w-4" />
                  Contact seller support
                </Button>
              </div>
            </div>

            <div className="rounded-[28px] border border-border bg-amber-50 p-4 text-sm text-amber-900">
              <div className="mb-2 flex items-center gap-2 font-medium">
                <AlertCircle className="h-4 w-4" />
                Compliance reminder
              </div>
              Seller is fully responsible for GST compliance, product quality and order fulfillment performance.
            </div>
          </>
        ) : null}
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-white px-4 py-4">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 md:flex-row">
          {step > 1 ? (
            <Button variant="outline" onClick={() => setStep((current) => current - 1)} className="rounded-full">
              Back
            </Button>
          ) : null}
          <Button
            className="rounded-full md:flex-1"
            onClick={() => {
              if (step < 3) {
                setStep((current) => current + 1);
                return;
              }
              if (acceptedDeclaration && acceptedTerms) {
                onClose();
              }
            }}
            disabled={step === 3 && (!acceptedDeclaration || !acceptedTerms)}
          >
            {step < 3 ? 'Continue' : 'Submit seller onboarding'}
          </Button>
        </div>
      </div>
    </div>
  );
}
