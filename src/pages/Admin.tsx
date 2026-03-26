import React, { useEffect, useState } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { Users, Settings, Trophy, Eye, EyeOff, Save, RefreshCw, CheckCircle2, XCircle, Mail, QrCode, ScanLine, Image, Link, Upload, Trash2, Camera, Info } from 'lucide-react';
import { Html5Qrcode, Html5QrcodeScanner } from 'html5-qrcode';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');

  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'registrations' | 'scanner' | 'mail' | 'settings' | 'gallery'>('registrations');

  // Settings State
  const [prizePoolFirst, setPrizePoolFirst] = useState('');
  const [isRevealed, setIsRevealed] = useState(false);
  const [bannerImage, setBannerImage] = useState('https://github.com/ethoart/botbash-img/blob/main/Adobe%20Express%20-%20file.png?raw=true');
  const [sponsors, setSponsors] = useState('TECH TO OXYGEN,ROBO CORP,CYBER DYNAMICS,MECHA SYSTEMS');
  const [facebookLink, setFacebookLink] = useState('https://www.facebook.com/profile.php?id=61573020699132');
  const [instagramLink, setInstagramLink] = useState('#');
  const [youtubeLink, setYoutubeLink] = useState('#');
  const [eventDate, setEventDate] = useState('To Be Announced (2026)');
  const [eventLocation, setEventLocation] = useState('Royal MAS Arena, Colombo');
  const [savingSettings, setSavingSettings] = useState(false);

  // Mail State
  const [mailSubject, setMailSubject] = useState('');
  const [mailBody, setMailBody] = useState('');
  const [mailTarget, setMailTarget] = useState('all');
  const [sendingMail, setSendingMail] = useState(false);

  // Scanner State
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scannedUser, setScannedUser] = useState<any>(null);
  const [scanStatus, setScanStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isScannerStarted, setIsScannerStarted] = useState(false);

  // Modal State
  const [selectedTeam, setSelectedTeam] = useState<any>(null);

  // Gallery State
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [galleryLink, setGalleryLink] = useState('');
  const [galleryFile, setGalleryFile] = useState<File | null>(null);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.email === 'mail@botbash.lk' && loginForm.password === 'BOTbash098#1') {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Invalid admin credentials');
    }
  };

  useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;

    if (activeTab === 'scanner' && isScannerStarted) {
      html5QrCode = new Html5Qrcode("reader");
      
      const config = { fps: 10, qrbox: { width: 250, height: 250 } };
      
      html5QrCode.start(
        { facingMode: "environment" }, 
        config, 
        onScanSuccess, 
        onScanFailure
      ).catch(err => {
        console.error("Unable to start scanning", err);
        setIsScannerStarted(false);
        alert("Could not start camera. Please ensure you have granted camera permissions.");
      });

      return () => {
        if (html5QrCode && html5QrCode.isScanning) {
          html5QrCode.stop().then(() => {
            html5QrCode?.clear();
          }).catch(err => console.error("Failed to stop scanner", err));
        }
      };
    }
  }, [activeTab, isScannerStarted]);

  const onScanSuccess = async (decodedText: string) => {
    setScanResult(decodedText);
    setScannedUser(null);
    try {
      // The QR code contains JSON data like {"id":"...","team":"..."}
      let parsedData;
      try {
        parsedData = JSON.parse(decodedText);
      } catch (e) {
        // Fallback in case it's just the ID
        parsedData = { id: decodedText };
      }

      const res = await fetch('/api/admin/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: parsedData.id })
      });
      const data = await res.json();
      if (res.ok) {
        setScanStatus('success');
        setScannedUser(data.user);
        fetchData(); // Refresh data to show participated status
      } else {
        setScanStatus('error');
      }
    } catch (err) {
      setScanStatus('error');
    }
  };

  const onScanFailure = (error: any) => {
    // handle scan failure, usually better to ignore and keep scanning
  };

  const handleFileUpload = async (file: File, type: 'banner' | 'sponsors') => {
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.url) {
        if (type === 'banner') setBannerImage(data.url);
        else setSponsors(data.url);
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      alert('Failed to upload image');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const regRes = await fetch('/api/admin/registrations');
      const regData = await regRes.json();
      setRegistrations(regData);

      const setRes = await fetch('/api/settings');
      const setData = await setRes.json();
      if (setData.prizePoolFirst) setPrizePoolFirst(setData.prizePoolFirst);
      if (setData.isRevealed !== undefined) setIsRevealed(setData.isRevealed);
      if (setData.bannerImage) setBannerImage(setData.bannerImage);
      if (setData.sponsors) setSponsors(setData.sponsors);
      if (setData.facebookLink) setFacebookLink(setData.facebookLink);
      if (setData.instagramLink) setInstagramLink(setData.instagramLink);
      if (setData.youtubeLink) setYoutubeLink(setData.youtubeLink);
      if (setData.eventDate) setEventDate(setData.eventDate);
      if (setData.eventLocation) setEventLocation(setData.eventLocation);

      const galRes = await fetch('/api/gallery');
      const galData = await galRes.json();
      setGalleryImages(galData);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await fetch(`/api/admin/registrations/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      fetchData();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleDeleteRegistration = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this registration?')) return;
    try {
      await fetch(`/api/admin/registrations/${id}`, {
        method: 'DELETE'
      });
      fetchData();
    } catch (err) {
      console.error('Error deleting registration:', err);
    }
  };

  const handleSendMail = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingMail(true);
    try {
      const res = await fetch('/api/admin/mail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: mailTarget, subject: mailSubject, text: mailBody })
      });
      if (res.ok) {
        alert('Mail sent successfully!');
        setMailSubject('');
        setMailBody('');
      } else {
        alert('Failed to send mail.');
      }
    } catch (err) {
      console.error('Error sending mail:', err);
      alert('Error sending mail.');
    } finally {
      setSendingMail(false);
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'prizePoolFirst', value: prizePoolFirst })
      });
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'isRevealed', value: isRevealed })
      });
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'bannerImage', value: bannerImage })
      });
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'sponsors', value: sponsors })
      });
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'facebookLink', value: facebookLink })
      });
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'instagramLink', value: instagramLink })
      });
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'youtubeLink', value: youtubeLink })
      });
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'eventDate', value: eventDate })
      });
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'eventLocation', value: eventLocation })
      });
      alert('Settings saved successfully!');
    } catch (err) {
      console.error('Error saving settings:', err);
      alert('Failed to save settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleAddGalleryLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryLink) return;
    setUploadingGallery(true);
    try {
      const res = await fetch('/api/admin/gallery/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: galleryLink })
      });
      if (res.ok) {
        setGalleryLink('');
        fetchData();
      }
    } catch (err) {
      console.error('Error adding gallery link:', err);
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleUploadGalleryFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryFile) return;
    setUploadingGallery(true);
    try {
      const formData = new FormData();
      formData.append('image', galleryFile);
      const res = await fetch('/api/admin/gallery/upload', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        setGalleryFile(null);
        fetchData();
      }
    } catch (err) {
      console.error('Error uploading gallery file:', err);
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleDeleteGalleryImage = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;
    try {
      await fetch(`/api/admin/gallery/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      console.error('Error deleting gallery image:', err);
    }
  };

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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white font-sans flex items-center justify-center p-6">
        <div className="bg-black p-8 rounded-xl border-2 border-[#333] w-full max-w-md">
          <div className="flex justify-center mb-8">
            <img 
              src="https://github.com/ethoart/botbash-img/blob/main/Adobe%20Express%20-%20file%20(1).png?raw=true" 
              alt="Bot Bash Logo" 
              className="h-16 object-contain"
            />
          </div>
          <h2 className="text-3xl font-tech font-bold uppercase italic tracking-wider text-center mb-6 text-[#E427F5]">Admin Login</h2>
          
          {loginError && (
            <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded mb-6 flex items-center gap-2">
              <XCircle className="w-5 h-5 flex-shrink-0" />
              <p>{loginError}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-tech uppercase italic text-white/60 mb-1">Email</label>
              <input 
                type="email" 
                required
                value={loginForm.email}
                onChange={e => setLoginForm({...loginForm, email: e.target.value})}
                className="w-full bg-black border-2 border-[#333] px-4 py-3 text-white focus:outline-none focus:border-[#E427F5] transition-colors font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-tech uppercase italic text-white/60 mb-1">Password</label>
              <input 
                type="password" 
                required
                value={loginForm.password}
                onChange={e => setLoginForm({...loginForm, password: e.target.value})}
                className="w-full bg-black border-2 border-[#333] px-4 py-3 text-white focus:outline-none focus:border-[#E427F5] transition-colors font-medium"
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-[#E427F5] text-black font-tech text-2xl uppercase italic font-bold py-3 hover:bg-white transition-colors transform -skew-x-12 mt-6"
            >
              <span className="block transform skew-x-12">Login</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans">
      {/* Auto-hiding Admin Header */}
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
          <h1 className="text-2xl md:text-3xl font-tech font-bold uppercase italic tracking-widest text-[#E427F5] hidden sm:block">Admin</h1>
        </div>
        <a href="/" className="font-tech text-xl uppercase italic hover:text-[#E427F5] transition-colors">Back to Site</a>
      </motion.header>

      <div className="flex pt-[96px] md:pt-[120px]">
        {/* Sidebar */}
        <aside className="w-64 min-h-[calc(100vh-120px)] bg-black border-r-4 border-[#333] p-6 fixed h-full overflow-y-auto hidden md:block">
          <nav className="space-y-4 font-tech uppercase italic">
            <button 
              onClick={() => setActiveTab('registrations')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-none transition-colors ${activeTab === 'registrations' ? 'bg-[#E427F5] text-black font-bold' : 'text-white/60 hover:text-[#E427F5]'}`}
            >
              <Users className="w-5 h-5" />
              <span className="tracking-wide">Registrations</span>
            </button>
            <button 
              onClick={() => setActiveTab('scanner')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-none transition-colors ${activeTab === 'scanner' ? 'bg-[#E427F5] text-black font-bold' : 'text-white/60 hover:text-[#E427F5]'}`}
            >
              <QrCode className="w-5 h-5" />
              <span className="tracking-wide">QR Scanner</span>
            </button>
            <button 
              onClick={() => setActiveTab('mail')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-none transition-colors ${activeTab === 'mail' ? 'bg-[#E427F5] text-black font-bold' : 'text-white/60 hover:text-[#E427F5]'}`}
            >
              <Mail className="w-5 h-5" />
              <span className="tracking-wide">Mail Portal</span>
            </button>
            <button 
              onClick={() => setActiveTab('gallery')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-none transition-colors ${activeTab === 'gallery' ? 'bg-[#E427F5] text-black font-bold' : 'text-white/60 hover:text-[#E427F5]'}`}
            >
              <Image className="w-5 h-5" />
              <span className="tracking-wide">Gallery</span>
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-none transition-colors ${activeTab === 'settings' ? 'bg-[#E427F5] text-black font-bold' : 'text-white/60 hover:text-[#E427F5]'}`}
            >
              <Settings className="w-5 h-5" />
              <span className="tracking-wide">Site Settings</span>
            </button>
          </nav>
        </aside>

        {/* Mobile Nav */}
        <div className="md:hidden fixed bottom-0 left-0 w-full bg-black border-t-4 border-[#333] z-40 flex justify-around p-4 font-tech uppercase italic">
          <button onClick={() => setActiveTab('registrations')} className={`p-2 ${activeTab === 'registrations' ? 'text-[#E427F5]' : 'text-white/60'}`}><Users /></button>
          <button onClick={() => setActiveTab('scanner')} className={`p-2 ${activeTab === 'scanner' ? 'text-[#E427F5]' : 'text-white/60'}`}><QrCode /></button>
          <button onClick={() => setActiveTab('mail')} className={`p-2 ${activeTab === 'mail' ? 'text-[#E427F5]' : 'text-white/60'}`}><Mail /></button>
          <button onClick={() => setActiveTab('gallery')} className={`p-2 ${activeTab === 'gallery' ? 'text-[#E427F5]' : 'text-white/60'}`}><Image /></button>
          <button onClick={() => setActiveTab('settings')} className={`p-2 ${activeTab === 'settings' ? 'text-[#E427F5]' : 'text-white/60'}`}><Settings /></button>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 md:ml-64 pb-24 md:pb-8">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <RefreshCw className="w-8 h-8 animate-spin text-[#E427F5]" />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'registrations' && (
                <div>
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-tech font-bold uppercase italic tracking-wider text-[#E427F5]">Team Registrations</h2>
                    <div className="bg-black px-4 py-2 border-2 border-[#333] font-tech italic uppercase">
                      <span className="text-white/60 mr-2">Total Teams:</span>
                      <span className="font-bold text-[#E427F5]">{registrations.length}</span>
                    </div>
                  </div>

                  <div className="bg-black border-2 border-[#333] overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                      <thead>
                        <tr className="bg-[#111] border-b-2 border-[#333]">
                          <th className="p-4 font-tech italic text-[#E427F5] uppercase tracking-wider">Team</th>
                          <th className="p-4 font-tech italic text-[#E427F5] uppercase tracking-wider">Robot</th>
                          <th className="p-4 font-tech italic text-[#E427F5] uppercase tracking-wider">Country</th>
                          <th className="p-4 font-tech italic text-[#E427F5] uppercase tracking-wider">Contact</th>
                          <th className="p-4 font-tech italic text-[#E427F5] uppercase tracking-wider">Status</th>
                          <th className="p-4 font-tech italic text-[#E427F5] uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {registrations.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-white/40 font-tech italic uppercase">No registrations yet.</td>
                          </tr>
                        ) : (
                          registrations.map((reg, i) => (
                            <tr key={i} className="border-b border-[#333] hover:bg-[#111] transition-colors">
                              <td className="p-4">
                                <button 
                                  onClick={() => setSelectedTeam(reg)}
                                  className="font-bold text-[#E427F5] hover:text-white transition-colors text-left"
                                >
                                  {reg.teamName}
                                </button>
                              </td>
                              <td className="p-4 font-semibold text-white/80">{reg.robotName}</td>
                              <td className="p-4 text-sm text-white/80">{reg.country || 'N/A'}</td>
                              <td className="p-4 text-sm text-white/60">
                                <div>{reg.captainName}</div>
                                <div>{reg.email}</div>
                              </td>
                              <td className="p-4 text-sm font-tech uppercase italic">
                                {reg.status === 'pending' && <span className="text-yellow-500 font-bold">PENDING</span>}
                                {reg.status === 'approved' && <span className="text-green-500 font-bold">APPROVED</span>}
                                {reg.status === 'rejected' && <span className="text-red-500 font-bold">REJECTED</span>}
                                {reg.participated && <div className="text-xs text-[#E427F5] mt-1">PARTICIPATED</div>}
                              </td>
                              <td className="p-4">
                                <div className="flex gap-2">
                                  {reg.status === 'pending' && (
                                    <>
                                      <button 
                                        onClick={() => handleStatusChange(reg._id, 'approved')}
                                        className="p-2 bg-green-500/20 text-green-400 border border-green-500 hover:bg-green-500 hover:text-black transition-colors"
                                        title="Approve"
                                      >
                                        <CheckCircle2 className="w-5 h-5" />
                                      </button>
                                      <button 
                                        onClick={() => handleStatusChange(reg._id, 'rejected')}
                                        className="p-2 bg-red-500/20 text-red-400 border border-red-500 hover:bg-red-500 hover:text-black transition-colors"
                                        title="Reject"
                                      >
                                        <XCircle className="w-5 h-5" />
                                      </button>
                                    </>
                                  )}
                                  <button 
                                    onClick={() => handleDeleteRegistration(reg._id)}
                                    className="p-2 bg-red-900/20 text-red-500 border border-red-900 hover:bg-red-600 hover:text-white transition-colors"
                                    title="Delete Registration"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'scanner' && (
                <div className="max-w-2xl mx-auto">
                  <h2 className="text-3xl font-tech font-bold uppercase italic tracking-wider mb-8 flex items-center gap-3 text-[#E427F5]">
                    <QrCode className="w-8 h-8" /> QR Check-In
                  </h2>
                  <div className="bg-black p-8 border-2 border-[#333]">
                    <div className="mb-6 text-center">
                      <p className="text-white/60 font-tech uppercase italic mb-4">Scan participant QR code to confirm attendance</p>
                      {!isScannerStarted ? (
                        <button 
                          onClick={() => setIsScannerStarted(true)}
                          className="bg-[#E427F5] text-black font-tech text-xl uppercase italic font-black py-3 px-8 hover:bg-white transition-colors transform -skew-x-12"
                        >
                          <span className="block transform skew-x-12 flex items-center gap-2">
                            <Camera className="w-5 h-5" /> Start Camera
                          </span>
                        </button>
                      ) : (
                        <button 
                          onClick={() => setIsScannerStarted(false)}
                          className="bg-red-500 text-white font-tech text-xl uppercase italic font-black py-3 px-8 hover:bg-white hover:text-black transition-colors transform -skew-x-12"
                        >
                          <span className="block transform skew-x-12 flex items-center gap-2">
                            <XCircle className="w-5 h-5" /> Stop Camera
                          </span>
                        </button>
                      )}
                    </div>
                    
                    <div id="reader" className="w-full bg-[#111] border-2 border-[#333] overflow-hidden mb-6 min-h-[300px]"></div>
                    
                    {scanResult && (
                      <div className={`p-4 border-2 font-tech uppercase italic ${scanStatus === 'success' ? 'bg-green-500/20 border-green-500 text-green-400' : scanStatus === 'error' ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-[#111] border-[#333]'}`}>
                        <h3 className="font-bold mb-1">Scan Result:</h3>
                        <p className="font-sans normal-case text-sm break-all text-white">{scanResult}</p>
                        {scanStatus === 'success' && scannedUser && (
                          <div className="mt-4 border-t border-green-500/30 pt-4">
                            <p className="font-bold tracking-widest text-xl">✓ Participant Checked In!</p>
                            <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-white/40">Team:</span>
                                <div className="text-white">{scannedUser.teamName}</div>
                              </div>
                              <div>
                                <span className="text-white/40">Members:</span>
                                <div className="text-white text-xl font-black">{scannedUser.memberCount || 1}</div>
                              </div>
                            </div>
                          </div>
                        )}
                        {scanStatus === 'error' && <p className="mt-2 font-bold tracking-widest">✗ Invalid QR or Not Approved</p>}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'mail' && (
                <div className="max-w-3xl">
                  <h2 className="text-3xl font-tech font-bold uppercase italic tracking-wider mb-8 flex items-center gap-3 text-[#E427F5]">
                    <Mail className="w-8 h-8" /> Mail Portal
                  </h2>
                  <div className="bg-black p-8 border-2 border-[#333]">
                    <form onSubmit={handleSendMail} className="space-y-6">
                      <div className="space-y-2">
                        <label className="font-tech text-xl uppercase italic font-bold text-gray-300">Target Audience</label>
                        <select 
                          value={mailTarget}
                          onChange={e => setMailTarget(e.target.value)}
                          className="w-full bg-[#111] border-2 border-[#333] px-4 py-3 text-white focus:outline-none focus:border-[#E427F5] transition-colors font-medium appearance-none"
                        >
                          <option value="all">All Registered Teams</option>
                          <option value="approved">Approved Teams Only</option>
                          <option value="pending">Pending Teams Only</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="font-tech text-xl uppercase italic font-bold text-gray-300">Subject</label>
                        <input 
                          required
                          type="text" 
                          value={mailSubject}
                          onChange={e => setMailSubject(e.target.value)}
                          className="w-full bg-[#111] border-2 border-[#333] px-4 py-3 text-white focus:outline-none focus:border-[#E427F5] transition-colors font-medium"
                          placeholder="Important Event Update"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="font-tech text-xl uppercase italic font-bold text-gray-300">Message Body</label>
                        <textarea 
                          required
                          rows={8}
                          value={mailBody}
                          onChange={e => setMailBody(e.target.value)}
                          className="w-full bg-[#111] border-2 border-[#333] px-4 py-3 text-white focus:outline-none focus:border-[#E427F5] transition-colors font-medium"
                          placeholder="Write your message here..."
                        />
                      </div>
                      <button 
                        type="submit"
                        disabled={sendingMail}
                        className="w-full bg-[#E427F5] text-black font-tech text-2xl uppercase italic font-black py-3 hover:bg-white transition-colors transform -skew-x-12 disabled:opacity-50"
                      >
                        <span className="block transform skew-x-12">
                          {sendingMail ? 'SENDING...' : 'SEND MAIL'}
                        </span>
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {activeTab === 'gallery' && (
                <div className="max-w-4xl">
                  <h2 className="text-3xl font-tech font-bold uppercase italic tracking-wider mb-8 flex items-center gap-3 text-[#E427F5]">
                    <Image className="w-8 h-8" /> Gallery Management
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    {/* Upload File */}
                    <div className="bg-black p-8 border-2 border-[#333]">
                      <h3 className="font-tech text-xl uppercase italic font-bold text-white mb-6 flex items-center gap-2">
                        <Upload className="w-5 h-5 text-[#E427F5]" /> Upload Image
                      </h3>
                      <form onSubmit={handleUploadGalleryFile} className="space-y-4">
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={e => setGalleryFile(e.target.files?.[0] || null)}
                          className="w-full bg-[#111] border-2 border-[#333] px-4 py-3 text-white focus:outline-none focus:border-[#E427F5] transition-colors font-medium file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-tech file:italic file:uppercase file:bg-[#E427F5] file:text-black hover:file:bg-white file:transition-colors"
                        />
                        <button 
                          type="submit"
                          disabled={!galleryFile || uploadingGallery}
                          className="w-full bg-[#E427F5] text-black font-tech text-xl uppercase italic font-black py-3 hover:bg-white transition-colors transform -skew-x-12 disabled:opacity-50"
                        >
                          <span className="block transform skew-x-12">
                            {uploadingGallery ? 'UPLOADING...' : 'UPLOAD FILE'}
                          </span>
                        </button>
                      </form>
                    </div>

                    {/* Add Link */}
                    <div className="bg-black p-8 border-2 border-[#333]">
                      <h3 className="font-tech text-xl uppercase italic font-bold text-white mb-6 flex items-center gap-2">
                        <Link className="w-5 h-5 text-[#E427F5]" /> Add Image Link
                      </h3>
                      <form onSubmit={handleAddGalleryLink} className="space-y-4">
                        <input 
                          type="url" 
                          placeholder="https://example.com/image.jpg"
                          value={galleryLink}
                          onChange={e => setGalleryLink(e.target.value)}
                          className="w-full bg-[#111] border-2 border-[#333] px-4 py-3 text-white focus:outline-none focus:border-[#E427F5] transition-colors font-medium"
                        />
                        <button 
                          type="submit"
                          disabled={!galleryLink || uploadingGallery}
                          className="w-full bg-[#E427F5] text-black font-tech text-xl uppercase italic font-black py-3 hover:bg-white transition-colors transform -skew-x-12 disabled:opacity-50"
                        >
                          <span className="block transform skew-x-12">
                            {uploadingGallery ? 'ADDING...' : 'ADD LINK'}
                          </span>
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* Gallery Grid */}
                  <h3 className="font-tech text-2xl uppercase italic font-bold text-white mb-6">Current Images</h3>
                  {galleryImages.length === 0 ? (
                    <div className="bg-black border-2 border-[#333] p-8 text-center text-white/40 font-tech italic uppercase">
                      No images in gallery yet.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {galleryImages.map((img) => (
                        <div key={img._id} className="relative group aspect-square bg-black border-2 border-[#333] overflow-hidden">
                          <img 
                            src={img.url} 
                            alt="Gallery" 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button 
                              onClick={() => handleDeleteGalleryImage(img._id)}
                              className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600 transition-colors transform hover:scale-110"
                              title="Delete Image"
                            >
                              <Trash2 className="w-6 h-6" />
                            </button>
                          </div>
                          <div className="absolute bottom-0 left-0 w-full bg-black/80 p-2 text-xs font-tech uppercase italic text-[#E427F5] truncate">
                            {img.type}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="max-w-2xl">
                  <h2 className="text-3xl font-tech font-bold uppercase italic tracking-wider mb-8 text-[#E427F5]">Prize Pool Settings</h2>
                  
                  <div className="bg-black p-8 border-2 border-[#333] space-y-8">
                    <div className="space-y-4">
                      <label className="flex items-center gap-2 text-lg font-tech italic font-bold text-[#E427F5] uppercase tracking-widest">
                        <Trophy className="w-5 h-5" /> 1st Place Prize
                      </label>
                      <input 
                        type="text" 
                        value={prizePoolFirst}
                        onChange={e => setPrizePoolFirst(e.target.value)}
                        className="w-full bg-[#111] border-2 border-[#333] px-4 py-3 text-white focus:outline-none focus:border-[#E427F5] transition-colors text-xl font-tech"
                        placeholder="e.g. $500,000"
                      />
                    </div>

                    <div className="space-y-4">
                      <label className="flex items-center gap-2 text-lg font-tech italic font-bold text-[#E427F5] uppercase tracking-widest">
                        Banner Character Image
                      </label>
                      <div className="flex flex-col gap-4">
                        <input 
                          type="text" 
                          value={bannerImage}
                          onChange={e => setBannerImage(e.target.value)}
                          className="w-full bg-[#111] border-2 border-[#333] px-4 py-3 text-white focus:outline-none focus:border-[#E427F5] transition-colors text-xl font-tech"
                          placeholder="URL: https://example.com/image.png"
                        />
                        <div className="flex items-center gap-4">
                          <label className="flex-1 bg-[#111] border-2 border-[#333] px-4 py-3 text-white/60 cursor-pointer hover:border-[#E427F5] transition-colors font-tech uppercase italic text-sm flex items-center gap-2">
                            <Upload className="w-4 h-4" /> Upload New Image
                            <input 
                              type="file" 
                              accept="image/*"
                              className="hidden"
                              onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'banner')}
                            />
                          </label>
                        </div>
                      </div>
                      {bannerImage && (
                        <div className="mt-4">
                          <p className="text-sm text-white/50 mb-2 font-tech uppercase italic">Preview:</p>
                          <img src={bannerImage} alt="Banner Preview" className="h-32 object-contain bg-[#111] border-2 border-[#333] p-2" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <label className="flex items-center gap-2 text-lg font-tech italic font-bold text-[#E427F5] uppercase tracking-widest">
                        Sponsors Logo Image
                      </label>
                      <div className="flex flex-col gap-4">
                        <input 
                          type="text" 
                          value={sponsors}
                          onChange={e => setSponsors(e.target.value)}
                          className="w-full bg-[#111] border-2 border-[#333] px-4 py-3 text-white focus:outline-none focus:border-[#E427F5] transition-colors text-xl font-tech"
                          placeholder="URL: https://example.com/sponsors.png"
                        />
                        <div className="flex items-center gap-4">
                          <label className="flex-1 bg-[#111] border-2 border-[#333] px-4 py-3 text-white/60 cursor-pointer hover:border-[#E427F5] transition-colors font-tech uppercase italic text-sm flex items-center gap-2">
                            <Upload className="w-4 h-4" /> Upload New Logo
                            <input 
                              type="file" 
                              accept="image/*"
                              className="hidden"
                              onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'sponsors')}
                            />
                          </label>
                        </div>
                      </div>
                      {sponsors && (
                        <div className="mt-4">
                          <p className="text-sm text-white/50 mb-2 font-tech uppercase italic">Preview:</p>
                          <img src={sponsors} alt="Sponsors Preview" className="h-32 object-contain bg-[#111] border-2 border-[#333] p-2" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <label className="flex items-center gap-2 text-lg font-tech italic font-bold text-[#E427F5] uppercase tracking-widest">
                        Facebook Link
                      </label>
                      <input 
                        type="text" 
                        value={facebookLink}
                        onChange={e => setFacebookLink(e.target.value)}
                        className="w-full bg-[#111] border-2 border-[#333] px-4 py-3 text-white focus:outline-none focus:border-[#E427F5] transition-colors text-xl font-tech"
                        placeholder="e.g. https://facebook.com/..."
                      />
                    </div>

                    <div className="space-y-4">
                      <label className="flex items-center gap-2 text-lg font-tech italic font-bold text-[#E427F5] uppercase tracking-widest">
                        Instagram Link
                      </label>
                      <input 
                        type="text" 
                        value={instagramLink}
                        onChange={e => setInstagramLink(e.target.value)}
                        className="w-full bg-[#111] border-2 border-[#333] px-4 py-3 text-white focus:outline-none focus:border-[#E427F5] transition-colors text-xl font-tech"
                        placeholder="e.g. https://instagram.com/..."
                      />
                    </div>

                    <div className="space-y-4">
                      <label className="flex items-center gap-2 text-lg font-tech italic font-bold text-[#E427F5] uppercase tracking-widest">
                        YouTube Link
                      </label>
                      <input 
                        type="text" 
                        value={youtubeLink}
                        onChange={e => setYoutubeLink(e.target.value)}
                        className="w-full bg-[#111] border-2 border-[#333] px-4 py-3 text-white focus:outline-none focus:border-[#E427F5] transition-colors text-xl font-tech"
                        placeholder="e.g. https://youtube.com/..."
                      />
                    </div>

                    <div className="space-y-4">
                      <label className="flex items-center gap-2 text-lg font-tech italic font-bold text-[#E427F5] uppercase tracking-widest">
                        Event Date
                      </label>
                      <input 
                        type="text" 
                        value={eventDate}
                        onChange={e => setEventDate(e.target.value)}
                        className="w-full bg-[#111] border-2 border-[#333] px-4 py-3 text-white focus:outline-none focus:border-[#E427F5] transition-colors text-xl font-tech"
                        placeholder="e.g. To Be Announced (2026)"
                      />
                    </div>

                    <div className="space-y-4">
                      <label className="flex items-center gap-2 text-lg font-tech italic font-bold text-[#E427F5] uppercase tracking-widest">
                        Event Location
                      </label>
                      <input 
                        type="text" 
                        value={eventLocation}
                        onChange={e => setEventLocation(e.target.value)}
                        className="w-full bg-[#111] border-2 border-[#333] px-4 py-3 text-white focus:outline-none focus:border-[#E427F5] transition-colors text-xl font-tech"
                        placeholder="e.g. Royal MAS Arena, Colombo"
                      />
                    </div>

                    <div className="pt-6 border-t-2 border-[#333] flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-tech italic uppercase font-bold text-white mb-1">Reveal Status</h3>
                        <p className="text-sm text-white/50">Toggle whether the prize pool is visible to the public.</p>
                      </div>
                      <button
                        onClick={() => setIsRevealed(!isRevealed)}
                        className={`flex items-center gap-2 px-6 py-3 font-tech font-bold uppercase italic tracking-widest transition-colors border-2 ${isRevealed ? 'bg-red-500/20 text-red-400 border-red-500' : 'bg-green-500/20 text-green-400 border-green-500'}`}
                      >
                        {isRevealed ? <><EyeOff className="w-5 h-5" /> Hide Prizes</> : <><Eye className="w-5 h-5" /> Reveal Prizes</>}
                      </button>
                    </div>

                    <div className="pt-8 flex justify-end">
                      <button
                        onClick={handleSaveSettings}
                        disabled={savingSettings}
                        className="flex items-center gap-2 px-8 py-3 bg-[#E427F5] text-black font-tech font-bold uppercase italic tracking-widest hover:bg-white transition-colors transform -skew-x-12 disabled:opacity-50"
                      >
                        <span className="flex items-center gap-2 transform skew-x-12">
                          <Save className="w-5 h-5" />
                          {savingSettings ? 'Saving...' : 'Save Settings'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

        {/* Team Details Modal */}
        {selectedTeam && (
          <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm cursor-pointer"
            onClick={() => setSelectedTeam(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#0A0A0A] border-4 border-[#E427F5] w-full max-w-2xl overflow-hidden relative cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedTeam(null)}
                className="absolute top-4 right-4 text-white/60 hover:text-[#E427F5] transition-colors z-[110]"
              >
                <XCircle className="w-8 h-8" />
              </button>
              
              <div className="p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="bg-[#E427F5] text-black p-3">
                    <Users className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-tech font-bold uppercase italic tracking-tighter text-white leading-none">
                      {selectedTeam.teamName}
                    </h3>
                    <p className="text-[#E427F5] font-tech uppercase italic tracking-widest text-sm mt-1">Team Details</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="text-xs font-tech uppercase italic text-white/40 block mb-1">Robot Name</label>
                      <p className="text-xl font-bold text-white">{selectedTeam.robotName}</p>
                    </div>
                    <div>
                      <label className="text-xs font-tech uppercase italic text-white/40 block mb-1">Country</label>
                      <p className="text-xl font-bold text-white">{selectedTeam.country || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-tech uppercase italic text-white/40 block mb-1">Team Members</label>
                      <p className="text-3xl font-black text-[#E427F5]">{selectedTeam.memberCount || 1}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="text-xs font-tech uppercase italic text-white/40 block mb-1">Captain Name</label>
                      <p className="text-xl font-bold text-white">{selectedTeam.captainName}</p>
                    </div>
                    <div>
                      <label className="text-xs font-tech uppercase italic text-white/40 block mb-1">Email Address</label>
                      <p className="text-lg font-medium text-white break-all">{selectedTeam.email}</p>
                    </div>
                    <div>
                      <label className="text-xs font-tech uppercase italic text-white/40 block mb-1">Phone Number</label>
                      <p className="text-xl font-bold text-white">{selectedTeam.phone}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-12 pt-8 border-t border-[#333] flex flex-wrap gap-4 items-end">
                  <div className="flex-1">
                    <label className="text-xs font-tech uppercase italic text-white/40 block mb-1">Registration Date</label>
                    <p className="text-sm text-white/60">{new Date(selectedTeam.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-tech uppercase italic text-white/40 block mb-1">Current Status</label>
                    <p className={`text-sm font-bold uppercase italic ${selectedTeam.status === 'approved' ? 'text-green-500' : selectedTeam.status === 'rejected' ? 'text-red-500' : 'text-yellow-500'}`}>
                      {selectedTeam.status} {selectedTeam.participated && '(Participated)'}
                    </p>
                  </div>
                  <button 
                    onClick={() => setSelectedTeam(null)}
                    className="bg-[#333] text-white font-tech uppercase italic font-bold px-6 py-2 hover:bg-[#E427F5] hover:text-black transition-colors transform -skew-x-12"
                  >
                    <span className="block transform skew-x-12">Close</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  </div>
);
}
