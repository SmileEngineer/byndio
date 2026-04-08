import { useState } from 'react';
import {
  ArrowLeft,
  Copy,
  Gift,
  Share2,
  ShieldCheck,
  Trophy,
  WalletCards,
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

interface RewardsSectionProps {
  onClose: () => void;
  onTriggerPopup: (type: 'referral' | 'referralSuccess') => void;
}

export function RewardsSection({ onClose, onTriggerPopup }: RewardsSectionProps) {
  const [copied, setCopied] = useState(false);
  const points = 2450;
  const usedPoints = 900;
  const referralCode = 'BYNDIO50';
  const availableDiscount = Math.floor(points / 10);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 pb-10">
      <div className="sticky top-0 z-20 border-b border-border bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-4">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2>Rewards and referrals</h2>
            <p className="text-sm text-muted-foreground">
              Points are usable only at checkout. No cash payouts.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-6 px-4 py-6">
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[28px] bg-gradient-to-br from-primary to-blue-700 p-6 text-white">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-white/70">Points wallet</div>
                <div className="mt-2 text-5xl font-semibold">{points.toLocaleString()}</div>
                <div className="mt-2 text-sm text-white/80">Worth Rs {availableDiscount} at checkout</div>
              </div>
              <div className="rounded-full bg-white/15 p-4">
                <WalletCards className="h-7 w-7" />
              </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl bg-white/12 p-4">
                <div className="text-xs uppercase tracking-[0.14em] text-white/70">Earned</div>
                <div className="mt-2 text-xl font-medium">{points + usedPoints}</div>
              </div>
              <div className="rounded-2xl bg-white/12 p-4">
                <div className="text-xs uppercase tracking-[0.14em] text-white/70">Used</div>
                <div className="mt-2 text-xl font-medium">{usedPoints}</div>
              </div>
              <div className="rounded-2xl bg-white/12 p-4">
                <div className="text-xs uppercase tracking-[0.14em] text-white/70">Expiry</div>
                <div className="mt-2 text-xl font-medium">12 days</div>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-border bg-white p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-full bg-accent/15 p-3">
                <Share2 className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h3>Refer and earn</h3>
                <p className="text-sm text-muted-foreground">
                  Referrer +50 points on signup. Bonus after first purchase.
                </p>
              </div>
            </div>

            <div className="rounded-[24px] bg-secondary/60 p-4">
              <div className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Referral code</div>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 rounded-2xl border border-dashed border-primary bg-white px-4 py-3 text-lg font-medium tracking-[0.24em] text-primary">
                  {referralCode}
                </div>
                <Button variant="outline" size="icon" onClick={handleCopy}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {copied ? 'Referral code copied.' : 'Share on WhatsApp or copy the invite link.'}
              </div>
              <div className="mt-4 grid gap-2 md:grid-cols-2">
                <Button className="rounded-full" onClick={() => onTriggerPopup('referral')}>
                  Share and earn 50 points
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() => onTriggerPopup('referralSuccess')}
                >
                  Simulate referral success
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-[28px] border border-border bg-white p-6">
            <h3>Earning rules</h3>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-2xl bg-muted/40 p-4">
                <span>Purchase</span>
                <Badge>1 point / Rs 50</Badge>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-muted/40 p-4">
                <span>Profile completion</span>
                <Badge>+5 once</Badge>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-muted/40 p-4">
                <span>Daily login</span>
                <Badge>+1 per day</Badge>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-border bg-white p-6">
            <h3>Redemption rules</h3>
            <div className="mt-4 space-y-3 text-sm text-muted-foreground">
              <div>100 points = Rs 10 discount</div>
              <div>Minimum redemption: 100 points</div>
              <div>Max usage per order: 15% of order value</div>
              <div>Points expire after 1 month</div>
            </div>
            <div className="mt-4 rounded-2xl bg-secondary/60 p-4">
              <div className="text-sm">You need 50 more points for another Rs 10 discount.</div>
              <Progress value={75} className="mt-3 h-2" />
            </div>
          </div>

          <div className="rounded-[28px] border border-border bg-white p-6">
            <h3>Anti abuse controls</h3>
            <div className="mt-4 space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4 text-success" />
                Email verification required
              </div>
              <div className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4 text-success" />
                Device and IP tracking
              </div>
              <div className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4 text-success" />
                Daily login capped at 1 point
              </div>
              <div className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4 text-success" />
                Referral reward only once per new user
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-[28px] border border-border bg-white p-6">
            <h3>Activity history</h3>
            <div className="mt-4 space-y-3">
              {[
                { title: 'Earned 48 points', detail: 'Purchase on order BYN-1024', date: 'Today' },
                { title: 'Earned 50 points', detail: 'Friend signed up with your code', date: '2 days ago' },
                { title: 'Used 300 points', detail: 'Applied to checkout', date: '1 week ago' },
              ].map((activity) => (
                <div key={activity.title} className="rounded-2xl bg-muted/40 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-medium">{activity.title}</div>
                      <div className="text-sm text-muted-foreground">{activity.detail}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">{activity.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[28px] border border-border bg-white p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-3">
                  <Gift className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3>Badges and progress</h3>
                  <p className="text-sm text-muted-foreground">Low cost gamification for repeat visits.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {['First referral', '5 referrals', '10 purchases', 'Top referrer'].map((badge, index) => (
                  <div
                    key={badge}
                    className={`rounded-2xl p-4 text-sm ${
                      index < 2 ? 'bg-primary/10 text-primary' : 'bg-muted/40 text-muted-foreground'
                    }`}
                  >
                    {badge}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-border bg-white p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-full bg-accent/10 p-3">
                  <Trophy className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h3>Leaderboard</h3>
                  <p className="text-sm text-muted-foreground">Top referrers this month.</p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { name: 'Aarohi', points: 1320 },
                  { name: 'Kabir', points: 1180 },
                  { name: 'You', points: 980 },
                ].map((entry, index) => (
                  <div key={entry.name} className="flex items-center justify-between rounded-2xl bg-muted/40 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
                        {index + 1}
                      </div>
                      <span className={entry.name === 'You' ? 'font-medium text-primary' : ''}>{entry.name}</span>
                    </div>
                    <div className="text-sm">{entry.points} pts</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
