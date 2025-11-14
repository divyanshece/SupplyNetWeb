import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  Box,
  TextField,
  Button,
  Typography,
  Stack,
  Link,
  Divider,
  Alert,
  IconButton,
  Tabs,
  Tab,
} from '@mui/material'
import { Close as CloseIcon } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../supabaseClient'
import { Google as GoogleIcon } from '@mui/icons-material'

function LoginModal({ open, onClose, defaultTab = 'signin' }) {
  const navigate = useNavigate()
  const { signIn, signUp } = useAuth()
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [currentTab, setCurrentTab] = useState(defaultTab)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const isValidEmail = email => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleGoogleSignIn = async () => {
    try {
      const redirectPath = localStorage.getItem('redirectAfterLogin') || '/app'

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}${redirectPath}`,
        },
      })

      if (error) throw error
    } catch (err) {
      setError(err.message || 'Failed to sign in with Google')
    }
  }

  const handleForgotPassword = async e => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error

      setSuccess('Password reset link sent! Check your email (including spam folder).')
      setResetEmail('')

      setTimeout(() => {
        setShowForgotPassword(false)
        setSuccess('')
      }, 4000)
    } catch (err) {
      setError(err.message || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue)
    setError('')
    setSuccess('')
  }

  const handleSignIn = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signIn(email, password)

      // Get redirect path
      const redirectPath = localStorage.getItem('redirectAfterLogin') || '/app'
      localStorage.removeItem('redirectAfterLogin')

      onClose()
      navigate(redirectPath)
    } catch (err) {
      setError(err.message || 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async e => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      // Pass name to signUp function
      await signUp(email, password, fullName)

      setSuccess('Account created! Please check your email to verify your account.')
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      setFullName('') // ← Clear name

      setTimeout(() => {
        setCurrentTab('signin')
        setSuccess('')
      }, 2000)
    } catch (err) {
      if (err.message === 'User already registered') {
        setError('This email is already registered. Please sign in instead.')
        setTimeout(() => {
          setCurrentTab('signin')
          setError('')
          setEmail(email)
        }, 2500)
      } else {
        setError(err.message || 'Failed to sign up. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: 'blur(8px)',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      }}
      PaperProps={{
        sx: {
          borderRadius: 3,
          bgcolor: 'background.paper',
        },
      }}
    >
      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 16,
          top: 16,
          color: 'text.secondary',
          '&:hover': {
            bgcolor: 'action.hover',
            transform: 'rotate(90deg)',
          },
          transition: 'all 0.3s ease',
        }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent sx={{ p: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            mb: 0.5,
            textAlign: 'center',
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          SupplyNet Web
        </Typography>
        <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary', mb: 3 }}>
          {currentTab === 'signin' ? 'Sign in to your account' : 'Create a new account'}
        </Typography>

        <Tabs value={currentTab} onChange={handleTabChange} variant="fullWidth" sx={{ mb: 3 }}>
          <Tab label="Sign In" value="signin" />
          <Tab label="Sign Up" value="signup" />
        </Tabs>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {currentTab === 'signin' ? (
          <form onSubmit={handleSignIn}>
            <Stack spacing={2.5}>
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                fullWidth
                required
                autoFocus
              />

              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                fullWidth
                required
              />

              <Button
                variant="outlined"
                fullWidth
                onClick={handleGoogleSignIn}
                startIcon={<GoogleIcon />}
                sx={{
                  py: 1.5,
                  fontWeight: 600,
                  textTransform: 'none',
                  borderColor: '#4285f4',
                  color: '#4285f4',
                  '&:hover': {
                    borderColor: '#357ae8',
                    bgcolor: 'rgba(66, 133, 244, 0.04)',
                  },
                }}
              >
                Continue with Google
              </Button>

              <Divider sx={{ my: 2 }}>OR</Divider>

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                sx={{
                  py: 1.5,
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '1rem',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>

              <Link
                href="#"
                onClick={e => {
                  e.preventDefault()
                  setShowForgotPassword(true)
                }}
                sx={{
                  textAlign: 'center',
                  fontSize: '0.875rem',
                  color: 'primary.main',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Forgot password?
              </Link>
            </Stack>
          </form>
        ) : (
          <form onSubmit={handleSignUp}>
            <Stack spacing={2.5}>
              <TextField
                label="Full Name"
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                fullWidth
                required
                autoFocus
              />

              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                fullWidth
                required
                autoFocus
              />

              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                fullWidth
                required
                helperText="At least 6 characters"
              />

              <TextField
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                fullWidth
                required
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                sx={{
                  py: 1.5,
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '1rem',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                }}
              >
                {loading ? 'Creating account...' : 'Sign Up'}
              </Button>
            </Stack>
          </form>
        )}
        {showForgotPassword && (
          <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Reset Password
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Enter your email address and we'll send you a link to reset your password.
            </Typography>

            <form onSubmit={handleForgotPassword}>
              <Stack spacing={2}>
                <TextField
                  label="Email"
                  type="email"
                  value={resetEmail}
                  onChange={e => setResetEmail(e.target.value)}
                  fullWidth
                  required
                  autoFocus
                />

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    fontWeight: 600,
                    textTransform: 'none',
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  }}
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Button>

                <Button
                  variant="text"
                  fullWidth
                  onClick={() => setShowForgotPassword(false)}
                  sx={{ textTransform: 'none' }}
                >
                  Back to Sign In
                </Button>
              </Stack>
            </form>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default LoginModal
