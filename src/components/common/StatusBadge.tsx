import React from 'react';
import { DocumentStatus } from '../../types';
import { CheckCircle2, Clock, AlertCircle, XCircle, FileUp, CircleDashed } from 'lucide-react';

interface StatusBadgeProps {
  status: DocumentStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
}) => {
  let label = '';
  let colorClass = '';
  let Icon = CircleDashed;

  switch (status) {
    case 'LENGKAP':
      label = 'Lengkap';
      colorClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';
      Icon = CheckCircle2;
      break;
    case 'MENUNGGU_PEMERIKSAAN':
      label = 'Menunggu Pemeriksaan';
      colorClass = 'bg-amber-100 text-amber-800 border-amber-300';
      Icon = Clock;
      break;
    case 'PERLU_PERBAIKAN':
      label = 'Perlu Perbaikan';
      colorClass = 'bg-orange-100 text-orange-800 border-orange-300';
      Icon = AlertCircle;
      break;
    case 'DITOLAK':
      label = 'Ditolak';
      colorClass = 'bg-rose-100 text-rose-800 border-rose-300';
      Icon = XCircle;
      break;
    case 'SUDAH_DIUNGGAH':
      label = 'Sudah Diunggah';
      colorClass = 'bg-blue-100 text-blue-800 border-blue-300';
      Icon = FileUp;
      break;
    case 'BELUM_DIUNGGAH':
    default:
      label = 'Belum Diunggah';
      colorClass = 'bg-slate-100 text-slate-700 border-slate-300';
      Icon = CircleDashed;
      break;
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 gap-2 font-semibold',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border ${colorClass} ${sizeClasses[size]}`}
    >
      {showIcon && <Icon className={`${iconSizes[size]} shrink-0`} />}
      <span>{label}</span>
    </span>
  );
};
