import { Gift, Share2, Trophy, TrendingUp, Copy, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { useState } from 'react';

export function RewardsSection({ onClose }: { onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const points = 2450;
  const referralCode = 'BYNDIO2024XYZ';

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    const text = `Join BYNDIO and get ₹100 off! Use my code: ${referralCode}`;
    if (navigator.share) {
      navigator.share({ text });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4 pb-20">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2>Rewards & Referrals</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
        </div>

        <div className="bg-gradient-to-br from-primary to-purple-600 text-white rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-90 mb-1">Your Points</div>
              <div className="text-4xl">{points.toLocaleString()}</div>
            </div>
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
              <Trophy className="w-8 h-8" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Next reward in 550 points</span>
              <span>₹500 voucher</span>
            </div>
            <Progress value={82} className="bg-white/20" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
              <Share2 className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h3>Refer & Earn</h3>
              <p className="text-sm text-muted-foreground">Get ₹100 for every friend</p>
            </div>
          </div>

          <div className="bg-secondary rounded-xl p-4 space-y-3">
            <div className="text-sm text-muted-foreground">Your referral code</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white rounded-lg px-4 py-3 text-lg tracking-wider border-2 border-dashed border-primary">
                {referralCode}
              </div>
              <Button
                size="icon"
                variant="outline"
                onClick={handleCopy}
                className="shrink-0"
              >
                {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <Button onClick={handleShare} className="w-full gap-2">
              <Share2 className="w-4 h-4" />
              Share on WhatsApp
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 space-y-4">
          <h3>Earn More Points</h3>

          <div className="space-y-3">
            {[
              { action: 'First purchase', points: 500, icon: Gift },
              { action: 'Write a review', points: 50, icon: TrendingUp },
              { action: 'Refer a friend', points: 100, icon: Share2 },
              { action: 'Complete profile', points: 200, icon: Trophy },
            ].map((item, idx) => (
              <button
                key={idx}
                className="w-full flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span>{item.action}</span>
                </div>
                <Badge variant="secondary">+{item.points} pts</Badge>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 space-y-4">
          <h3>Recent Activity</h3>

          <div className="space-y-3">
            {[
              { text: 'Earned 500 points', detail: 'First purchase bonus', date: '2 days ago', positive: true },
              { text: 'Redeemed 1000 points', detail: 'Applied to order #12345', date: '5 days ago', positive: false },
              { text: 'Earned 100 points', detail: 'Friend signed up', date: '1 week ago', positive: true },
            ].map((activity, idx) => (
              <div key={idx} className="flex items-start gap-3 pb-3 border-b border-border last:border-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  activity.positive ? 'bg-success/10' : 'bg-muted'
                }`}>
                  {activity.positive ? '+' : '-'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm">{activity.text}</div>
                  <div className="text-xs text-muted-foreground">{activity.detail}</div>
                </div>
                <div className="text-xs text-muted-foreground shrink-0">{activity.date}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 space-y-3">
          <h3>Your Badges</h3>
          <div className="grid grid-cols-4 gap-3">
            {['🥇', '🎯', '🌟', '🔥', '💎', '🎁', '⚡', '🏆'].map((emoji, idx) => (
              <div
                key={idx}
                className={`aspect-square rounded-xl flex items-center justify-center text-3xl ${
                  idx < 4 ? 'bg-gradient-to-br from-primary/10 to-accent/10' : 'bg-muted opacity-40'
                }`}
              >
                {emoji}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
