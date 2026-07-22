import { createContext, useContext, useState, useEffect, useCallback, useRef, startTransition } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const NotificationContext = createContext(null)

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3003'

let globalSocket = null

export function NotificationProvider({ children }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [socket, setSocket] = useState(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const hospitalRef = useRef(null)

  useEffect(() => {
    if (!user?.hospitalUser) {
      if (globalSocket) {
        globalSocket.disconnect()
        globalSocket = null
        setSocket(null)
      }
      return
    }

    hospitalRef.current = user.hospitalUser

    if (!globalSocket) {
      globalSocket = io(SOCKET_URL, { transports: ['websocket', 'polling'] })
    }

    const s = globalSocket

    const onConnect = () => {
      s.emit('join:notifications', hospitalRef.current)
    }

    const onExamen = (data) => {
      const notif = {
        id: Date.now(),
        type: 'examen',
        title: 'Nouvel examen à réaliser',
        message: `${data.type} — Consultation #${data.consultationId}`,
        data,
        read: false,
        createdAt: new Date().toISOString(),
      }
      startTransition(() => {
        setNotifications((prev) => [notif, ...prev])
        setUnreadCount((prev) => prev + 1)
      })
    }

    s.on('connect', onConnect)
    s.on('examen:new', onExamen)

    if (s.connected) {
      s.emit('join:notifications', user.hospitalUser)
    }

    setSocket(s)

    return () => {
      s.off('connect', onConnect)
      s.off('examen:new', onExamen)
    }
  }, [user?.hospitalUser])

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
  }, [])

  const clearNotifications = useCallback(() => {
    setNotifications([])
    setUnreadCount(0)
  }, [])

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAllRead, clearNotifications, socket }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) throw new Error('useNotifications must be used within NotificationProvider')
  return context
}
