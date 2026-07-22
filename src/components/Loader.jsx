import { Loader2 } from 'lucide-react'

export default function Loader({ text }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      <p className="text-sm text-gray-500">{text || 'Chargement...'}</p>
    </div>
  )
}
