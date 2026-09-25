import React from 'react';
import { School, KopSuratConfig } from '../../types';
import { storageService } from '../../services/storage';
import { GraduationCap } from 'lucide-react';

interface KopSuratProps {
  school: School;
  title?: string;
  subtitle?: string;
  config?: KopSuratConfig;
}

export const KopSurat: React.FC<KopSuratProps> = ({
  school,
  title,
  subtitle,
  config: propConfig,
}) => {
  const config = propConfig || storageService.getKopSuratConfig();

  const logoUrl = config.logo_url || school.logo_url;
  const foundationName = config.foundation_name || 'YAYASAN MUTIARA ISLAM PALOPO';
  const schoolName = config.school_name || school.name;
  const address = config.address || school.address;
  const npsn = config.npsn || school.npsn;
  const phone = config.phone || school.phone;
  const email = config.email || school.email;
  const website = config.website || school.website;
  const rightLogoUrl = config.right_logo_url;
  const rightTextTop = config.right_text_top || 'KOTA PALOPO';
  const rightTextBottom = config.right_text_bottom || 'SUL-SEL';

  return (
    <div className="w-full pb-4 mb-4 border-b-4 border-double border-slate-900 text-slate-900">
      <div className="flex items-center justify-between gap-4">
        {/* Left Logo */}
        <div className="w-20 h-20 shrink-0 flex items-center justify-center rounded-xl bg-blue-50 border border-blue-200 text-blue-700 overflow-hidden">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Logo Sekolah"
              className="max-h-16 max-w-16 object-contain"
            />
          ) : (
            <div className="flex flex-col items-center">
              <GraduationCap className="w-10 h-10 text-blue-700" />
              <span className="text-[9px] font-extrabold text-blue-900 uppercase tracking-tighter">
                TKIT MUTIARA
              </span>
            </div>
          )}
        </div>

        {/* School Info */}
        <div className="flex-1 text-center">
          <p className="text-xs font-semibold tracking-wider text-slate-600 uppercase">
            {foundationName}
          </p>
          <h1 className="text-xl sm:text-2xl font-black text-slate-950 uppercase tracking-tight">
            {schoolName}
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            {address} &bull; NPSN: {npsn}
          </p>
          <p className="text-xs text-slate-500">
            Telp: {phone} &bull; Email: {email} &bull; Website: {website}
          </p>
        </div>

        {/* Right Emblem / Logo */}
        <div className="w-20 h-20 shrink-0 flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 overflow-hidden p-1">
          {rightLogoUrl ? (
            <div className="flex flex-col items-center justify-center w-full h-full text-center">
              <img
                src={rightLogoUrl}
                alt="Logo Lambang Daerah"
                className="max-h-11 max-w-16 object-contain"
              />
              {(rightTextTop || rightTextBottom) && (
                <span className="text-[8px] font-bold text-slate-700 block truncate max-w-full mt-0.5 leading-none">
                  {rightTextTop} {rightTextBottom ? `• ${rightTextBottom}` : ''}
                </span>
              )}
            </div>
          ) : (
            <div className="text-center p-1">
              <span className="text-[10px] font-bold text-slate-700 block leading-tight">
                {rightTextTop}
              </span>
              <span className="text-[9px] text-slate-500 block leading-tight">
                {rightTextBottom}
              </span>
            </div>
          )}
        </div>
      </div>

      {title && (
        <div className="mt-4 pt-3 border-t border-slate-300 text-center">
          <h2 className="text-base sm:text-lg font-bold uppercase tracking-wide text-slate-900">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5 font-medium">
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
