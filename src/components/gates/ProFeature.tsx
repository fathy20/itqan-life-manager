import React from 'react';
import { Lock, Sparkles } from 'lucide-react';
import { useFeatureGate } from '../../hooks/useFeatureGate';
import { motion } from 'motion/react';

type Feature = Parameters<typeof useFeatureGate>[0];

interface Props {
  feature: Feature;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const PLAN_LABELS = { free: 'مجاني', pro: 'Pro', premium: 'Premium' };
const PLAN_COLORS = { free: 'brand', pro: 'brand', premium: 'yellow' };

export default function ProFeature({ feature, children, fallback }: Props) {
  const { canAccess, requiredPlan, loading } = useFeatureGate(feature);

  if (loading) return <div className="animate-pulse h-32 bg-white/5 rounded-2xl" />;
  if (canAccess) return <>{children}</>;
  if (fallback) return <>{fallback}</>;

  return (
    <div className="relative rounded-2xl overflow-hidden">
      <div className="blur-sm pointer-events-none opacity-40 select-none">
        {children}
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/60 backdrop-blur-sm"
      >
        <div className="w-14 h-14 rounded-2xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
          <Lock size={24} className="text-brand-400" />
        </div>
        <div className="text-center">
          <p className="font-bold text-white">ميزة {PLAN_LABELS[requiredPlan]}</p>
          <p className="text-xs text-white/50 mt-1">ترقّ لخطة {PLAN_LABELS[requiredPlan]} للوصول</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold rounded-xl transition-all">
          <Sparkles size={16} />
          ترقية الخطة
        </button>
      </motion.div>
    </div>
  );
}
