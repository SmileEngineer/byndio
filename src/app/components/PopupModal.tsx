import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Button } from './ui/button';
import { popupContent } from '../mockData';
import type { PopupType } from '../types';

interface PopupModalProps {
  type: PopupType;
  onClose: () => void;
}

export function PopupModal({ type, onClose }: PopupModalProps) {
  const config = popupContent[type];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          className="w-full max-w-md overflow-hidden rounded-[28px] bg-white shadow-2xl"
        >
          <div className={`bg-gradient-to-br ${config.gradient} p-6 text-white`}>
            <div className="mb-6 flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs backdrop-blur">
                  Universal popup system
                </div>
                <h3 className="text-2xl">{config.title}</h3>
                <p className="text-sm text-white/85">{config.subtitle}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="shrink-0 rounded-full text-white hover:bg-white/15 hover:text-white"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="rounded-2xl bg-white/12 p-4 text-sm text-white/90 backdrop-blur">
              {config.body}
            </div>
          </div>

          <div className="space-y-3 p-6">
            <Button onClick={onClose} className="w-full rounded-full">
              {config.cta}
            </Button>
            <button
              onClick={onClose}
              className="w-full rounded-full border border-border px-4 py-3 text-sm text-muted-foreground transition hover:border-primary hover:text-foreground"
            >
              {config.secondary}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
