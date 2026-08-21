import React from 'react';
import { cn } from '@/lib/utils';
import { Phone, PhoneCall, PhoneOff, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { CallStatus } from '@/types';

interface CommunicationStatusProps {
  status?: CallStatus | string;
  className?: string;
}

interface StatusItemConfig {
  label: string;
  icon: React.ElementType;
  classes: string;
  iconClasses: string;
  pulse?: boolean;
}

const config: Record<string, StatusItemConfig> = {
  queued: {
    label: 'Queued',
    icon: Clock,
    classes: 'text-neutral-500',
    iconClasses: 'text-neutral-400',
    pulse: false,
  },
  pending: {
    label: 'Queued',
    icon: Clock,
    classes: 'text-neutral-500',
    iconClasses: 'text-neutral-400',
    pulse: false,
  },
  calling: {
    label: 'Calling parent...',
    icon: PhoneCall,
    classes: 'text-black font-semibold',
    iconClasses: 'text-black',
    pulse: true,
  },
  in_progress: {
    label: 'Calling parent...',
    icon: PhoneCall,
    classes: 'text-black font-semibold',
    iconClasses: 'text-black',
    pulse: true,
  },
  completed: {
    label: 'Call completed',
    icon: CheckCircle2,
    classes: 'text-black font-medium',
    iconClasses: 'text-black',
    pulse: false,
  },
  resolved: {
    label: 'Call completed',
    icon: CheckCircle2,
    classes: 'text-black font-medium',
    iconClasses: 'text-black',
    pulse: false,
  },
  failed: {
    label: 'Call failed',
    icon: XCircle,
    classes: 'text-black font-medium',
    iconClasses: 'text-neutral-400',
    pulse: false,
  },
  no_answer: {
    label: 'No answer',
    icon: PhoneOff,
    classes: 'text-neutral-600',
    iconClasses: 'text-neutral-400',
    pulse: false,
  },
  follow_up: {
    label: 'Follow-up queued',
    icon: Phone,
    classes: 'text-black font-medium',
    iconClasses: 'text-black',
    pulse: false,
  },
};

const defaultItem: StatusItemConfig = {
  label: 'Queued',
  icon: Clock,
  classes: 'text-neutral-500',
  iconClasses: 'text-neutral-400',
  pulse: false,
};

export function CommunicationStatus({ status = 'queued', className }: CommunicationStatusProps) {
  const current = (status && config[status]) ? config[status]! : defaultItem;
  const Icon = current.icon;

  return (
    <div className={cn('flex items-center gap-1.5 text-xs', current.classes, className)}>
      <Icon className={cn('h-3.5 w-3.5 shrink-0', current.iconClasses, current.pulse && 'animate-pulse')} />
      <span>{current.label}</span>
    </div>
  );
}
