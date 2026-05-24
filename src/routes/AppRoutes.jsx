import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoute'
import AppLayout from '../components/layout/AppLayout'
import Landing from '../pages/Landing'
import Login from '../pages/Login'
import Dashboard from '../pages/Dashboard'
import UserList from '../pages/Users/UserList'
import CreateUser from '../pages/Users/CreateUser'
import EditUser from '../pages/Users/EditUser'
import PatientList from '../pages/Patients/PatientList'
import CreatePatient from '../pages/Patients/CreatePatient'
import EditPatient from '../pages/Patients/EditPatient'
import ConsultationList from '../pages/Consultations/ConsultationList'
import CreateConsultation from '../pages/Consultations/CreateConsultation'
import EditConsultation from '../pages/Consultations/EditConsultation'
import ChangePassword from '../pages/ChangePassword'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
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
        <Route path="/users/:id/edit" element={<ProtectedRoute permission="canManageUsers"><EditUser /></ProtectedRoute>} />

        <Route path="/patients" element={<ProtectedRoute permission="canViewPatients"><PatientList /></ProtectedRoute>} />
        <Route path="/patients/create" element={<ProtectedRoute permission="canManagePatients"><CreatePatient /></ProtectedRoute>} />
        <Route path="/patients/:id/edit" element={<ProtectedRoute permission="canManagePatients"><EditPatient /></ProtectedRoute>} />

        <Route path="/consultations" element={<ProtectedRoute permission="canViewConsultations"><ConsultationList /></ProtectedRoute>} />
        <Route path="/consultations/create" element={<ProtectedRoute permission="canManageConsultations"><CreateConsultation /></ProtectedRoute>} />
        <Route path="/consultations/:id/edit" element={<ProtectedRoute permission="canManageConsultations"><EditConsultation /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
