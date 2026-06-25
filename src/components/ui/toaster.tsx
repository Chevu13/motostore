'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts
        .filter((t) => t.open)
        .map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-start gap-3 glass border border-white/10 rounded-xl p-4 shadow-2xl min-w-[280px] max-w-sm animate-in slide-in-from-right-full"
          >
            {toast.variant === 'success' && (
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            )}
            {toast.variant === 'destructive' && (
              <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            )}
            {!toast.variant || toast.variant === 'default' ? (
              <CheckCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
            ) : null}
            <div className="flex-1 min-w-0">
              {toast.title && (
                <p className="text-sm font-semibold text-white">{toast.title}</p>
              )}
              {toast.description && (
                <p className="text-xs text-white/60 mt-0.5">{toast.description}</p>
              )}
            </div>
            <button
              onClick={() => dismiss(toast.id)}
              className="text-white/30 hover:text-white transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
    </div>
  )
}
