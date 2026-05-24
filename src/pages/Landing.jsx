import { Link } from 'react-router-dom'
import {
  Hospital,
  Shield,
  Users,
  ClipboardList,
  ArrowRight,
} from 'lucide-react'

const features = [
  {
    icon: Users,
    title: 'Gestion des utilisateurs',
    desc: "Administrateurs, médecins et personnel d'accueil avec des rôles et permissions dédiés.",
  },
  {
    icon: Hospital,
    title: 'Dossiers patients',
    desc: 'Enregistrement, recherche et mise à jour des informations patients en temps réel.',
  },
  {
    icon: ClipboardList,
    title: 'Consultations médicales',
    desc: 'Création et suivi des dossiers médicaux avec historique complet.',
  },
  {
    icon: Shield,
    title: 'Sécurité & Rôles',
    desc: 'Accès différencié selon le profil : chaque utilisateur voit uniquement ce dont il a besoin.',
  },
]

export default function Landing() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900'>
      <div className='max-w-6xl mx-auto px-4 py-6'>
        <nav className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Hospital className='w-7 h-7 text-white' />
            <span className='text-xl font-bold text-white'>MediSys</span>
          </div>
          <Link
            to='/login'
            className='px-5 py-2 bg-white text-primary-700 font-medium rounded-lg hover:bg-primary-50 transition-colors text-sm'
          >
            Se connecter
          </Link>
        </nav>
      </div>

      <div className='max-w-6xl mx-auto px-4 pt-20 pb-16 text-center'>
        <div className='inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur rounded-full text-white/80 text-sm mb-8'>
          <Hospital className='w-4 h-4' />
          Application de gestion hospitalière
        </div>

        <h1 className='text-4xl md:text-6xl font-bold text-white mb-6 leading-tight'>
          Gestion des établissements de santé publique du Cameroun
          <br />
          <span className='text-primary-200'>en toute simplicité</span>
        </h1>

        <p className='text-lg text-primary-100 max-w-2xl mx-auto mb-10'>
          MediSys est une plateforme complète de gestion hospitalière en
          architecture microservices. Gérez les utilisateurs, les patients et
          les consultations depuis un point d&apos;entrée unique et sécurisé.
        </p>

        <div className='flex items-center justify-center gap-4'>
          <Link
            to='/login'
            className='inline-flex items-center gap-2 px-8 py-3 bg-white text-primary-700 font-semibold rounded-xl hover:bg-primary-50 transition-all shadow-lg shadow-black/20'
          >
            Accéder à l&apos;application
            <ArrowRight className='w-5 h-5' />
          </Link>
        </div>
      </div>

      <div className='max-w-6xl mx-auto px-4 py-20'>
        <h2 className='text-2xl font-bold text-white text-center mb-12'>
          Fonctionnalités principales
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {features.map((f) => {
            const Icon = f.icon
            return (
              <div
                key={f.title}
                className='bg-white/10 backdrop-blur rounded-xl p-6 text-center'
              >
                <div className='w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-4'>
                  <Icon className='w-6 h-6 text-white' />
                </div>
                <h3 className='text-white font-semibold mb-2'>{f.title}</h3>
                <p className='text-primary-200 text-sm'>{f.desc}</p>
              </div>
            )
          })}
        </div>
      </div>

      <div className='max-w-6xl mx-auto px-4 py-12 text-center border-t border-white/10'>
        <p className='text-primary-200 text-sm'>
          MediSys v1.0 — Application de gestion hospitalière en architecture
          microservices @VisionTech 2026 Cameroun healthcare management system.
          Tous droits réservés.
        </p>
      </div>
    </div>
  )
}
