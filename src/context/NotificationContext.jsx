import { createContext, useContext, useState, useEffect, useCallback, useRef, startTransition } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'
import { notificationsAPI } from '../api/consultationApi'

const NotificationContext = createContext(null)

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3003'

let globalSocket = null

export function NotificationProvider({ children }) {
  const { user, token } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [socket, setSocket] = useState(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const hospitalRef = useRef(null)
  const userIdRef = useRef(null)

  useEffect(() => {
    if (!user || !token) {
      setNotifications([])
      setUnreadCount(0)
      if (globalSocket) {
        globalSocket.disconnect()
        globalSocket = null
        setSocket(null)
      }
      return
    }

    hospitalRef.current = user.hospitalUser || null
    userIdRef.current = user?._id || user?.id || null

    if (!globalSocket) {
      globalSocket = io(SOCKET_URL, { transports: ['websocket', 'polling'] })
    }

    const s = globalSocket

    const onConnect = () => {
      if (hospitalRef.current) {
        s.emit('join:notifications', hospitalRef.current)
      }
      if (userIdRef.current) {
        s.emit('join:user', userIdRef.current)
      }
    }

    const onNotification = (notification) => {
      startTransition(() => {
        setNotifications((prev) => {
          if (prev.some((n) => n.id === notification.id)) return prev
          return [notification, ...prev]
        })
        setUnreadCount((prev) => prev + 1)
      })
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
        setNotifications((prev) => {
          if (prev.some((n) => n.type === 'examen' && n.data?.consultationId === data.consultationId)) return prev
          return [notif, ...prev]
        })
        setUnreadCount((prev) => prev + 1)
      })
    }

    s.on('connect', onConnect)
    s.on('notification:new', onNotification)
    s.on('examen:new', onExamen)

    if (s.connected) {
      onConnect()
    }

    setSocket(s)

    return () => {
      s.off('connect', onConnect)
      s.off('notification:new', onNotification)
      s.off('examen:new', onExamen)
    }
  }, [user?._id, user?.id, user?.hospitalUser, token])

  useEffect(() => {
    if (!token) return
    let cancelled = false

    async function loadNotifications() {
      try {
        const [notifsRes, countRes] = await Promise.all([
          notificationsAPI.getAll({ limit: 50 }),
          notificationsAPI.getUnreadCount(),
        ])
        if (cancelled) return
        const notifs = notifsRes.data?.data || []
        const count = countRes.data?.data?.count || 0
        startTransition(() => {
          setNotifications((prev) => {
            const existingIds = new Set(prev.map((n) => n.id))
            const newNotifs = notifs.filter((n) => !existingIds.has(n.id))
            const merged = [...prev, ...newNotifs]
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            return merged.slice(0, 100)
          })
          setUnreadCount(count)
        })
      } catch (err) {
        console.log('Erreur chargement notifications:', err.message)
      }
    }

    loadNotifications()
    return () => { cancelled = true }
  }, [token])

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
    try {
      await notificationsAPI.markAllRead()
    } catch {}
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
