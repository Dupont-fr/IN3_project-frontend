import { useTranslation } from 'react-i18next'
import { Languages } from 'lucide-react'

export default function LanguageSwitcher({ light }) {
  const { i18n } = useTranslation()

  const toggleLang = () => {
    const next = i18n.language === 'fr' ? 'en' : 'fr'
    i18n.changeLanguage(next)
    localStorage.setItem('lang', next)
  }

  return (
    <button
      onClick={toggleLang}
      className={`p-2 rounded-lg transition-colors flex items-center gap-1.5 ${
        light
          ? 'text-white/80 hover:bg-white/10'
          : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
      title={i18n.language === 'fr' ? 'Switch to English' : 'Passer en français'}
    >
      <Languages className="w-5 h-5" />
      <span className="text-xs font-semibold uppercase hidden sm:inline">
        {i18n.language === 'fr' ? 'EN' : 'FR'}
      </span>
    </button>
  )
}
