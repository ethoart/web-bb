import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Gift, Trophy, Medal, Users, Calendar, MapPin, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';

import Footer from '../components/Footer';

export default function Home() {
  const { scrollYProgress } = useScroll();
  const yBg = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  // Prize Pool State
  const [prizePool, setPrizePool] = useState({ first: '???' });
  const [isRevealed, setIsRevealed] = useState(false);
  const [bannerImage, setBannerImage] = useState('https://github.com/ethoart/botbash-img/blob/main/Adobe%20Express%20-%20file.png?raw=true');
  const [sponsors, setSponsors] = useState('');
  const [facebookLink, setFacebookLink] = useState('https://www.facebook.com/profile.php?id=61573020699132');
  const [instagramLink, setInstagramLink] = useState('#');
  const [youtubeLink, setYoutubeLink] = useState('#');
  const [galleryImages, setGalleryImages] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.prizePoolFirst) setPrizePool(prev => ({ ...prev, first: data.prizePoolFirst }));
        if (data.isRevealed !== undefined) setIsRevealed(data.isRevealed);
        if (data.bannerImage) setBannerImage(data.bannerImage);
        if (data.sponsors !== undefined) setSponsors(data.sponsors);
        if (data.facebookLink) setFacebookLink(data.facebookLink);
        if (data.instagramLink) setInstagramLink(data.instagramLink);
        if (data.youtubeLink) setYoutubeLink(data.youtubeLink);
      })
      .catch(console.error);

    fetch('/api/gallery')
      .then(res => res.json())
      .then(data => setGalleryImages(data))
      .catch(console.error);
  }, []);

  // Registration State
  const [regForm, setRegForm] = useState({
    teamName: '', robotName: '', country: 'Sri Lanka', captainName: '', email: '', phone: '', password: ''
  });
  const [regStatus, setRegStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegStatus('submitting');
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regForm)
      });
      if (res.ok) {
        setRegStatus('success');
        setRegForm({ teamName: '', robotName: '', country: 'Sri Lanka', captainName: '', email: '', phone: '', password: '' });
      } else {
        setRegStatus('error');
      }
    } catch (err) {
      setRegStatus('error');
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0A0A0A] text-white overflow-x-hidden font-sans selection:bg-[#E427F5] selection:text-black">
      
      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 w-full bg-[#0A0A0A] border-b-4 border-[#E427F5] z-50 flex justify-between items-center px-6 md:px-12 py-2">
        <div className="flex items-center gap-4">
          <img 
            src="https://github.com/ethoart/botbash-img/blob/main/Adobe%20Express%20-%20file%20(1).png?raw=true" 
            alt="Bot Bash Logo" 
            className="h-16 md:h-24 object-contain"
          />
        </div>
        <nav className="hidden md:flex items-center gap-8 font-tech text-2xl uppercase italic tracking-wider">
          <a href="#register" className="hover:text-[#E427F5] transition-colors">Register</a>
          <a href="#prizes" className="hover:text-[#E427F5] transition-colors">Prizes</a>
          <a href="#gallery" className="hover:text-[#E427F5] transition-colors">Gallery</a>
          <a href="/profile" className="hover:text-[#E427F5] transition-colors">Profile</a>
        </nav>
        <a href="#register" className="bg-[#E427F5] text-black font-tech text-xl md:text-2xl uppercase italic font-bold px-6 py-2 hover:bg-white transition-colors transform -skew-x-12">
          <span className="block transform skew-x-12">Enter Now</span>
        </a>
      </header>

      {/* 1. Hero Banner Section */}
      <section className="relative w-full h-[90vh] md:h-screen flex items-center justify-center pt-20 overflow-hidden bg-[#111]">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#E427F5 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        
        {/* Massive Background Text */}
        <motion.div 
          className="absolute z-10 w-full flex flex-col justify-center items-center pointer-events-none"
          style={{ y: yBg }}
        >
          <h1 className="text-[25vw] font-tech font-black italic tracking-tighter leading-[0.75] text-[#1A1A1A] uppercase select-none transform -skew-x-12">
            BOT BASH
          </h1>
          <h1 className="text-[25vw] font-tech font-black italic tracking-tighter leading-[0.75] text-[#1A1A1A] uppercase select-none transform -skew-x-12">
            COLOMBO
          </h1>
        </motion.div>

        {/* Character Image */}
        <motion.img
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          src={bannerImage}
          alt="Bot Bash Character"
          fetchPriority="high"
          className="absolute z-20 w-[100vw] md:w-[50vw] max-w-none object-cover object-top pointer-events-none top-20 md:top-10"
        />

        {/* Foreground Action Text */}
        <div className="absolute z-30 bottom-24 md:bottom-32 left-6 md:left-12 flex flex-col items-start">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-[#E427F5] text-black px-4 py-1 transform -skew-x-12 mb-2"
          >
            <span className="block transform skew-x-12 font-tech text-3xl md:text-5xl font-bold uppercase italic">2026 Season</span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-6xl md:text-9xl font-tech font-black italic uppercase tracking-tighter leading-none text-white drop-shadow-2xl"
          >
            COMING SOON
          </motion.h2>
        </div>
      </section>

      {/* Marquee Divider */}
      <div className="w-full bg-[#E427F5] py-3 overflow-hidden flex whitespace-nowrap border-y-4 border-black relative z-40">
        <div className="animate-marquee flex gap-8 items-center">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="text-black font-tech text-3xl md:text-4xl font-bold uppercase italic tracking-widest">
              • ULTIMATE ROBO BATTLE • COLOMBO 2026 
            </span>
          ))}
        </div>
      </div>

      {/* 2. Registration Portal */}
      <section id="register" className="relative z-30 py-24 px-6 md:px-12 bg-[#0A0A0A]">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row gap-12 items-start">
            
            {/* Left Side: Info */}
            <div className="w-full md:w-1/2">
              <h2 className="text-6xl md:text-8xl font-tech font-black italic uppercase tracking-tighter text-white leading-none mb-6">
                ENTER <br/><span className="text-[#E427F5]">THE ARENA</span>
              </h2>
              <p className="text-xl text-gray-400 font-medium mb-8 leading-relaxed">
                Register your team for Bot Bash 2026. Prepare your machine, gather your crew, and get ready for the ultimate robotic combat experience in Sri Lanka.
              </p>
              <div className="space-y-6">
                <div className="flex items-center gap-4 border-l-4 border-[#E427F5] pl-4">
                  <Calendar className="w-8 h-8 text-[#E427F5]" />
                  <div>
                    <h4 className="font-tech text-2xl uppercase font-bold italic">Date</h4>
                    <p className="text-gray-400">To Be Announced (2026)</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 border-l-4 border-[#E427F5] pl-4">
                  <MapPin className="w-8 h-8 text-[#E427F5]" />
                  <div>
                    <h4 className="font-tech text-2xl uppercase font-bold italic">Location</h4>
                    <p className="text-gray-400">Royal MAS Arena, Colombo</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: Form */}
            <div className="w-full md:w-1/2 bg-[#111] border-4 border-[#222] p-8 relative">
              {/* Decorative corners */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-[#E427F5] -translate-x-1 -translate-y-1" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-[#E427F5] translate-x-1 -translate-y-1" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-[#E427F5] -translate-x-1 translate-y-1" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-[#E427F5] translate-x-1 translate-y-1" />

              {regStatus === 'success' ? (
                <div className="text-center py-16">
                  <CheckCircle2 className="w-24 h-24 text-[#E427F5] mx-auto mb-6" />
                  <h3 className="text-4xl font-tech font-bold italic uppercase mb-4">Registration Received!</h3>
                  <p className="text-gray-400 mb-8">Your team is in the system. Check your email for next steps.</p>
                  <button 
                    onClick={() => setRegStatus('idle')}
                    className="bg-white text-black font-tech text-2xl uppercase italic font-bold px-8 py-3 hover:bg-[#E427F5] transition-colors transform -skew-x-12"
                  >
                    <span className="block transform skew-x-12">Register Another</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRegister} className="space-y-5">
                  <div className="space-y-1">
                    <label className="font-tech text-xl uppercase italic font-bold text-gray-300">Team Name</label>
                    <input 
                      required
                      type="text" 
                      value={regForm.teamName}
                      onChange={e => setRegForm({...regForm, teamName: e.target.value})}
                      className="w-full bg-black border-2 border-[#333] px-4 py-3 text-white focus:outline-none focus:border-[#E427F5] transition-colors font-medium"
                      placeholder="e.g. Cyber Knights"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-tech text-xl uppercase italic font-bold text-gray-300">Robot Name</label>
                    <input 
                      required
                      type="text" 
                      value={regForm.robotName}
                      onChange={e => setRegForm({...regForm, robotName: e.target.value})}
                      className="w-full bg-black border-2 border-[#333] px-4 py-3 text-white focus:outline-none focus:border-[#E427F5] transition-colors font-medium"
                      placeholder="e.g. Destructor"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-tech text-xl uppercase italic font-bold text-gray-300">Country</label>
                    <select 
                      value={regForm.country}
                      onChange={e => setRegForm({...regForm, country: e.target.value})}
                      className="w-full bg-black border-2 border-[#333] px-4 py-3 text-white focus:outline-none focus:border-[#E427F5] transition-colors font-medium appearance-none"
                    >
                      <option value="Sri Lanka">Sri Lanka</option>
                      <option value="India">India</option>
                      <option value="USA">USA</option>
                      <option value="UK">UK</option>
                      <option value="Australia">Australia</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1">
                      <label className="font-tech text-xl uppercase italic font-bold text-gray-300">Captain Name</label>
                      <input 
                        required
                        type="text" 
                        value={regForm.captainName}
                        onChange={e => setRegForm({...regForm, captainName: e.target.value})}
                        className="w-full bg-black border-2 border-[#333] px-4 py-3 text-white focus:outline-none focus:border-[#E427F5] transition-colors font-medium"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-tech text-xl uppercase italic font-bold text-gray-300">Phone</label>
                      <input 
                        required
                        type="tel" 
                        value={regForm.phone}
                        onChange={e => setRegForm({...regForm, phone: e.target.value})}
                        className="w-full bg-black border-2 border-[#333] px-4 py-3 text-white focus:outline-none focus:border-[#E427F5] transition-colors font-medium"
                        placeholder="+1 234 567 8900"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="font-tech text-xl uppercase italic font-bold text-gray-300">Email Address</label>
                    <input 
                      required
                      type="email" 
                      value={regForm.email}
                      onChange={e => setRegForm({...regForm, email: e.target.value})}
                      className="w-full bg-black border-2 border-[#333] px-4 py-3 text-white focus:outline-none focus:border-[#E427F5] transition-colors font-medium"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-tech text-xl uppercase italic font-bold text-gray-300">Password</label>
                    <input 
                      required
                      type="password" 
                      value={regForm.password}
                      onChange={e => setRegForm({...regForm, password: e.target.value})}
                      className="w-full bg-black border-2 border-[#333] px-4 py-3 text-white focus:outline-none focus:border-[#E427F5] transition-colors font-medium"
                      placeholder="Create a password"
                    />
                  </div>
                  
                  {regStatus === 'error' && (
                    <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      <span className="font-medium">Error submitting registration. Try again.</span>
                    </div>
                  )}

                  <button 
                    type="submit"
                    disabled={regStatus === 'submitting'}
                    className="w-full mt-4 bg-[#E427F5] text-black font-tech text-3xl uppercase italic font-black py-4 hover:bg-white transition-colors transform -skew-x-12 disabled:opacity-50 disabled:hover:bg-[#E427F5]"
                  >
                    <span className="block transform skew-x-12">
                      {regStatus === 'submitting' ? 'PROCESSING...' : 'SUBMIT REGISTRATION'}
                    </span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Prize Pool Reveal Section */}
      <section id="prizes" className="relative z-30 py-24 px-6 md:px-12 bg-[#1A1A1A] slanted-top slanted-bottom -my-12 pb-36 pt-36">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 2px, transparent 2px, transparent 10px)' }} />
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <h2 className="text-6xl md:text-8xl font-tech font-black italic text-white mb-16 uppercase tracking-tighter">
            PRIZE <span className="text-[#E427F5]">POOL</span>
          </h2>
          
          <div className="grid grid-cols-1 gap-8 md:gap-12 max-w-3xl mx-auto">
            {/* 1st Place */}
            <div className="bg-[#0A0A0A] border-4 border-[#333] p-10 relative group hover:border-[#E427F5] transition-colors transform -skew-x-6">
              <div className="transform skew-x-6">
                <Trophy className="w-20 h-20 text-[#E427F5] mx-auto mb-6" />
                <h3 className="text-3xl font-tech font-bold italic uppercase tracking-widest text-gray-400 mb-2">1st Place</h3>
                <div className="text-7xl md:text-9xl font-tech font-black italic text-white">
                  {isRevealed ? prizePool.first : <Gift className="w-24 h-24 mx-auto inline-block animate-pulse text-[#E427F5]" />}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Memories of 2025 Gallery */}
      <section id="gallery" className="relative z-30 py-24 px-6 md:px-12 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b-4 border-[#333] pb-6">
            <div>
              <h2 className="text-6xl md:text-8xl font-tech font-black italic text-white uppercase tracking-tighter leading-none">
                MEMORIES OF <br/><span className="text-[#E427F5]">2025</span>
              </h2>
            </div>
            <a href={facebookLink} target="_blank" rel="noreferrer" className="mt-6 md:mt-0 bg-white text-black font-tech text-2xl uppercase italic font-bold px-6 py-2 hover:bg-[#E427F5] transition-colors transform -skew-x-12 flex items-center gap-2">
              <span className="block transform skew-x-12 flex items-center gap-2">Full Gallery <ChevronRight className="w-6 h-6" /></span>
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryImages.length > 0 ? (
              galleryImages.map((img) => (
                <div 
                  key={img._id}
                  className="aspect-video bg-[#111] border-2 border-[#333] overflow-hidden relative group hover:border-[#E427F5] transition-colors"
                >
                  <img 
                    src={img.url} 
                    alt="Gallery Image"
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <a href={img.url} target="_blank" rel="noreferrer" className="text-[#E427F5] font-tech text-3xl font-bold italic uppercase transform -skew-x-12 hover:text-white transition-colors">
                      VIEW IMAGE
                    </a>
                  </div>
                </div>
              ))
            ) : (
              [1, 2, 3, 4, 5, 6].map((i) => (
                <div 
                  key={i}
                  className="aspect-video bg-[#111] border-2 border-[#333] overflow-hidden relative group hover:border-[#E427F5] transition-colors"
                >
                  <img 
                    src={`https://picsum.photos/seed/botbash${i}/800/600`} 
                    alt={`Bot Bash 2025 Memory ${i}`}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <p className="text-[#E427F5] font-tech text-3xl font-bold italic uppercase transform -skew-x-12">VIEW IMAGE</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 5. Sponsors */}
      <section className="relative z-30 py-24 px-6 md:px-12 bg-[#E427F5] text-black">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-tech font-black italic uppercase tracking-tighter mb-12">
            POWERED BY
          </h2>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24">
            {sponsors ? (
              <img src={sponsors} alt="Sponsors" className="max-w-full h-auto max-h-32 object-contain" />
            ) : (
              <>
                <div className="text-3xl md:text-4xl font-black tracking-tighter uppercase">TECH TO OXYGEN</div>
                <div className="text-3xl md:text-4xl font-black tracking-tighter uppercase">ROBO CORP</div>
                <div className="text-3xl md:text-4xl font-black tracking-tighter uppercase">CYBER DYNAMICS</div>
                <div className="text-3xl md:text-4xl font-black tracking-tighter uppercase">MECHA SYSTEMS</div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

    </div>
  );
}
