"use client";

import { useState } from 'react'
import { Settings, X, Zap, Bell, Volume2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface SettingsModalProps {
  onClose: () => void
  settings: {
    autoVerify: boolean
    notifications: boolean
    sound: boolean
  }
  onSave: (settings: any) => void
}

export default function SettingsModal({ onClose, settings, onSave }: SettingsModalProps) {
  const t = useTranslations('settings');
  const [localSettings, setLocalSettings] = useState(settings)

  const handleSave = () => {
    onSave(localSettings)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 rounded-3xl border border-neutral-800 p-8 max-w-md w-full">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <Settings className="w-6 h-6 text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">{t('title')}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Settings */}
        <div className="space-y-4">
          
          {/* Auto-Verification */}
          <div className="p-4 bg-neutral-800/50 rounded-xl border border-neutral-700">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-white">{t('autoVerify')}</h3>
                  <label className="relative inline-block w-12 h-6">
                    <input
                      type="checkbox"
                      checked={localSettings.autoVerify}
                      onChange={(e) => setLocalSettings({ ...localSettings, autoVerify: e.target.checked })}
                      className="sr-only peer"
                    />
                    <span className="absolute inset-0 bg-neutral-700 rounded-full peer-checked:bg-blue-600 transition cursor-pointer"></span>
                    <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6"></span>
                  </label>
                </div>
                <p className="text-sm text-neutral-400">{t('autoVerifyDesc')}</p>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="p-4 bg-neutral-800/50 rounded-xl border border-neutral-700">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Bell className="w-5 h-5 text-green-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-white">{t('notifications')}</h3>
                  <label className="relative inline-block w-12 h-6">
                    <input
                      type="checkbox"
                      checked={localSettings.notifications}
                      onChange={(e) => setLocalSettings({ ...localSettings, notifications: e.target.checked })}
                      className="sr-only peer"
                    />
                    <span className="absolute inset-0 bg-neutral-700 rounded-full peer-checked:bg-green-600 transition cursor-pointer"></span>
                    <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6"></span>
                  </label>
                </div>
                <p className="text-sm text-neutral-400">{t('notificationsDesc')}</p>
              </div>
            </div>
          </div>

          {/* Sound */}
          <div className="p-4 bg-neutral-800/50 rounded-xl border border-neutral-700">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Volume2 className="w-5 h-5 text-yellow-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-white">{t('sound')}</h3>
                  <label className="relative inline-block w-12 h-6">
                    <input
                      type="checkbox"
                      checked={localSettings.sound}
                      onChange={(e) => setLocalSettings({ ...localSettings, sound: e.target.checked })}
                      className="sr-only peer"
                    />
                    <span className="absolute inset-0 bg-neutral-700 rounded-full peer-checked:bg-yellow-600 transition cursor-pointer"></span>
                    <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6"></span>
                  </label>
                </div>
                <p className="text-sm text-neutral-400">{t('soundDesc')}</p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-8 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-neutral-800 text-white hover:bg-neutral-700 transition"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 rounded-xl bg-white text-neutral-950 font-semibold hover:bg-neutral-100 transition"
          >
            {t('save')}
          </button>
        </div>

        {/* Info */}
        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-xs text-blue-300">{t('tip')}</p>
        </div>
      </div>
    </div>
  )
}
