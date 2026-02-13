// components/RSOLoginModal.tsx
'use client'

interface RSOLoginModalProps {
  onClose: () => void
}

export default function RSOLoginModal({ onClose }: RSOLoginModalProps) {
  
  const handleLogin = () => {
    // Redirigir a la ruta de autorización
    window.location.href = '/api/auth/riot-oauth/authorize'
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 rounded-3xl border border-neutral-800 p-8 max-w-md w-full">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-white">Login with Riot</h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        {/* Riot Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
            </svg>
          </div>
        </div>

        {/* Description */}
        <div className="text-center mb-6">
          <p className="text-neutral-300 mb-4">
            Sign in with your Riot Games account to track your progress, earn XP, and unlock achievements.
          </p>
        </div>

        {/* Login Button */}
        <button
          onClick={handleLogin}
          className="w-full py-4 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-500 transition flex items-center justify-center gap-3 shadow-lg shadow-red-600/30"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
          </svg>
          <span>Sign in with Riot Games</span>
        </button>

        {/* Info */}
        <div className="mt-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-blue-300 text-xs">
              <p className="font-semibold mb-1">Secure Authentication</p>
              <p>We use Riot's official OAuth2 system. Your password is never stored or seen by us.</p>
            </div>
          </div>
        </div>

        {/* Privacy */}
        <div className="mt-4 text-center">
          <p className="text-neutral-500 text-xs">
            By signing in, you agree to our{' '}
            <a href="/terms" className="text-blue-400 hover:text-blue-300" target="_blank">Terms</a>
            {' '}and{' '}
            <a href="/privacy" className="text-blue-400 hover:text-blue-300" target="_blank">Privacy Policy</a>
          </p>
        </div>

      </div>
    </div>
  )
}