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

function LoginModal({ open, onClose, defaultTab = 'signin' }) {
  const navigate = useNavigate()
  const { signIn, signUp } = useAuth()

  const [currentTab, setCurrentTab] = useState(defaultTab)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const isValidEmail = email => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
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

    // Validate email format
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }

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
      await signUp(email, password)
      setSuccess('Account created! Please check your email to verify your account.')
      setEmail('')
      setPassword('')
      setConfirmPassword('')

      // Switch to sign in tab after 2 seconds
      setTimeout(() => {
        setCurrentTab('signin')
        setSuccess('')
      }, 2000)
    } catch (err) {
      // Handle specific error messages
      let errorMessage = 'Failed to sign up'

      if (err.message) {
        const msg = err.message.toLowerCase()

        if (
          msg.includes('already registered') ||
          msg.includes('already exists') ||
          msg.includes('user already registered')
        ) {
          errorMessage = 'This email is already registered. Please sign in instead.'
          // Auto-switch to sign in tab after 2 seconds
          setTimeout(() => {
            setCurrentTab('signin')
            setError('')
          }, 2500)
        } else if (msg.includes('invalid email')) {
          errorMessage = 'Please enter a valid email address'
        } else if (msg.includes('weak password') || msg.includes('password')) {
          errorMessage =
            'Password is too weak. Use at least 6 characters with a mix of letters and numbers.'
        } else {
          errorMessage = err.message
        }
      }

      setError(errorMessage)
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
                  // Add forgot password logic
                }}
                sx={{
                  textAlign: 'center',
                  fontSize: '0.875rem',
                  color: 'primary.main',
                  textDecoration: 'none',
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
      </DialogContent>
    </Dialog>
  )
}

export default LoginModal
