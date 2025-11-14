import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Stack,
  Divider,
  Alert,
  IconButton,
} from '@mui/material'
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Save as SaveIcon,
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../supabaseClient'

function ProfilePage() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const [editing, setEditing] = useState(false)
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || user?.user_metadata?.name || '')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const handleUpdateProfile = async () => {
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const updates = {}
      
      if (fullName !== user?.user_metadata?.full_name) {
        updates.data = { full_name: fullName }
      }

      if (newPassword) {
        if (newPassword !== confirmPassword) {
          setError('Passwords do not match')
          setLoading(false)
          return
        }
        if (newPassword.length < 6) {
          setError('Password must be at least 6 characters')
          setLoading(false)
          return
        }
        updates.password = newPassword
      }

      const { error } = await supabase.auth.updateUser(updates)

      if (error) throw error

      setSuccess('Profile updated successfully!')
      setEditing(false)
      setNewPassword('')
      setConfirmPassword('')
      
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        // Note: Supabase doesn't have a direct delete user method from client
        // You would need to implement this via a backend function
        alert('Please contact support to delete your account.')
      } catch (err) {
        setError('Failed to delete account')
      }
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
      <Container maxWidth="md">
        <IconButton onClick={() => navigate('/app')} sx={{ mb: 2 }}>
          <ArrowBackIcon />
        </IconButton>

        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar
              src={user?.user_metadata?.avatar_url}
              sx={{
                width: 80,
                height: 80,
                mr: 3,
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                fontSize: '2rem',
                fontWeight: 700,
              }}
            >
              {fullName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" fontWeight={700}>
                {fullName || 'User'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
            </Box>
            {!editing && (
              <IconButton onClick={() => setEditing(true)} color="primary">
                <EditIcon />
              </IconButton>
            )}
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Alerts */}
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Profile Info */}
          <Stack spacing={3}>
            <TextField
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={!editing}
              fullWidth
            />

            <TextField
              label="Email"
              value={user?.email}
              disabled
              fullWidth
              helperText="Email cannot be changed"
            />

            {editing && (
              <>
                <Divider sx={{ my: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Change Password (Optional)
                  </Typography>
                </Divider>

                <TextField
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  fullWidth
                  helperText="Leave blank to keep current password"
                />

                <TextField
                  label="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  fullWidth
                  disabled={!newPassword}
                />
              </>
            )}

            {/* Action Buttons */}
            {editing ? (
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleUpdateProfile}
                  disabled={loading}
                  sx={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  }}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setEditing(false)
                    setFullName(user?.user_metadata?.full_name || '')
                    setNewPassword('')
                    setConfirmPassword('')
                    setError('')
                  }}
                >
                  Cancel
                </Button>
              </Stack>
            ) : (
              <Stack spacing={2}>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleDeleteAccount}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  Delete Account
                </Button>
              </Stack>
            )}
          </Stack>

          <Divider sx={{ my: 4 }} />

          {/* Account Info */}
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            Account Information
          </Typography>
          <Stack spacing={1}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                Account Created
              </Typography>
              <Typography variant="body2">
                {new Date(user?.created_at).toLocaleDateString()}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                Email Verified
              </Typography>
              <Typography variant="body2">
                {user?.email_confirmed_at ? 'Yes' : 'No'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                Sign-in Method
              </Typography>
              <Typography variant="body2">
                {user?.app_metadata?.provider || 'Email'}
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </Box>
  )
}

export default ProfilePage