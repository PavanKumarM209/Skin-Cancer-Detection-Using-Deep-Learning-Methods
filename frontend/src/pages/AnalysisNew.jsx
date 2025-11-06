import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { Upload, Camera, User, MapPin, Calendar, X, Loader, CheckCircle, AlertCircle } from 'lucide-react'

export default function AnalysisNew() {
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState('upload')
  const [cameraActive, setCameraActive] = useState(false)
  const [stream, setStream] = useState(null)
  
  const fileInputRef = useRef(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  const [patientInfo, setPatientInfo] = useState({
    name: '',
    age: '',
    gender: '',
    location: '',
    email: ''
  })

  // GPS location state
  const [gpsLoading, setGpsLoading] = useState(false)
  const [detectedLocation, setDetectedLocation] = useState('')
  const [lastCoords, setLastCoords] = useState(null)
  const [rawReverse, setRawReverse] = useState(null)
  const [showGpsDebug, setShowGpsDebug] = useState(false)

  // Handle video stream setup
  useEffect(() => {
    if (stream && videoRef.current && !videoRef.current.srcObject) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [stream])

  const handleFileSelect = (file) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    setSelectedFile(file)
    setError(null)
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const startCamera = async () => {
    try {
      setError(null)
      // Request camera permission and get stream
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment' // Use back camera on mobile if available
        }
      })
      
      setStream(mediaStream)
      setCameraActive(true)
      
      // Set video source after a short delay to ensure video element is rendered
      setTimeout(() => {
        if (videoRef.current && mediaStream) {
          videoRef.current.srcObject = mediaStream
        }
      }, 100)
    } catch (err) {
      console.error('Camera error:', err)
      let errorMessage = 'Unable to access camera. '
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage += 'Please grant camera permissions in your browser settings.'
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage += 'No camera found on this device.'
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage += 'Camera is already in use by another application.'
      } else {
        errorMessage += err.message
      }
      
      setError(errorMessage)
      setCameraActive(false)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
      setCameraActive(false)
    }
  }

  const captureImage = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (video && canvas) {
      const ctx = canvas.getContext('2d')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      ctx.drawImage(video, 0, 0)
      canvas.toBlob((blob) => {
        // Generate unique filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
        const randomSuffix = Math.floor(Math.random() * 10000)
        const filename = `captured_${timestamp}_${randomSuffix}.jpg`
        const file = new File([blob], filename, { type: 'image/jpeg' })
        handleFileSelect(file)
        stopCamera()
      }, 'image/jpeg', 0.8)
    }
  }

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError('Please select an image first')
      return
    }

    const { name, age, gender } = patientInfo
    if (!name || !age || !gender) {
      setError('Please fill in all required fields (Name, Age, Gender)')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('image', selectedFile)
      formData.append('name', name)
      formData.append('age', age)
      formData.append('gender', gender)
      formData.append('location', patientInfo.location || '')
      formData.append('email', patientInfo.email || '')

      const response = await fetch('http://localhost:5001/analyze', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })

      const result = await response.json()

      if (!response.ok || result.error) {
        setError(result.error || 'Analysis failed')
        return
      }

      setSuccess(true)
      setTimeout(() => {
        navigate('/dashboard')
      }, 2000)
    } catch (err) {
      setError('Analysis failed: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // GPS location functions
  const useGPS = async () => {
    setGpsLoading(true)
    setDetectedLocation('')
    setError('') // Clear any existing errors
    
    try {
      // First try IP-based geolocation (works on HTTP)
      await useIPGeolocation()
    } catch (ipError) {
      // Fallback to GPS if IP geolocation fails
      if (!navigator.geolocation) {
        setError('Location services not available. Please enter location manually or use Test Location.')
        setGpsLoading(false)
        return
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude
          const lon = position.coords.longitude
          setLastCoords({ lat, lon, accuracy: position.coords.accuracy })

          try {
            // Reverse geocode using OpenStreetMap Nominatim
            const resp = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&addressdetails=1&accept-language=en`,
              { headers: { Accept: 'application/json' } }
            )
            const data = await resp.json()
            setRawReverse(data)
            const addr = data.address || {}

            // Prefer the most useful locality fields (city/town/village)
            const primaryLocality = addr.city || addr.town || addr.village || addr.municipality || addr.county || ''
            const smallLocality = addr.hamlet || addr.suburb || addr.neighbourhood || addr.road || ''
            const state = addr.state || addr.state_district || addr.region || ''
            const country = addr.country || ''

            // Build candidate parts
            const parts = []
            if (primaryLocality) parts.push(primaryLocality)
            if (state && state !== primaryLocality) parts.push(state)
            if (country) parts.push(country)

            let locText = parts.filter(Boolean).join(', ')

            // Heuristic: if primaryLocality is missing or is a small locality
            if ((!primaryLocality || smallLocality) && data.display_name) {
              const comps = data.display_name.split(',').map(s => s.trim()).filter(Boolean)
              if (comps.length >= 2) {
                const candidate = comps[1]
                if (candidate && candidate !== comps[0]) {
                  const candidateParts = [candidate]
                  if (comps.length >= 3) candidateParts.push(comps[2])
                  if (comps.length >= 4) candidateParts.push(comps[3])
                  locText = candidateParts.slice(0, 3).join(', ')
                }
              }
            }

            // Final fallback to display_name or lat/lon
            if (!locText && data.display_name) {
              locText = data.display_name.split(',').slice(0, 3).map(s => s.trim()).join(', ')
            }
            if (!locText) {
              locText = `${lat.toFixed(5)}, ${lon.toFixed(5)}`
            }

            setPatientInfo((p) => ({ ...p, location: locText }))
            setDetectedLocation(locText)
          } catch (err) {
            // fallback to lat,lon string
            const fallback = `${lat.toFixed(5)}, ${lon.toFixed(5)}`
            setPatientInfo((p) => ({ ...p, location: fallback }))
            setDetectedLocation(fallback)
          } finally {
            setGpsLoading(false)
          }
        },
        (err) => {
          setGpsLoading(false)
          let errorMessage = 'Unable to retrieve your location. '
          if (err.code === err.PERMISSION_DENIED) {
            errorMessage += 'Please enable location permissions and try again.'
          } else if (err.code === err.POSITION_UNAVAILABLE) {
            errorMessage += 'Location information is unavailable. You can still enter location manually.'
          } else if (err.code === err.TIMEOUT) {
            errorMessage += 'Location request timed out. Please try again or enter manually.'
          } else {
            errorMessage += 'Please try again or enter location manually.'
          }
          setError(errorMessage)
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      )
    }
  }

  // IP-based geolocation (works on HTTP)
  const useIPGeolocation = async () => {
    try {
      // Use ipapi.co for IP-based geolocation
      const response = await fetch('https://ipapi.co/json/')
      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.reason || 'IP geolocation failed')
      }
      
      // Build location string from IP data
      const parts = []
      if (data.city) parts.push(data.city)
      if (data.region) parts.push(data.region)
      if (data.country_name) parts.push(data.country_name)
      
      const locText = parts.filter(Boolean).join(', ')
      
      if (locText) {
        setPatientInfo((p) => ({ ...p, location: locText }))
        setDetectedLocation(locText)
        setGpsLoading(false)
        return
      } else {
        throw new Error('No location data available')
      }
    } catch (error) {
      // If IP geolocation fails, throw error to trigger GPS fallback
      throw error
    }
  }

  const clearDetected = () => {
    setDetectedLocation('')
    setPatientInfo((p) => ({ ...p, location: '' }))
  }


  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className={`flex-1 transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-64'}`}>
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-8 py-4">
            <h1 className="text-2xl font-bold text-gray-900">New Analysis</h1>
            <p className="text-sm text-gray-600 mt-1">Upload or capture skin lesion image for AI analysis</p>
          </div>
        </header>

        {/* Content */}
        <div className="p-8 overflow-y-auto h-[calc(100vh-88px)]">
          <div className="max-w-5xl mx-auto">
            {/* Alert Messages */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-red-900">Error</h4>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
                <button onClick={() => setError('')} className="text-red-600 hover:text-red-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {success && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-green-900">Success!</h4>
                  <p className="text-sm text-green-700">Analysis completed. Redirecting to dashboard...</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Patient Info & Image Upload */}
              <div className="space-y-6">
                {/* Patient Information */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Patient Information
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={patientInfo.name}
                        onChange={(e) => setPatientInfo({ ...patientInfo, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter patient name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={patientInfo.email}
                        onChange={(e) => setPatientInfo({ ...patientInfo, email: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter patient email (optional)"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Age *
                        </label>
                        <input
                          type="number"
                          value={patientInfo.age}
                          onChange={(e) => setPatientInfo({ ...patientInfo, age: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Age"
                          min="1"
                          max="120"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Gender *
                        </label>
                        <select
                          value={patientInfo.gender}
                          onChange={(e) => setPatientInfo({ ...patientInfo, gender: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location
                      </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={patientInfo.location}
                        onChange={(e) => setPatientInfo({ ...patientInfo, location: e.target.value })}
                        className="w-full pr-12 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="City, State or use GPS"
                      />
                      <button
                        type="button"
                        onClick={useGPS}
                        disabled={gpsLoading}
                        title="Use GPS to detect location"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 p-2 bg-white border border-gray-200 rounded-md text-blue-600 hover:bg-blue-50 disabled:opacity-60 disabled:cursor-not-allowed"
                        aria-label="Use GPS"
                      >
                        {gpsLoading ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <MapPin className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {/* Location buttons for development */}
                    <div className="mt-2 flex gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={useIPGeolocation}
                        className="px-3 py-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                        title="Use IP-based location (works on HTTP)"
                      >
                        🌐 IP Location
                      </button>
                      {detectedLocation && (
                        <button
                          type="button"
                          onClick={clearDetected}
                          className="px-3 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                        >
                          🗑️ Clear
                        </button>
                      )}
                    </div>
                      {detectedLocation && (
                        <p className="text-green-600 text-sm mt-2">
                          Location detected: {detectedLocation}
                          <button onClick={clearDetected} className="ml-2 text-blue-600 underline text-xs">
                            Clear
                          </button>
                        </p>
                      )}
                      <small className="text-gray-500 block mt-1">Click GPS button to auto-detect location</small>
                    </div>
                  </div>
                </div>

                {/* Image Upload */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Image Upload</h2>
                  
                  {/* Tabs */}
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => { setActiveTab('upload'); stopCamera(); }}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                        activeTab === 'upload'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Upload className="w-4 h-4 inline mr-2" />
                      Upload
                    </button>
                    <button
                      onClick={() => setActiveTab('camera')}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                        activeTab === 'camera'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Camera className="w-4 h-4 inline mr-2" />
                      Camera
                    </button>
                  </div>

                  {/* Upload Tab */}
                  {activeTab === 'upload' && (
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
                    >
                      <Upload className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                      <p className="text-gray-700 font-medium mb-1">
                        Drop your image here or click to browse
                      </p>
                      <p className="text-sm text-gray-500">
                        Supports: JPG, JPEG, PNG (Max 16MB)
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                        className="hidden"
                      />
                    </div>
                  )}

                  {/* Camera Tab */}
                  {activeTab === 'camera' && (
                    <div className="text-center">
                      {!cameraActive ? (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                          <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <button
                            onClick={startCamera}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Start Camera
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div className="relative bg-black rounded-lg overflow-hidden mb-4">
                            <video
                              ref={videoRef}
                              autoPlay
                              playsInline
                              muted
                              className="w-full h-auto rounded-lg"
                              style={{ maxHeight: '400px', objectFit: 'contain' }}
                            />
                          </div>
                          <canvas ref={canvasRef} className="hidden" />
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={captureImage}
                              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                            >
                              <Camera className="w-5 h-5" />
                              Capture
                            </button>
                            <button
                              onClick={stopCamera}
                              className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                              <X className="w-5 h-5" />
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Preview & Analysis */}
              <div className="space-y-6">
                {/* Preview */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Preview</h2>
                  {preview ? (
                    <div className="relative">
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-full rounded-lg shadow-md"
                      />
                      <button
                        onClick={() => { setPreview(null); setSelectedFile(null); }}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <Upload className="w-12 h-12 mx-auto mb-2" />
                        <p>No image selected</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Analysis Button */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <button
                    onClick={handleAnalyze}
                    disabled={loading || !selectedFile}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Analyze Image
                      </>
                    )}
                  </button>
                  <p className="text-xs text-gray-500 text-center mt-3">
                    Analysis typically takes 3-10 seconds
                  </p>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">📋 Guidelines</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Ensure good lighting conditions</li>
                    <li>• Keep camera steady and focused</li>
                    <li>• Capture clear view of the lesion</li>
                    <li>• Avoid shadows and glare</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

