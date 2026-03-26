import React, { useState, useEffect } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LogOut, User, Shield, CheckCircle2, XCircle, Clock, QrCode, Bot, Upload, Info, Home } from 'lucide-react';

import Footer from '../components/Footer';
import SEO from '../components/SEO';

export default function Profile() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotPasswordMode, setForgotPasswordMode] = useState<'none' | 'request' | 'reset'>('none');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [logoSize, setLogoSize] = useState(() => localStorage.getItem('logoSize') || '14');

  // Robot Form State
  const [robotHeight, setRobotHeight] = useState('');
  const [robotWeight, setRobotWeight] = useState('');
  const [robotMaterials, setRobotMaterials] = useState('');
  const [robotDimensions, setRobotDimensions] = useState('');
  const [robotPowerSource, setRobotPowerSource] = useState('');
  const [robotWeapons, setRobotWeapons] = useState('');
  const [robotAdditionalInfo, setRobotAdditionalInfo] = useState('');
  const [robotImage, setRobotImage] = useState<File | null>(null);
  const [robotPreview, setRobotPreview] = useState<string | null>(null);
  const [submittingRobot, setSubmittingRobot] = useState(false);
  const [robotMessage, setRobotMessage] = useState('');

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.logoSize) {
          setLogoSize(data.logoSize);
          localStorage.setItem('logoSize', data.logoSize);
        }
      })
      .catch(console.error);

    // Check for saved user session
    const savedUserId = localStorage.getItem('botbash_user_id');
    if (savedUserId && !user) {
      setLoading(true);
      fetch(`/api/user/${savedUserId}`)
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            setUser(data.user);
          } else {
            localStorage.removeItem('botbash_user_id');
          }
        })
        .catch(() => localStorage.removeItem('botbash_user_id'))
        .finally(() => setLoading(false));
    }

    if (user) {
      setRobotHeight(user.robotHeight || '');
      setRobotWeight(user.robotWeight || '');
      setRobotMaterials(user.robotMaterials || '');
      setRobotDimensions(user.robotDimensions || '');
      setRobotPowerSource(user.robotPowerSource || '');
      setRobotWeapons(user.robotWeapons || '');
      setRobotAdditionalInfo(user.robotAdditionalInfo || '');
      setRobotPreview(user.robotImage || null);
    }
  }, [user]);

  // Auto-hide header logic
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious();
    if (previous && latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        localStorage.setItem('botbash_user_id', data.user._id);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setEmail('');
    setPassword('');
    setForgotPasswordMode('none');
    setResetCode('');
    setNewPassword('');
    setResetMessage('');
    localStorage.removeItem('botbash_user_id');
  };

  const handleForgotPasswordRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) {
        setForgotPasswordMode('reset');
        setResetMessage('Verification code sent to your email.');
      } else {
        setError(data.error || 'Failed to send reset code');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: resetCode, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setForgotPasswordMode('none');
        setResetMessage('Password reset successful! You can now login.');
        setResetCode('');
        setNewPassword('');
      } else {
        setError(data.error || 'Failed to reset password');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleRobotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingRobot(true);
    setRobotMessage('');
    try {
      const formData = new FormData();
      formData.append('userId', user._id);
      formData.append('robotHeight', robotHeight);
      formData.append('robotWeight', robotWeight);
      formData.append('robotMaterials', robotMaterials);
      formData.append('robotDimensions', robotDimensions);
      formData.append('robotPowerSource', robotPowerSource);
      formData.append('robotWeapons', robotWeapons);
      formData.append('robotAdditionalInfo', robotAdditionalInfo);
      if (robotImage) {
        formData.append('image', robotImage);
      }

      const res = await fetch('/api/profile/robot', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setRobotMessage('Robot details updated successfully! Pending admin approval.');
      } else {
        setRobotMessage(data.error || 'Failed to update robot details');
      }
    } catch (err) {
      setRobotMessage('Network error');
    } finally {
      setSubmittingRobot(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setRobotImage(file);
      setRobotPreview(URL.createObjectURL(file));
    }
  };

  const headerHeight = (parseInt(logoSize) * 4) + 24;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans">
      <SEO title="Profile" description="Manage your team registration and robot details for BOT BASH." />
      {/* Auto-hiding Header */}
      <motion.header 
        variants={{
          visible: { y: 0 },
          hidden: { y: "-100%" }
        }}
        animate={hidden ? "hidden" : "visible"}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        style={{ height: `${headerHeight}px` }}
        className="fixed top-0 left-0 w-full bg-[#0A0A0A] border-b-4 border-[#E427F5] z-50 flex justify-between items-center px-6 md:px-12"
      >
        <div className="flex items-center gap-4">
          <img 
            src="https://github.com/ethoart/botbash-img/blob/main/Adobe%20Express%20-%20file%20(1).png?raw=true" 
            alt="Bot Bash Logo" 
            style={{ height: `${parseInt(logoSize) * 4}px` }}
            className="object-contain"
          />
        </div>
        <nav className="hidden md:flex items-center gap-8 font-tech text-xl lg:text-2xl uppercase italic tracking-wider">
          <Link to="/" className="hover:text-[#E427F5] transition-colors">Home</Link>
        </nav>
        <div className="flex items-center gap-3 md:gap-4">
          <Link 
            to="/" 
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-full border-2 border-[#E427F5] text-[#E427F5] hover:bg-[#E427F5] hover:text-black transition-all duration-300"
            title="Home"
          >
            <Home className="w-5 h-5" />
          </Link>
          {user && (
            <button onClick={handleLogout} className="bg-[#E427F5] text-black font-tech text-lg md:text-xl uppercase italic font-bold px-4 md:px-6 py-2 hover:bg-white transition-colors transform -skew-x-12 flex items-center gap-2">
              <span className="block transform skew-x-12 flex items-center gap-2"><LogOut className="w-5 h-5" /> Logout</span>
            </button>
          )}
        </div>
      </motion.header>

      <main className="pb-24 px-6 md:px-12 max-w-4xl mx-auto" style={{ paddingTop: `${headerHeight + 32}px` }}>
        {!user ? (
          <div className="bg-[#111] border-4 border-[#222] p-8 relative max-w-md mx-auto">
            {/* Decorative corners */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-[#E427F5] -translate-x-1 -translate-y-1" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-[#E427F5] translate-x-1 -translate-y-1" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-[#E427F5] -translate-x-1 translate-y-1" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-[#E427F5] translate-x-1 translate-y-1" />

            {forgotPasswordMode === 'none' && (
              <>
                <h2 className="text-4xl font-tech font-black italic uppercase tracking-tighter text-white mb-8 text-center">
                  TEAM <span className="text-[#E427F5]">LOGIN</span>
                </h2>

                {resetMessage && (
                  <div className="bg-green-900/30 border border-green-500/50 text-green-400 p-3 mb-6 text-center font-bold uppercase italic text-sm">
                    {resetMessage}
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-2">
                    <label className="font-tech text-xl uppercase italic font-bold text-gray-300">Email Address</label>
                    <input 
                      required
                      type="email" 
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full bg-black border-2 border-[#333] px-4 py-3 text-white focus:outline-none focus:border-[#E427F5] transition-colors font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="font-tech text-xl uppercase italic font-bold text-gray-300">Password</label>
                      <button 
                        type="button"
                        onClick={() => {
                          setForgotPasswordMode('request');
                          setError('');
                          setResetMessage('');
                        }}
                        className="text-[#E427F5] text-sm font-bold uppercase italic hover:text-white transition-colors"
                      >
                        Forgot?
                      </button>
                    </div>
                    <input 
                      required
                      type="password" 
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full bg-black border-2 border-[#333] px-4 py-3 text-white focus:outline-none focus:border-[#E427F5] transition-colors font-medium"
                    />
                  </div>

                  {error && (
                    <div className="text-red-500 font-medium text-center">{error}</div>
                  )}

                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#E427F5] text-black font-tech text-2xl uppercase italic font-black py-3 hover:bg-white transition-colors transform -skew-x-12 disabled:opacity-50"
                  >
                    <span className="block transform skew-x-12">
                      {loading ? 'LOGGING IN...' : 'LOGIN'}
                    </span>
                  </button>
                </form>
              </>
            )}

            {forgotPasswordMode === 'request' && (
              <>
                <h2 className="text-4xl font-tech font-black italic uppercase tracking-tighter text-white mb-8 text-center">
                  RESET <span className="text-[#E427F5]">PASSWORD</span>
                </h2>

                <p className="text-gray-400 text-center mb-8 font-tech uppercase italic">
                  Enter your email to receive a verification code.
                </p>

                <form onSubmit={handleForgotPasswordRequest} className="space-y-6">
                  <div className="space-y-2">
                    <label className="font-tech text-xl uppercase italic font-bold text-gray-300">Email Address</label>
                    <input 
                      required
                      type="email" 
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full bg-black border-2 border-[#333] px-4 py-3 text-white focus:outline-none focus:border-[#E427F5] transition-colors font-medium"
                    />
                  </div>

                  {error && (
                    <div className="text-red-500 font-medium text-center">{error}</div>
                  )}

                  <div className="flex flex-col gap-4">
                    <button 
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#E427F5] text-black font-tech text-2xl uppercase italic font-black py-3 hover:bg-white transition-colors transform -skew-x-12 disabled:opacity-50"
                    >
                      <span className="block transform skew-x-12">
                        {loading ? 'SENDING...' : 'SEND CODE'}
                      </span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => setForgotPasswordMode('none')}
                      className="text-gray-500 font-tech uppercase italic font-bold hover:text-white transition-colors"
                    >
                      Back to Login
                    </button>
                  </div>
                </form>
              </>
            )}

            {forgotPasswordMode === 'reset' && (
              <>
                <h2 className="text-4xl font-tech font-black italic uppercase tracking-tighter text-white mb-8 text-center">
                  VERIFY <span className="text-[#E427F5]">CODE</span>
                </h2>

                {resetMessage && (
                  <div className="bg-green-900/30 border border-green-500/50 text-green-400 p-3 mb-6 text-center font-bold uppercase italic text-sm">
                    {resetMessage}
                  </div>
                )}

                <form onSubmit={handleResetPassword} className="space-y-6">
                  <div className="space-y-2">
                    <label className="font-tech text-xl uppercase italic font-bold text-gray-300">Verification Code</label>
                    <input 
                      required
                      type="text" 
                      value={resetCode}
                      onChange={e => setResetCode(e.target.value)}
                      className="w-full bg-black border-2 border-[#333] px-4 py-3 text-white focus:outline-none focus:border-[#E427F5] transition-colors font-medium text-center tracking-[1em] text-2xl"
                      placeholder="000000"
                      maxLength={6}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-tech text-xl uppercase italic font-bold text-gray-300">New Password</label>
                    <input 
                      required
                      type="password" 
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="w-full bg-black border-2 border-[#333] px-4 py-3 text-white focus:outline-none focus:border-[#E427F5] transition-colors font-medium"
                      placeholder="Enter new password"
                    />
                  </div>

                  {error && (
                    <div className="text-red-500 font-medium text-center">{error}</div>
                  )}

                  <div className="flex flex-col gap-4">
                    <button 
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#E427F5] text-black font-tech text-2xl uppercase italic font-black py-3 hover:bg-white transition-colors transform -skew-x-12 disabled:opacity-50"
                    >
                      <span className="block transform skew-x-12">
                        {loading ? 'RESETTING...' : 'RESET PASSWORD'}
                      </span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => setForgotPasswordMode('request')}
                      className="text-gray-500 font-tech uppercase italic font-bold hover:text-white transition-colors"
                    >
                      Resend Code
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-12">
            <h2 className="text-5xl md:text-7xl font-tech font-black italic uppercase tracking-tighter text-white leading-none">
              WELCOME, <br/><span className="text-[#E427F5]">{user.teamName}</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Profile Details */}
              <div className="bg-[#111] border-4 border-[#333] p-8 relative">
                <h3 className="text-3xl font-tech font-bold italic uppercase tracking-widest text-[#E427F5] mb-6 flex items-center gap-3">
                  <User className="w-8 h-8" /> Team Profile
                </h3>
                <div className="space-y-4 text-lg">
                  <div className="flex justify-between border-b border-[#333] pb-2">
                    <span className="text-gray-400 font-tech uppercase italic">Robot Name</span>
                    <span className="font-bold">{user.robotName}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#333] pb-2">
                    <span className="text-gray-400 font-tech uppercase italic">Captain</span>
                    <span className="font-bold">{user.captainName}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#333] pb-2">
                    <span className="text-gray-400 font-tech uppercase italic">Contact</span>
                    <span className="font-bold">{user.phone}</span>
                  </div>
                </div>
              </div>

              {/* Application Status */}
              <div className="bg-[#111] border-4 border-[#333] p-8 relative">
                <h3 className="text-3xl font-tech font-bold italic uppercase tracking-widest text-[#E427F5] mb-6 flex items-center gap-3">
                  <Shield className="w-8 h-8" /> Application Status
                </h3>
                
                <div className="flex flex-col items-center justify-center h-full pb-8">
                  {user.status === 'pending' && (
                    <>
                      <Clock className="w-20 h-20 text-yellow-500 mb-4" />
                      <div className="text-4xl font-tech font-black italic uppercase text-yellow-500 tracking-widest">PENDING</div>
                      <p className="text-gray-400 text-center mt-4">Your application is under review by the admins.</p>
                    </>
                  )}
                  {user.status === 'approved' && (
                    <>
                      <CheckCircle2 className="w-20 h-20 text-green-500 mb-4" />
                      <div className="text-4xl font-tech font-black italic uppercase text-green-500 tracking-widest">APPROVED</div>
                      <p className="text-gray-400 text-center mt-4">You are officially in! Check your email for details.</p>
                    </>
                  )}
                  {user.status === 'rejected' && (
                    <>
                      <XCircle className="w-20 h-20 text-red-500 mb-4" />
                      <div className="text-4xl font-tech font-black italic uppercase text-red-500 tracking-widest">REJECTED</div>
                      <p className="text-gray-400 text-center mt-4">Unfortunately, your application was not accepted this time.</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Robot Registration Section */}
            <div className="bg-[#111] border-4 border-[#333] p-8 relative">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <h3 className="text-4xl font-tech font-bold italic uppercase tracking-widest text-[#E427F5] flex items-center gap-3">
                  <Bot className="w-10 h-10" /> Robot Registration
                </h3>
                <div className={`flex items-center gap-2 px-4 py-1 border-2 font-tech uppercase italic font-bold ${
                  user.robotStatus === 'approved' ? 'border-green-500 text-green-500' :
                  user.robotStatus === 'rejected' ? 'border-red-500 text-red-500' :
                  'border-yellow-500 text-yellow-500'
                }`}>
                  {user.robotStatus === 'approved' ? <CheckCircle2 className="w-5 h-5" /> :
                   user.robotStatus === 'rejected' ? <XCircle className="w-5 h-5" /> :
                   <Clock className="w-5 h-5" />}
                  {user.robotStatus || 'PENDING'}
                </div>
              </div>

              <form onSubmit={handleRobotSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="font-tech text-xl uppercase italic font-bold text-gray-300 flex items-center gap-2">
                      Robot Height <span className="text-xs text-gray-500">(cm)</span>
                    </label>
                    <input 
                      required
                      type="text" 
                      value={robotHeight}
                      onChange={e => setRobotHeight(e.target.value)}
                      className="w-full bg-black border-2 border-[#333] px-4 py-3 text-white focus:outline-none focus:border-[#E427F5] transition-colors font-medium"
                      placeholder="e.g. 45"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-tech text-xl uppercase italic font-bold text-gray-300 flex items-center gap-2">
                      Robot Weight <span className="text-xs text-gray-500">(kg)</span>
                    </label>
                    <input 
                      required
                      type="text" 
                      value={robotWeight}
                      onChange={e => setRobotWeight(e.target.value)}
                      className="w-full bg-black border-2 border-[#333] px-4 py-3 text-white focus:outline-none focus:border-[#E427F5] transition-colors font-medium"
                      placeholder="e.g. 15"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-tech text-xl uppercase italic font-bold text-gray-300">Materials Used</label>
                    <textarea 
                      required
                      value={robotMaterials}
                      onChange={e => setRobotMaterials(e.target.value)}
                      className="w-full bg-black border-2 border-[#333] px-4 py-3 text-white focus:outline-none focus:border-[#E427F5] transition-colors font-medium h-24 resize-none"
                      placeholder="e.g. Aluminum, Carbon Fiber, High-torque servos..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="font-tech text-xl uppercase italic font-bold text-gray-300">Dimensions (L x W x H)</label>
                    <input 
                      required
                      type="text" 
                      value={robotDimensions}
                      onChange={e => setRobotDimensions(e.target.value)}
                      className="w-full bg-black border-2 border-[#333] px-4 py-3 text-white focus:outline-none focus:border-[#E427F5] transition-colors font-medium"
                      placeholder="e.g. 50cm x 50cm x 45cm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="font-tech text-xl uppercase italic font-bold text-gray-300">Power Source</label>
                    <input 
                      required
                      type="text" 
                      value={robotPowerSource}
                      onChange={e => setRobotPowerSource(e.target.value)}
                      className="w-full bg-black border-2 border-[#333] px-4 py-3 text-white focus:outline-none focus:border-[#E427F5] transition-colors font-medium"
                      placeholder="e.g. 6S LiPo Battery, 5000mAh"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="font-tech text-xl uppercase italic font-bold text-gray-300">Weapons / Systems</label>
                    <textarea 
                      required
                      value={robotWeapons}
                      onChange={e => setRobotWeapons(e.target.value)}
                      className="w-full bg-black border-2 border-[#333] px-4 py-3 text-white focus:outline-none focus:border-[#E427F5] transition-colors font-medium h-24 resize-none"
                      placeholder="e.g. Vertical Spinner, Wedge, Active Lifter..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="font-tech text-xl uppercase italic font-bold text-gray-300">Additional Info</label>
                    <textarea 
                      value={robotAdditionalInfo}
                      onChange={e => setRobotAdditionalInfo(e.target.value)}
                      className="w-full bg-black border-2 border-[#333] px-4 py-3 text-white focus:outline-none focus:border-[#E427F5] transition-colors font-medium h-24 resize-none"
                      placeholder="Anything else we should know about your robot fighter?"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="font-tech text-xl uppercase italic font-bold text-gray-300">Robot Image</label>
                    <div className="relative group cursor-pointer">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleImageChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="w-full aspect-video bg-black border-2 border-dashed border-[#333] group-hover:border-[#E427F5] transition-colors flex flex-col items-center justify-center relative overflow-hidden">
                        {robotPreview ? (
                          <img src={robotPreview} alt="Robot Preview" className="w-full h-full object-cover" />
                        ) : (
                          <>
                            <Upload className="w-12 h-12 text-gray-500 group-hover:text-[#E427F5] mb-2" />
                            <span className="text-gray-500 group-hover:text-[#E427F5] font-tech uppercase italic">Click to upload image</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-900/20 border border-blue-500/50 p-4 flex gap-3">
                    <Info className="w-6 h-6 text-blue-400 shrink-0" />
                    <p className="text-sm text-blue-200">
                      Please provide accurate measurements. Your robot will be physically inspected on event day to verify these details.
                    </p>
                  </div>

                  {robotMessage && (
                    <div className={`p-4 text-center font-bold uppercase italic tracking-wider ${
                      robotMessage.includes('successfully') ? 'bg-green-900/30 text-green-400 border border-green-500/50' : 'bg-red-900/30 text-red-400 border border-red-500/50'
                    }`}>
                      {robotMessage}
                    </div>
                  )}

                  <button 
                    type="submit"
                    disabled={submittingRobot}
                    className="w-full bg-[#E427F5] text-black font-tech text-2xl uppercase italic font-black py-4 hover:bg-white transition-colors transform -skew-x-12 disabled:opacity-50"
                  >
                    <span className="block transform skew-x-12">
                      {submittingRobot ? 'UPDATING...' : 'UPDATE ROBOT DETAILS'}
                    </span>
                  </button>
                </div>
              </form>
            </div>

            {/* QR Pass Section (Only if approved) */}
            {user.status === 'approved' && user.qrCode && (
              <div className="bg-[#E427F5] text-black p-8 relative transform -skew-x-2">
                <div className="transform skew-x-2 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div>
                    <h3 className="text-4xl font-tech font-black italic uppercase tracking-widest mb-2 flex items-center gap-3">
                      <QrCode className="w-10 h-10" /> OFFICIAL EVENT PASS
                    </h3>
                    <p className="font-medium text-lg max-w-md">
                      Present this QR code at the entrance of the Royal MAS Arena on event day. This pass is unique to your team.
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-2xl">
                    <img src={user.qrCode} alt="Team QR Code" className="w-48 h-48" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
