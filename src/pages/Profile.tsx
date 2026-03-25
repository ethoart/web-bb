import React, { useState, useEffect } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { LogOut, User, Shield, CheckCircle2, XCircle, Clock, QrCode } from 'lucide-react';

import Footer from '../components/Footer';

export default function Profile() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans">
      {/* Auto-hiding Header */}
      <motion.header 
        variants={{
          visible: { y: 0 },
          hidden: { y: "-100%" }
        }}
        animate={hidden ? "hidden" : "visible"}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className="fixed top-0 left-0 w-full bg-[#0A0A0A] border-b-4 border-[#E427F5] z-50 flex justify-between items-center px-6 md:px-12 py-2"
      >
        <div className="flex items-center gap-4">
          <img 
            src="https://github.com/ethoart/botbash-img/blob/main/Adobe%20Express%20-%20file%20(1).png?raw=true" 
            alt="Bot Bash Logo" 
            className="h-16 md:h-24 object-contain"
          />
        </div>
        <nav className="hidden md:flex items-center gap-8 font-tech text-2xl uppercase italic tracking-wider">
          <a href="/" className="hover:text-[#E427F5] transition-colors">Home</a>
        </nav>
        {user && (
          <button onClick={handleLogout} className="bg-[#E427F5] text-black font-tech text-xl uppercase italic font-bold px-6 py-2 hover:bg-white transition-colors transform -skew-x-12 flex items-center gap-2">
            <span className="block transform skew-x-12 flex items-center gap-2"><LogOut className="w-5 h-5" /> Logout</span>
          </button>
        )}
      </motion.header>

      <main className="pt-40 pb-24 px-6 md:px-12 max-w-4xl mx-auto">
        {!user ? (
          <div className="bg-[#111] border-4 border-[#222] p-8 relative max-w-md mx-auto">
            {/* Decorative corners */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-[#E427F5] -translate-x-1 -translate-y-1" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-[#E427F5] translate-x-1 -translate-y-1" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-[#E427F5] -translate-x-1 translate-y-1" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-[#E427F5] translate-x-1 translate-y-1" />

            <h2 className="text-4xl font-tech font-black italic uppercase tracking-tighter text-white mb-8 text-center">
              TEAM <span className="text-[#E427F5]">LOGIN</span>
            </h2>

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
                <label className="font-tech text-xl uppercase italic font-bold text-gray-300">Password</label>
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
