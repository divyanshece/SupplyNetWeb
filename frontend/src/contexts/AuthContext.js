import React, { createContext, useState, useEffect, useContext } from 'react'
import { supabase } from '../supabaseClient'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check active sessions
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        // Customize error messages
        if (error.message.includes('already registered') || error.status === 400) {
          throw new Error('User already registered with this email')
        }
        throw error
      }

      return data
    } catch (error) {
      console.error('Signup error:', error)
      throw error
    }
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  }

  const signOut = async () => {
    try {
      // Save theme preference before clearing
      const themePreference = localStorage.getItem('themeMode')

      // Sign out from Supabase
      const { error } = await supabase.auth.signOut({ scope: 'local' })

      if (error) {
        console.error('Supabase signout error:', error)
      }

      // Clear all storage
      localStorage.clear()
      sessionStorage.clear()

      // Restore theme preference
      if (themePreference) {
        localStorage.setItem('themeMode', themePreference)
      }

      // Force set user to null
      setUser(null)

      return { success: true }
    } catch (error) {
      console.error('Error signing out:', error)

      // Save theme before force cleanup
      const themePreference = localStorage.getItem('themeMode')

      localStorage.clear()
      sessionStorage.clear()

      // Restore theme
      if (themePreference) {
        localStorage.setItem('themeMode', themePreference)
      }

      setUser(null)

      return { success: false, error }
    }
  }
  const resetPassword = async email => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) throw error
  }

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
