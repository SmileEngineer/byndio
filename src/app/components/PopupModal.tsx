import { X, Gift, Share2, TrendingUp } from 'lucide-react';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'motion/react';

type PopupType = 'signup' | 'referral' | 'firstPurchase' | 'returning' | 'referralSuccess';

interface PopupModalProps {
  type: PopupType;
  onClose: () => void;
}

export function PopupModal({ type, onClose }: PopupModalProps) {
  const content = {
    signup: {
      emoji: '🎉',
      title: 'Welcome to BYNDIO!',
      subtitle: 'Get ₹100 off on your first order',
      description: 'Use code: FIRST100 at checkout',
      buttonText: 'Start Shopping',
      gradient: 'from-blue-500 to-purple-600'
    },
    referral: {
      emoji: '🎁',
      title: 'Share the Love!',
      subtitle: 'Refer friends and earn ₹100',
      description: 'Get ₹100 for every friend who makes their first purchase',
      buttonText: 'Get My Code',
      gradient: 'from-pink-500 to-rose-600'
    },
    firstPurchase: {
      emoji: '⚡',
      title: 'First Order Boost!',
      subtitle: 'Extra 20% off + Free Delivery',
      description: 'Limited time offer for first-time buyers',
      buttonText: 'Shop Now',
      gradient: 'from-amber-500 to-orange-600'
    },
    returning: {
      emoji: '👋',
      title: 'Welcome Back!',
      subtitle: 'We missed you! Here\'s 15% off',
      description: 'Valid on orders above ₹999',
      buttonText: 'Claim Offer',
      gradient: 'from-green-500 to-teal-600'
    },
    referralSuccess: {
      emoji: '🎊',
      title: 'Referral Success!',
      subtitle: '₹100 added to your wallet',
      description: 'Your friend just made their first purchase',
      buttonText: 'View Wallet',
      gradient: 'from-purple-500 to-pink-600'
    }
  };

  const config = content[type];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-md"
        >
          <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
            <div className={`bg-gradient-to-br ${config.gradient} p-8 text-white text-center relative`}>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 bg-white/20 backdrop-blur rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-6xl mb-4">{config.emoji}</div>
              <h3 className="text-2xl mb-2">{config.title}</h3>
              <p className="text-lg opacity-90">{config.subtitle}</p>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-center text-muted-foreground">{config.description}</p>

              <Button onClick={onClose} className="w-full" size="lg">
                {config.buttonText}
              </Button>

              <button
                onClick={onClose}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Maybe later
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
