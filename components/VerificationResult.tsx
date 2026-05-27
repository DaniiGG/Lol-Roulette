"use client";

import { useTranslations } from 'next-intl'

interface VerificationResultProps {
  result: {
    pending?: boolean;
    message?: string;
    success?: boolean;
    playedCorrectChampion?: boolean;
    won?: boolean;
    championPlayed?: string;
    stats?: {
      kills: number;
      deaths: number;
      assists: number;
      cs: number;
      gold: number;
    };
  };
  championName: string;
}

export default function VerificationResult({ result, championName }: VerificationResultProps) {
  const t = useTranslations('verificationResult');

  if (result.pending) {
    return (
      <div className="animate-scale-in rounded-2xl border border-cyan-500/30 bg-cyan-500/5 p-6">
        <div className="flex items-center gap-4">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <div className="absolute inset-0 rounded-xl border border-cyan-400/20 animate-pulse" />
            <svg className="w-6 h-6 text-cyan-400 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <div>
            <h3 className="text-cyan-300 font-bold tracking-wide">{t('scanning')}</h3>
            <p className="text-zinc-500 text-sm mt-0.5">{result.message || t('waiting')}</p>
          </div>
        </div>
      </div>
    );
  }

  const isWin = result.success && result.won;
  const isCorrect = result.playedCorrectChampion;

  return (
    <div className={`animate-scale-in rounded-2xl border-2 p-6 relative overflow-hidden ${
      isWin
        ? 'border-emerald-500/50 bg-emerald-500/10'
        : isCorrect
        ? 'border-amber-500/40 bg-amber-500/10'
        : 'border-red-500/40 bg-red-500/10'
    }`}>
      {/* Animated background glow */}
      <div className={`absolute -inset-20 opacity-20 blur-3xl pointer-events-none ${
        isWin ? 'bg-emerald-500' : isCorrect ? 'bg-amber-500' : 'bg-red-500'
      }`} />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <span className="text-5xl">{isWin ? '🏆' : isCorrect ? '😔' : '💀'}</span>
          <div>
            <h3 className={`text-2xl font-bold tracking-tight ${
              isWin ? 'text-emerald-400' : isCorrect ? 'text-amber-400' : 'text-red-400'
            }`}
            style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
              {isWin ? t('victory') : isCorrect ? t('defeat') : t('challengeFailed')}
            </h3>
            <p className="text-zinc-400 text-sm mt-0.5">
              {isCorrect
                ? t('youPlayed', { champion: result.championPlayed ?? '' })
                : t('wrongChampion', { actual: result.championPlayed ?? '', expected: championName })
              }
              {isCorrect && !result.won && t('badLuck')}
            </p>
          </div>
        </div>

        {/* Stats */}
        {result.stats && (
          <div className="grid grid-cols-4 gap-3 pt-4 border-t border-white/5">
            <div className="text-center bg-zinc-900/60 rounded-lg p-3 border border-zinc-800/50">
              <p className="text-zinc-500 text-[10px] tracking-wider uppercase mb-1">{t('kda')}</p>
              <p className="text-white font-bold text-base">
                {result.stats.kills}/{result.stats.deaths}/{result.stats.assists}
              </p>
              {result.stats.deaths > 0 && (
                <p className="text-zinc-500 text-[10px] mt-0.5">
                  {((result.stats.kills + result.stats.assists) / result.stats.deaths).toFixed(1)}:1
                </p>
              )}
            </div>
            <div className="text-center bg-zinc-900/60 rounded-lg p-3 border border-zinc-800/50">
              <p className="text-zinc-500 text-[10px] tracking-wider uppercase mb-1">{t('cs')}</p>
              <p className="text-white font-bold text-base">{result.stats.cs}</p>
              <p className="text-zinc-500 text-[10px] mt-0.5">{t('minions')}</p>
            </div>
            <div className="text-center bg-zinc-900/60 rounded-lg p-3 border border-zinc-800/50">
              <p className="text-zinc-500 text-[10px] tracking-wider uppercase mb-1">{t('gold')}</p>
              <p className="text-white font-bold text-base">{Math.round(result.stats.gold / 1000)}k</p>
              <p className="text-zinc-500 text-[10px] mt-0.5">{t('earned')}</p>
            </div>
            <div className="text-center bg-zinc-900/60 rounded-lg p-3 border border-zinc-800/50">
              <p className="text-zinc-500 text-[10px] tracking-wider uppercase mb-1">{t('kp')}</p>
              <p className="text-white font-bold text-base">{result.stats.kills + result.stats.assists}</p>
              <p className="text-zinc-500 text-[10px] mt-0.5">{t('involved')}</p>
            </div>
          </div>
        )}

        {isWin && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
              <span className="text-emerald-400 font-bold tracking-wider text-lg"
                    style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                {t('xpEarned')}
              </span>
              <span className="text-emerald-400/60 text-sm">{t('xpLabel')}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
