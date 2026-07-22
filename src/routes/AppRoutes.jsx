import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoute'
import AppLayout from '../components/layout/AppLayout'
import Landing from '../pages/Landing'
import Login from '../pages/Login'
import Dashboard from '../pages/Dashboard'
import UserList from '../pages/Users/UserList'
import CreateUser from '../pages/Users/CreateUser'
import UserProfile from '../pages/Users/UserProfile'
import EditUser from '../pages/Users/EditUser'
import HospitalList from '../pages/Hospitals/HospitalList'
import CreateHospital from '../pages/Hospitals/CreateHospital'
import EditHospital from '../pages/Hospitals/EditHospital'
import PatientList from '../pages/Patients/PatientList'
import PatientDetail from '../pages/Patients/PatientDetail'
import CreatePatient from '../pages/Patients/CreatePatient'
import EditPatient from '../pages/Patients/EditPatient'
import ConsultationList from '../pages/Consultations/ConsultationList'
import ConsultationDetail from '../pages/Consultations/ConsultationDetail'
import CreateConsultation from '../pages/Consultations/CreateConsultation'
import EditConsultation from '../pages/Consultations/EditConsultation'
import TransferConsultation from '../pages/Consultations/TransferConsultation'
import Historique from '../pages/Historique'
import Help from '../pages/Help'
import PendingExamens from '../pages/Examens/PendingExamens'
import AdminStatistics from '../pages/Statistics/StatisticsIndex'
import ChangePassword from '../pages/ChangePassword'
import ForgotPassword from '../pages/ForgotPassword'
import PasswordResetRequests from '../pages/Admin/PasswordResetRequests'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/change-password" element={
        <ProtectedRoute><ChangePassword /></ProtectedRoute>
      } />
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/users" element={<ProtectedRoute permission="canViewUsers"><UserList /></ProtectedRoute>} />
        <Route path="/users/create" element={<ProtectedRoute permission="canManageUsers"><CreateUser /></ProtectedRoute>} />
        <Route path="/users/:id" element={<ProtectedRoute permission="canViewUsers"><UserProfile /></ProtectedRoute>} />
        <Route path="/users/:id/edit" element={<ProtectedRoute permission="canManageUsers"><EditUser /></ProtectedRoute>} />

        <Route path="/hospitals" element={<ProtectedRoute permission="canManageHospitals"><HospitalList /></ProtectedRoute>} />
        <Route path="/hospitals/create" element={<ProtectedRoute permission="canManageHospitals"><CreateHospital /></ProtectedRoute>} />
        <Route path="/hospitals/:id/edit" element={<ProtectedRoute permission="canManageHospitals"><EditHospital /></ProtectedRoute>} />

        <Route path="/patients" element={<ProtectedRoute permission="canViewPatients"><PatientList /></ProtectedRoute>} />
        <Route path="/patients/create" element={<ProtectedRoute permission="canManagePatients"><CreatePatient /></ProtectedRoute>} />
        <Route path="/patients/:id" element={<ProtectedRoute permission="canViewPatients"><PatientDetail /></ProtectedRoute>} />
        <Route path="/patients/:id/edit" element={<ProtectedRoute permission="canManagePatients"><EditPatient /></ProtectedRoute>} />

        <Route path="/consultations" element={<ProtectedRoute permission="canViewConsultations"><ConsultationList /></ProtectedRoute>} />
        <Route path="/consultations/create" element={<ProtectedRoute permission="canCreateConsultation"><CreateConsultation /></ProtectedRoute>} />
        <Route path="/consultations/:id" element={<ProtectedRoute permission="canViewConsultations"><ConsultationDetail /></ProtectedRoute>} />
        <Route path="/consultations/:id/edit" element={<ProtectedRoute permission="canManageConsultations"><EditConsultation /></ProtectedRoute>} />
        <Route path="/consultations/:id/transfer" element={<ProtectedRoute permission="canViewConsultations"><TransferConsultation /></ProtectedRoute>} />
        <Route path="/historique" element={<ProtectedRoute><Historique /></ProtectedRoute>} />

        <Route path="/statistics" element={<ProtectedRoute permission="canViewStatistics"><AdminStatistics /></ProtectedRoute>} />
        <Route path="/admin/password-resets" element={<ProtectedRoute permission="canManageUsers"><PasswordResetRequests /></ProtectedRoute>} />
        <Route path="/help" element={<ProtectedRoute><Help /></ProtectedRoute>} />
        <Route path="/examens/pending" element={<ProtectedRoute permission="canViewConsultations"><PendingExamens /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
