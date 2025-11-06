import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { Settings as SettingsIcon, User, Bell, Lock, Database, Palette, Info, LogOut, Heart, History } from 'lucide-react'

export default function Settings() {
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  
  // Determine if this is a patient settings page
  const isPatientSettings = location.pathname === '/patient-settings'
  const [activeTab, setActiveTab] = useState('profile')
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  })
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    role: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')
  const [density, setDensity] = useState(() => localStorage.getItem('density') || 'comfortable')

  // Utility function to show temporary notifications
  const showTemporaryMessage = useCallback((type, message) => {
    if (type === 'error') {
      setError(message)
      setTimeout(() => setError(''), 3000)
    } else {
      setSuccess(message)
      setTimeout(() => setSuccess(''), 3000)
    }
  }, [])

  useEffect(() => {
    // Check authentication for patient settings
    if (isPatientSettings) {
      const patientData = localStorage.getItem('patient')
      if (!patientData) {
        navigate('/patient-login')
        return
      }
    }

    // Fetch user profile when component mounts
    fetchProfile()

    // Apply initial theme and density
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else if (theme === 'auto') {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark')
      }
    }
    document.body.className = `density-${density}`

    // Listen for system theme changes if auto theme is selected
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleThemeChange = (e) => {
      if (theme === 'auto') {
        if (e.matches) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      }
    }
    mediaQuery.addEventListener('change', handleThemeChange)
    return () => mediaQuery.removeEventListener('change', handleThemeChange)
  }, [isPatientSettings, navigate])

  const fetchProfile = async () => {
    try {
      // Use different API endpoint based on user type
      const endpoint = isPatientSettings 
        ? 'http://localhost:5001/api/patient/profile' 
        : 'http://localhost:5001/api/user/profile'
        
      const response = await fetch(endpoint, {
        credentials: 'include'
      })
      const data = await response.json()
      
      if (response.ok) {
        setProfileData(data.profile || data)
      } else {
        setError(data.error || 'Failed to load profile')
      }
    } catch (err) {
      setError('Failed to connect to server')
    }
  }

  const tabs = isPatientSettings ? [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'data', label: 'Data & Privacy', icon: Database },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'about', label: 'About', icon: Info },
  ] : [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'data', label: 'Data & Privacy', icon: Database },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'about', label: 'About', icon: Info },
  ]

  const handleLogout = async () => {
    try {
      const endpoint = isPatientSettings 
        ? 'http://localhost:5001/api/patient/logout'
        : 'http://localhost:5001/api/logout'
        
      await fetch(endpoint, {
        method: 'POST',
        credentials: 'include'
      })
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      localStorage.removeItem(isPatientSettings ? 'patient' : 'user')
      localStorage.removeItem('userType')
      navigate(isPatientSettings ? '/patient-login' : '/login')
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      {isPatientSettings ? (
        <div className="w-64 bg-blue-900 text-white flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-blue-800">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold">SkinCare AI</h1>
                <p className="text-xs text-blue-200">Detection System</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              <div 
                onClick={() => navigate('/patient-dashboard')}
                className="flex items-center px-3 py-2 text-blue-200 hover:bg-blue-800 rounded-lg cursor-pointer"
              >
                <History className="w-5 h-5 mr-3" />
                <span>History</span>
              </div>
            </div>
          </nav>

          {/* Bottom Navigation */}
          <div className="p-4 border-t border-blue-800">
            <div className="space-y-2">
              <div className="flex items-center px-3 py-2 bg-blue-800 rounded-lg">
                <Settings className="w-5 h-5 mr-3" />
                <span>Settings</span>
                <div className="w-2 h-2 bg-blue-300 rounded-full ml-auto"></div>
              </div>
              <div 
                onClick={handleLogout}
                className="flex items-center px-3 py-2 text-blue-200 hover:bg-blue-800 rounded-lg cursor-pointer"
              >
                <LogOut className="w-5 h-5 mr-3" />
                <span>Logout</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      )}

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${!isPatientSettings && (collapsed ? 'ml-20' : 'ml-64')}`}>
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <SettingsIcon className="w-7 h-7 text-blue-600" />
                  Settings
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Manage your account and application preferences
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8 overflow-y-auto h-[calc(100vh-88px)]">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Sidebar Tabs */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-md p-4">
                  <nav className="space-y-1">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          activeTab === tab.id
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <tab.icon className="w-5 h-5" />
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </nav>
                </div>
              </div>

              {/* Content Area */}
              <div className="lg:col-span-3">
                <div className="bg-white rounded-xl shadow-md p-6">
                  {activeTab === 'profile' && (
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Settings</h2>
                      <div className="space-y-6">
                        {error && (
                          <div className="p-4 mb-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                            {error}
                          </div>
                        )}
                        {success && (
                          <div className="p-4 mb-4 bg-green-50 border-l-4 border-green-500 text-green-700">
                            {success}
                          </div>
                        )}
                        <form onSubmit={async (e) => {
                          e.preventDefault()
                          setError('')
                          setSuccess('')
                          setLoading(true)
                          
                          try {
                            const response = await fetch('http://localhost:5001/api/user/profile', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify(profileData),
                              credentials: 'include',
                            })
                            
                            const data = await response.json()
                            
                            if (response.ok) {
                              showTemporaryMessage('success', 'Profile updated successfully')
                              setProfileData(data.profile)
                            } else {
                              showTemporaryMessage('error', data.error || 'Failed to update profile')
                            }
                          } catch (err) {
                            setError('Failed to connect to server')
                          } finally {
                            setLoading(false)
                          }
                        }}>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Full Name
                            </label>
                            <input
                              type="text"
                              value={profileData.name}
                              onChange={(e) => setProfileData(prev => ({
                                ...prev,
                                name: e.target.value
                              }))}
                              placeholder="Enter your name"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              required
                            />
                          </div>
                          <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Email Address
                            </label>
                            <input
                              type="email"
                              value={profileData.email}
                              placeholder="your.email@example.com"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                              disabled
                            />
                            <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
                          </div>
                          <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Role
                            </label>
                            <select
                              value={profileData.role}
                              onChange={(e) => setProfileData(prev => ({
                                ...prev,
                                role: e.target.value
                              }))}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="patient">Patient</option>
                              <option value="doctor">Doctor</option>
                              <option value="nurse">Nurse</option>
                              <option value="administrator">Administrator</option>
                              <option value="technician">Technician</option>
                            </select>
                          </div>
                          {profileData.role !== 'patient' && (
                            <div className="mt-4">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Medical License Number
                              </label>
                              <input
                                type="text"
                                placeholder="License number"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                          )}
                          <div className="mt-6">
                            <button
                              type="submit"
                              disabled={loading}
                              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full"
                            >
                              {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}

                  {activeTab === 'notifications' && (
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-6">Notification Settings</h2>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <h3 className="font-medium text-gray-900">High Risk Alerts</h3>
                            <p className="text-sm text-gray-600">Get notified about melanoma cases</p>
                          </div>
                          <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <h3 className="font-medium text-gray-900">Analysis Complete</h3>
                            <p className="text-sm text-gray-600">Notify when analysis is done</p>
                          </div>
                          <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <h3 className="font-medium text-gray-900">Daily Summary</h3>
                            <p className="text-sm text-gray-600">Receive daily analysis summary</p>
                          </div>
                          <input type="checkbox" className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <h3 className="font-medium text-gray-900">System Updates</h3>
                            <p className="text-sm text-gray-600">Updates about new features</p>
                          </div>
                          <input type="checkbox" className="w-5 h-5 text-blue-600" />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'security' && (
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-6">Security Settings</h2>
                      <div className="space-y-6">
                        {error && (
                          <div className="p-4 mb-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                            {error}
                          </div>
                        )}
                        {success && (
                          <div className="p-4 mb-4 bg-green-50 border-l-4 border-green-500 text-green-700">
                            {success}
                          </div>
                        )}
                        <form onSubmit={async (e) => {
                          e.preventDefault()
                          setError('')
                          setSuccess('')
                          setLoading(true)
                          
                          try {
                            const response = await fetch('http://localhost:5001/api/user/change-password', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify(passwordData),
                              credentials: 'include',
                            })
                            
                            const data = await response.json()
                            
                            if (response.ok) {
                              showTemporaryMessage('success', 'Password updated successfully')
                              setPasswordData({
                                current_password: '',
                                new_password: '',
                                confirm_password: ''
                              })
                            } else {
                              showTemporaryMessage('error', data.error || 'Failed to update password')
                            }
                          } catch (err) {
                            setError('Failed to connect to server')
                          } finally {
                            setLoading(false)
                          }
                        }}>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Current Password
                            </label>
                            <input
                              type="password"
                              placeholder="Enter current password"
                              value={passwordData.current_password}
                              onChange={(e) => setPasswordData(prev => ({
                                ...prev,
                                current_password: e.target.value
                              }))}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              required
                            />
                          </div>
                          <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              New Password
                            </label>
                            <input
                              type="password"
                              placeholder="Enter new password"
                              value={passwordData.new_password}
                              onChange={(e) => setPasswordData(prev => ({
                                ...prev,
                                new_password: e.target.value
                              }))}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              required
                              minLength={8}
                            />
                          </div>
                          <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Confirm New Password
                            </label>
                            <input
                              type="password"
                              placeholder="Confirm new password"
                              value={passwordData.confirm_password}
                              onChange={(e) => setPasswordData(prev => ({
                                ...prev,
                                confirm_password: e.target.value
                              }))}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              required
                            />
                          </div>
                          <div className="mt-6">
                            <button
                              type="submit"
                              disabled={loading}
                              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full"
                            >
                              {loading ? 'Updating...' : 'Update Password'}
                            </button>
                          </div>
                        </form>
                        <div className="pt-4 border-t">
                          <h3 className="font-medium text-gray-900 mb-4">Two-Factor Authentication</h3>
                          <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                            Enable 2FA
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'data' && (
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-6">Data & Privacy</h2>
                      <div className="space-y-6">
                        {error && (
                          <div className="p-4 mb-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                            {error}
                          </div>
                        )}
                        {success && (
                          <div className="p-4 mb-4 bg-green-50 border-l-4 border-green-500 text-green-700">
                            {success}
                          </div>
                        )}
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <h3 className="font-medium text-blue-900 mb-2">Data Storage</h3>
                          <p className="text-sm text-blue-800">
                            All patient data is encrypted and stored securely on HIPAA-compliant servers.
                          </p>
                        </div>
                        <div className="space-y-4">
                          <h3 className="font-medium text-gray-900">Export Options</h3>
                          <button 
                            onClick={async () => {
                              try {
                                // Get patient data for patient settings
                                const patientData = localStorage.getItem('patient')
                                const patientEmail = patientData ? JSON.parse(patientData).email : null
                                
                                let url = 'http://localhost:5001/api/history/export'
                                if (patientEmail) {
                                  url += `?patient_email=${encodeURIComponent(patientEmail)}`
                                }
                                
                                const response = await fetch(url, {
                                  credentials: 'include'
                                });
                                
                                if (response.ok) {
                                  // Get filename from Content-Disposition header if available
                                  const filename = response.headers.get('Content-Disposition')?.split('filename=')[1] || 'patient_history.csv';
                                  
                                  // Create blob from response
                                  const blob = await response.blob();
                                  
                                  // Create download link
                                  const url = window.URL.createObjectURL(blob);
                                  const a = document.createElement('a');
                                  a.href = url;
                                  a.download = filename.replace(/['"]/g, '');
                                  document.body.appendChild(a);
                                  a.click();
                                  
                                  // Cleanup
                                  window.URL.revokeObjectURL(url);
                                  document.body.removeChild(a);
                                  
                                  showTemporaryMessage('success', 'Data exported successfully');
                                } else {
                                  const error = await response.json();
                                  throw new Error(error.error || 'Export failed');
                                }
                              } catch (err) {
                                showTemporaryMessage('error', 'Failed to export data: ' + err.message);
                              }
                            }}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left mb-3"
                          >
                            <div className="font-medium text-gray-900">Export All Data</div>
                            <div className="text-sm text-gray-600">Download all your analysis records as CSV</div>
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                // Get patient data for patient settings
                                const patientData = localStorage.getItem('patient')
                                const patientEmail = patientData ? JSON.parse(patientData).email : null
                                
                                let url = 'http://localhost:5001/api/history/stats'
                                if (patientEmail) {
                                  url += `?patient_email=${encodeURIComponent(patientEmail)}`
                                }
                                
                                const response = await fetch(url, {
                                  credentials: 'include'
                                });
                                
                                if (response.ok) {
                                  const data = await response.json();
                                  const blob = new Blob([JSON.stringify(data.stats, null, 2)], { type: 'application/json' });
                                  const url = window.URL.createObjectURL(blob);
                                  const a = document.createElement('a');
                                  a.href = url;
                                  a.download = 'patient_statistics.json';
                                  document.body.appendChild(a);
                                  a.click();
                                  
                                  // Cleanup
                                  window.URL.revokeObjectURL(url);
                                  document.body.removeChild(a);
                                  
                                  showTemporaryMessage('success', 'Statistics exported successfully');
                                } else {
                                  const error = await response.json();
                                  throw new Error(error.error || 'Export failed');
                                }
                              } catch (err) {
                                showTemporaryMessage('error', 'Failed to export statistics: ' + err.message);
                              }
                            }}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
                          >
                            <div className="font-medium text-gray-900">Export Statistics</div>
                            <div className="text-sm text-gray-600">Download analysis statistics and summary</div>
                          </button>
                        </div>
                        <div className="pt-4 border-t">
                          <h3 className="font-medium text-red-900 mb-2">Danger Zone</h3>
                          <button className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                            Delete All Data
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'appearance' && (
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-6">Appearance</h2>
                      <div className="space-y-6">
                        {error && (
                          <div className="p-4 mb-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                            {error}
                          </div>
                        )}
                        {success && (
                          <div className="p-4 mb-4 bg-green-50 border-l-4 border-green-500 text-green-700">
                            {success}
                          </div>
                        )}
                        <div>
                          <h3 className="font-medium text-gray-900 mb-4">Theme</h3>
                          <div className="grid grid-cols-3 gap-4">
                            <button 
                              onClick={() => {
                                setTheme('light')
                                localStorage.setItem('theme', 'light')
                                document.documentElement.classList.remove('dark')
                                showTemporaryMessage('success', 'Theme updated to Light')
                              }}
                              className={`p-4 border-2 rounded-lg bg-white transition-all ${
                                theme === 'light' ? 'border-blue-600' : 'border-gray-300'
                              }`}
                            >
                              <div className="w-full h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded mb-2"></div>
                              <div className="text-sm font-medium">Light {theme === 'light' && '(Current)'}</div>
                            </button>
                            <button 
                              onClick={() => {
                                setTheme('dark')
                                localStorage.setItem('theme', 'dark')
                                document.documentElement.classList.add('dark')
                                showTemporaryMessage('success', 'Theme updated to Dark')
                              }}
                              className={`p-4 border-2 rounded-lg bg-white transition-all ${
                                theme === 'dark' ? 'border-blue-600' : 'border-gray-300'
                              }`}
                            >
                              <div className="w-full h-20 bg-gradient-to-br from-gray-800 to-gray-900 rounded mb-2"></div>
                              <div className="text-sm font-medium">Dark {theme === 'dark' && '(Current)'}</div>
                            </button>
                            <button 
                              onClick={() => {
                                setTheme('auto')
                                localStorage.setItem('theme', 'auto')
                                if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                                  document.documentElement.classList.add('dark')
                                } else {
                                  document.documentElement.classList.remove('dark')
                                }
                                showTemporaryMessage('success', 'Theme set to Auto')
                              }}
                              className={`p-4 border-2 rounded-lg bg-white transition-all ${
                                theme === 'auto' ? 'border-blue-600' : 'border-gray-300'
                              }`}
                            >
                              <div className="w-full h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded mb-2"></div>
                              <div className="text-sm font-medium">Auto {theme === 'auto' && '(Current)'}</div>
                            </button>
                          </div>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 mb-4">Display Density</h3>
                          <select 
                            value={density}
                            onChange={(e) => {
                              setDensity(e.target.value)
                              localStorage.setItem('density', e.target.value)
                              document.body.className = `density-${e.target.value}`
                              showTemporaryMessage('success', `Display density updated to ${e.target.value}`)
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="comfortable">Comfortable</option>
                            <option value="compact">Compact</option>
                            <option value="spacious">Spacious</option>
                          </select>
                          <p className="text-sm text-gray-500 mt-2">
                            {density === 'comfortable' && 'Default spacing for most users'}
                            {density === 'compact' && 'Reduced spacing to show more content'}
                            {density === 'spacious' && 'Extra spacing for better readability'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'about' && (
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-6">About</h2>
                      <div className="space-y-6">
                        <div className="text-center py-6">
                          <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <SettingsIcon className="w-10 h-10 text-white" />
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">SkinCare AI</h3>
                          <p className="text-gray-600 mb-1">Version 2.0.0</p>
                          <p className="text-sm text-gray-500">Detection System</p>
                        </div>
                        <div className="border-t pt-6 space-y-3">
                          <div className="flex justify-between py-2">
                            <span className="text-gray-600">Release Date</span>
                            <span className="font-medium">October 2025</span>
                          </div>
                          <div className="flex justify-between py-2">
                            <span className="text-gray-600">AI Model Version</span>
                            <span className="font-medium">XGBoost Ensemble v3.2</span>
                          </div>
                          <div className="flex justify-between py-2">
                            <span className="text-gray-600">Database</span>
                            <span className="font-medium">SQLite</span>
                          </div>
                          <div className="flex justify-between py-2">
                            <span className="text-gray-600">License</span>
                            <span className="font-medium">Medical Use Only</span>
                          </div>
                        </div>
                        <div className="pt-4 border-t">
                          <button className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                            Check for Updates
                          </button>
                        </div>
                        <div className="text-center text-sm text-gray-500">
                          <p>© 2025 SkinCare AI. All rights reserved.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

