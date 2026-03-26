import React, { useEffect, useState } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Users, Settings, Trophy, Eye, EyeOff, Save, RefreshCw, CheckCircle2, XCircle, Mail, QrCode, ScanLine, Image, Link as LinkIcon, Upload, Trash2, Camera, Info } from 'lucide-react';
import { Html5Qrcode, Html5QrcodeScanner } from 'html5-qrcode';
import SEO from '../components/SEO';

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
  const [sponsors, setSponsors] = useState<string[]>([]);
  const [facebookLink, setFacebookLink] = useState('https://www.facebook.com/profile.php?id=61573020699132');
  const [instagramLink, setInstagramLink] = useState('#');
  const [youtubeLink, setYoutubeLink] = useState('#');
  const [eventDate, setEventDate] = useState('To Be Announced (2026)');
  const [eventLocation, setEventLocation] = useState('Royal MAS Arena, Colombo');
  const [bannerText, setBannerText] = useState('COMING SOON');
  const [logoSize, setLogoSize] = useState(() => localStorage.getItem('logoSize') || '14');
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
  const [galleryMediaType, setGalleryMediaType] = useState<'image' | 'video'>('image');
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
        else setSponsors(prev => [...prev, data.url]);
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
      if (setData.sponsors) {
        setSponsors(Array.isArray(setData.sponsors) ? setData.sponsors : (typeof setData.sponsors === 'string' ? setData.sponsors.split(',') : []));
      }
      if (setData.facebookLink) setFacebookLink(setData.facebookLink);
      if (setData.instagramLink) setInstagramLink(setData.instagramLink);
      if (setData.youtubeLink) setYoutubeLink(setData.youtubeLink);
      if (setData.eventDate) setEventDate(setData.eventDate);
      if (setData.eventLocation) setEventLocation(setData.eventLocation);
      if (setData.bannerText) setBannerText(setData.bannerText);
      if (setData.logoSize) {
        setLogoSize(setData.logoSize);
        localStorage.setItem('logoSize', setData.logoSize);
      }

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

  const handleRobotStatusChange = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/registrations/${id}/robot-status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchData();
        // Update selected team if it's the one being modified
        if (selectedTeam && selectedTeam._id === id) {
          setSelectedTeam({ ...selectedTeam, robotStatus: status });
        }
      }
    } catch (err) {
      console.error('Error updating robot status:', err);
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
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'bannerText', value: bannerText })
      });
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'logoSize', value: logoSize })
      });
      localStorage.setItem('logoSize', logoSize);
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
        body: JSON.stringify({ url: galleryLink, mediaType: galleryMediaType })
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
      formData.append('mediaType', galleryMediaType);
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

  const headerHeight = (parseInt(logoSize) * 4) + 24;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans">
      <SEO title="Admin Dashboard" description="Manage registrations, site settings, and gallery for BOT BASH." />
      {/* Fixed Admin Header */}
      <header 
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
          <h1 className="text-xl md:text-2xl font-tech font-bold uppercase italic tracking-widest text-[#E427F5] hidden sm:block">Admin</h1>
        </div>
        <Link to="/" className="font-tech text-lg uppercase italic hover:text-[#E427F5] transition-colors">Back to Site</Link>
      </header>

      <div className="flex" style={{ paddingTop: `${headerHeight}px` }}>
        {/* Sidebar */}
        <aside 
          className="w-64 bg-black border-r-4 border-[#333] p-6 fixed border-t-0 overflow-y-auto hidden md:block"
          style={{ 
            top: `${headerHeight}px`, 
            height: `calc(100vh - ${headerHeight}px)` 
          }}
        >
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

                  {/* Desktop Table View */}
                  <div className="bg-black border-2 border-[#333] overflow-x-auto hidden lg:block">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                      <thead>
                        <tr className="bg-[#111] border-b-2 border-[#333]">
                          <th className="p-4 font-tech italic text-[#E427F5] uppercase tracking-wider text-sm">Team</th>
                          <th className="p-4 font-tech italic text-[#E427F5] uppercase tracking-wider text-sm">Robot</th>
                          <th className="p-4 font-tech italic text-[#E427F5] uppercase tracking-wider text-sm">Country</th>
                          <th className="p-4 font-tech italic text-[#E427F5] uppercase tracking-wider text-sm">Contact</th>
                          <th className="p-4 font-tech italic text-[#E427F5] uppercase tracking-wider text-sm">Status</th>
                          <th className="p-4 font-tech italic text-[#E427F5] uppercase tracking-wider text-sm">Robot Status</th>
                          <th className="p-4 font-tech italic text-[#E427F5] uppercase tracking-wider text-sm">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {registrations.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="p-8 text-center text-white/40 font-tech italic uppercase">No registrations yet.</td>
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
                                <div className="font-medium text-white/90">{reg.captainName}</div>
                                <div className="text-xs">{reg.email}</div>
                              </td>
                              <td className="p-4 text-sm font-tech uppercase italic">
                                {reg.status === 'pending' && <span className="text-yellow-500 font-bold">PENDING</span>}
                                {reg.status === 'approved' && <span className="text-green-500 font-bold">APPROVED</span>}
                                {reg.status === 'rejected' && <span className="text-red-500 font-bold">REJECTED</span>}
                                {reg.participated && <div className="text-[10px] text-[#E427F5] mt-1">PARTICIPATED</div>}
                              </td>
                              <td className="p-4 text-sm font-tech uppercase italic">
                                {reg.robotStatus === 'pending' && <span className="text-yellow-500 font-bold">PENDING</span>}
                                {reg.robotStatus === 'approved' && <span className="text-green-500 font-bold">APPROVED</span>}
                                {reg.robotStatus === 'rejected' && <span className="text-red-500 font-bold">REJECTED</span>}
                                {!reg.robotStatus && <span className="text-gray-500 font-bold italic">NOT REGISTERED</span>}
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

                  {/* Mobile Card View */}
                  <div className="lg:hidden space-y-4">
                    {registrations.length === 0 ? (
                      <div className="bg-black border-2 border-[#333] p-8 text-center text-white/40 font-tech italic uppercase">
                        No registrations yet.
                      </div>
                    ) : (
                      registrations.map((reg, i) => (
                        <div key={i} className="bg-black border-2 border-[#333] p-4 space-y-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <button 
                                onClick={() => setSelectedTeam(reg)}
                                className="text-xl font-bold text-[#E427F5] hover:text-white transition-colors text-left block"
                              >
                                {reg.teamName}
                              </button>
                              <p className="text-white/60 font-tech uppercase italic text-xs mt-1">Robot: {reg.robotName}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span className={`text-[10px] font-tech uppercase italic font-bold px-2 py-0.5 border ${
                                reg.status === 'approved' ? 'text-green-500 border-green-500' : 
                                reg.status === 'rejected' ? 'text-red-500 border-red-500' : 
                                'text-yellow-500 border-yellow-500'
                              }`}>
                                {reg.status}
                              </span>
                              {reg.participated && <span className="text-[8px] text-[#E427F5] font-tech uppercase italic">Participated</span>}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-white/40 text-[10px] uppercase font-tech italic">Captain</p>
                              <p className="text-white/80 truncate">{reg.captainName}</p>
                            </div>
                            <div>
                              <p className="text-white/40 text-[10px] uppercase font-tech italic">Country</p>
                              <p className="text-white/80">{reg.country || 'N/A'}</p>
                            </div>
                          </div>

                          <div className="pt-4 border-t border-[#333] flex justify-between items-center">
                            <div className="flex gap-2">
                              {reg.status === 'pending' && (
                                <>
                                  <button 
                                    onClick={() => handleStatusChange(reg._id, 'approved')}
                                    className="p-2 bg-green-500/20 text-green-400 border border-green-500"
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => handleStatusChange(reg._id, 'rejected')}
                                    className="p-2 bg-red-500/20 text-red-400 border border-red-500"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                              <button 
                                onClick={() => handleDeleteRegistration(reg._id)}
                                className="p-2 bg-red-900/20 text-red-500 border border-red-900"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <button 
                              onClick={() => setSelectedTeam(reg)}
                              className="text-[#E427F5] font-tech uppercase italic text-xs font-bold"
                            >
                              View Full Details
                            </button>
                          </div>
                        </div>
                      ))
                    )}
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
                        <Upload className="w-5 h-5 text-[#E427F5]" /> Upload Media
                      </h3>
                      <form onSubmit={handleUploadGalleryFile} className="space-y-4">
                        <div className="flex gap-4 mb-4">
                          <button
                            type="button"
                            onClick={() => setGalleryMediaType('image')}
                            className={`flex-1 py-2 font-tech uppercase italic border-2 transition-colors ${galleryMediaType === 'image' ? 'bg-[#E427F5] text-black border-[#E427F5]' : 'bg-black text-white/60 border-[#333]'}`}
                          >
                            Image
                          </button>
                          <button
                            type="button"
                            onClick={() => setGalleryMediaType('video')}
                            className={`flex-1 py-2 font-tech uppercase italic border-2 transition-colors ${galleryMediaType === 'video' ? 'bg-[#E427F5] text-black border-[#E427F5]' : 'bg-black text-white/60 border-[#333]'}`}
                          >
                            Video
                          </button>
                        </div>
                        <input 
                          type="file" 
                          accept={galleryMediaType === 'image' ? "image/*" : "video/*"}
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
                        <LinkIcon className="w-5 h-5 text-[#E427F5]" /> Add Media Link
                      </h3>
                      <form onSubmit={handleAddGalleryLink} className="space-y-4">
                        <div className="flex gap-4 mb-4">
                          <button
                            type="button"
                            onClick={() => setGalleryMediaType('image')}
                            className={`flex-1 py-2 font-tech uppercase italic border-2 transition-colors ${galleryMediaType === 'image' ? 'bg-[#E427F5] text-black border-[#E427F5]' : 'bg-black text-white/60 border-[#333]'}`}
                          >
                            Image
                          </button>
                          <button
                            type="button"
                            onClick={() => setGalleryMediaType('video')}
                            className={`flex-1 py-2 font-tech uppercase italic border-2 transition-colors ${galleryMediaType === 'video' ? 'bg-[#E427F5] text-black border-[#E427F5]' : 'bg-black text-white/60 border-[#333]'}`}
                          >
                            Video
                          </button>
                        </div>
                        <input 
                          type="url" 
                          placeholder={galleryMediaType === 'image' ? "https://example.com/image.jpg" : "https://example.com/video.mp4"}
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
                          {img.mediaType === 'video' ? (
                            <div className="w-full h-full flex items-center justify-center bg-[#111] text-[#E427F5]">
                              <Camera className="w-12 h-12" />
                            </div>
                          ) : (
                            <img 
                              src={img.url} 
                              alt="Gallery" 
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              referrerPolicy="no-referrer"
                            />
                          )}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button 
                              onClick={() => handleDeleteGalleryImage(img._id)}
                              className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600 transition-colors transform hover:scale-110"
                              title="Delete Item"
                            >
                              <Trash2 className="w-6 h-6" />
                            </button>
                          </div>
                          <div className="absolute bottom-0 left-0 w-full bg-black/80 p-2 text-[10px] font-tech uppercase italic text-[#E427F5] flex justify-between items-center">
                            <span>{img.type}</span>
                            <span className="bg-[#E427F5] text-black px-1 font-bold">{img.mediaType}</span>
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
                        Banner "Coming Soon" Text
                      </label>
                      <input 
                        type="text" 
                        value={bannerText}
                        onChange={e => setBannerText(e.target.value)}
                        className="w-full bg-[#111] border-2 border-[#333] px-4 py-3 text-white focus:outline-none focus:border-[#E427F5] transition-colors text-xl font-tech"
                        placeholder="e.g. COMING SOON"
                      />
                    </div>

                    <div className="space-y-4">
                      <label className="flex items-center gap-2 text-lg font-tech italic font-bold text-[#E427F5] uppercase tracking-widest">
                        Sponsor Logos
                      </label>
                      <div className="flex flex-col gap-4">
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            id="newSponsorUrl"
                            className="flex-1 bg-[#111] border-2 border-[#333] px-4 py-3 text-white focus:outline-none focus:border-[#E427F5] transition-colors text-sm font-tech"
                            placeholder="Logo URL: https://example.com/logo.png"
                          />
                          <button
                            onClick={() => {
                              const input = document.getElementById('newSponsorUrl') as HTMLInputElement;
                              if (input.value) {
                                setSponsors(prev => [...prev, input.value]);
                                input.value = '';
                              }
                            }}
                            className="bg-[#E427F5] text-black px-4 font-tech font-bold uppercase italic"
                          >
                            Add
                          </button>
                        </div>
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
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                        {sponsors.map((url, idx) => (
                          <div key={idx} className="relative group bg-[#111] border-2 border-[#333] p-2">
                            <img src={url} alt={`Sponsor ${idx}`} className="h-20 w-full object-contain" />
                            <button
                              onClick={() => setSponsors(prev => prev.filter((_, i) => i !== idx))}
                              className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
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

                    <div className="space-y-4">
                      <label className="flex items-center gap-2 text-lg font-tech italic font-bold text-[#E427F5] uppercase tracking-widest">
                        Logo Size (Desktop)
                      </label>
                      <div className="flex items-center gap-4">
                        <input 
                          type="range" 
                          min="6" 
                          max="48" 
                          step="1"
                          value={logoSize}
                          onChange={e => setLogoSize(e.target.value)}
                          className="flex-1 accent-[#E427F5]"
                        />
                        <span className="font-tech text-2xl text-white w-12 text-center">{logoSize}</span>
                      </div>
                      <p className="text-xs text-white/40 font-tech uppercase italic">Adjust the height of the logo in the header (rem units equivalent).</p>
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
            className="fixed inset-0 z-[100] flex items-start justify-center p-4 md:p-8 bg-black/90 backdrop-blur-sm cursor-pointer overflow-y-auto"
            onClick={() => setSelectedTeam(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#0A0A0A] border-4 border-[#E427F5] w-full max-w-3xl relative cursor-default my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedTeam(null)}
                className="absolute top-4 right-4 text-white/60 hover:text-[#E427F5] transition-colors z-[110]"
              >
                <XCircle className="w-8 h-8" />
              </button>
              
              <div className="p-4 md:p-8">
                <div className="flex items-center gap-4 mb-6 md:mb-8">
                  <div className="bg-[#E427F5] text-black p-2 md:p-3">
                    <Users className="w-6 h-6 md:w-8 md:h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl md:text-3xl font-tech font-bold uppercase italic tracking-tighter text-white leading-none">
                      {selectedTeam.teamName}
                    </h3>
                    <p className="text-[#E427F5] font-tech uppercase italic tracking-widest text-xs md:text-sm mt-1">Team Details</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  <div className="space-y-4 md:space-y-6">
                    <div>
                      <label className="text-[10px] md:text-xs font-tech uppercase italic text-white/40 block mb-1">Robot Name</label>
                      <p className="text-lg md:text-xl font-bold text-white">{selectedTeam.robotName}</p>
                    </div>
                    <div>
                      <label className="text-[10px] md:text-xs font-tech uppercase italic text-white/40 block mb-1">Country</label>
                      <p className="text-lg md:text-xl font-bold text-white">{selectedTeam.country || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-[10px] md:text-xs font-tech uppercase italic text-white/40 block mb-1">Team Members</label>
                      <p className="text-2xl md:text-3xl font-black text-[#E427F5]">{selectedTeam.memberCount || 1}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4 md:space-y-6">
                    <div>
                      <label className="text-[10px] md:text-xs font-tech uppercase italic text-white/40 block mb-1">Captain Name</label>
                      <p className="text-lg md:text-xl font-bold text-white">{selectedTeam.captainName}</p>
                    </div>
                    <div>
                      <label className="text-[10px] md:text-xs font-tech uppercase italic text-white/40 block mb-1">Email Address</label>
                      <p className="text-base md:text-lg font-medium text-white break-all">{selectedTeam.email}</p>
                    </div>
                    <div>
                      <label className="text-[10px] md:text-xs font-tech uppercase italic text-white/40 block mb-1">Phone Number</label>
                      <p className="text-lg md:text-xl font-bold text-white">{selectedTeam.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Robot Registration Details */}
                <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-[#333]">
                  <h4 className="text-base md:text-lg font-tech font-bold uppercase italic text-[#E427F5] mb-4">Robot Registration Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    <div className="space-y-3 md:space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-tech uppercase italic text-white/40 block mb-1">Height</label>
                          <p className="text-white font-medium text-sm">{selectedTeam.robotHeight ? `${selectedTeam.robotHeight} cm` : 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-[10px] font-tech uppercase italic text-white/40 block mb-1">Weight</label>
                          <p className="text-white font-medium text-sm">{selectedTeam.robotWeight ? `${selectedTeam.robotWeight} kg` : 'N/A'}</p>
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-tech uppercase italic text-white/40 block mb-1">Dimensions</label>
                        <p className="text-white font-medium text-sm">{selectedTeam.robotDimensions || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-[10px] font-tech uppercase italic text-white/40 block mb-1">Materials</label>
                        <p className="text-white font-medium text-sm">{selectedTeam.robotMaterials || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-[10px] font-tech uppercase italic text-white/40 block mb-1">Power Source</label>
                        <p className="text-white font-medium text-sm">{selectedTeam.robotPowerSource || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-[10px] font-tech uppercase italic text-white/40 block mb-1">Weapons</label>
                        <p className="text-white font-medium text-sm">{selectedTeam.robotWeapons || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-[10px] font-tech uppercase italic text-white/40 block mb-1">Additional Info</label>
                        <p className="text-white font-medium text-xs">{selectedTeam.robotAdditionalInfo || 'None'}</p>
                      </div>
                      <div>
                        <label className="text-[10px] font-tech uppercase italic text-white/40 block mb-1">Robot Status</label>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 text-[10px] font-tech uppercase italic font-bold ${
                            selectedTeam.robotStatus === 'approved' ? 'bg-green-500/20 text-green-400 border border-green-500' :
                            selectedTeam.robotStatus === 'rejected' ? 'bg-red-500/20 text-red-400 border border-red-500' :
                            'bg-yellow-500/20 text-yellow-400 border border-yellow-500'
                          }`}>
                            {selectedTeam.robotStatus || 'pending'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => handleRobotStatusChange(selectedTeam._id, 'approved')}
                          className="flex-1 bg-[#22C55E] text-black font-tech uppercase italic font-bold py-2 text-[10px] md:text-sm hover:bg-white transition-colors"
                        >
                          Approve Robot
                        </button>
                        <button
                          onClick={() => handleRobotStatusChange(selectedTeam._id, 'rejected')}
                          className="flex-1 bg-red-500 text-black font-tech uppercase italic font-bold py-2 text-[10px] md:text-sm hover:bg-white transition-colors"
                        >
                          Reject Robot
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-tech uppercase italic text-white/40 block mb-2">Robot Image</label>
                      {selectedTeam.robotImage ? (
                        <div className="border-2 border-[#333] p-2 bg-[#111]">
                          <img 
                            src={selectedTeam.robotImage} 
                            alt="Robot" 
                            className="w-full h-32 md:h-48 object-contain"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-32 md:h-48 border-2 border-dashed border-[#333] flex items-center justify-center text-white/20 font-tech uppercase italic text-xs">
                          No Image Uploaded
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-[#333] flex flex-wrap gap-4 items-end">
                  <div className="flex-1 min-w-[120px]">
                    <label className="text-[10px] font-tech uppercase italic text-white/40 block mb-1">Registration Date</label>
                    <p className="text-[10px] md:text-sm text-white/60">{new Date(selectedTeam.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex-1 min-w-[120px]">
                    <label className="text-[10px] font-tech uppercase italic text-white/40 block mb-1">Current Status</label>
                    <p className={`text-xs md:text-sm font-bold uppercase italic ${selectedTeam.status === 'approved' ? 'text-green-500' : selectedTeam.status === 'rejected' ? 'text-red-500' : 'text-yellow-500'}`}>
                      {selectedTeam.status} {selectedTeam.participated && '(Participated)'}
                    </p>
                  </div>
                  <button 
                    onClick={() => setSelectedTeam(null)}
                    className="w-full md:w-auto bg-[#333] text-white font-tech uppercase italic font-bold px-6 py-2 hover:bg-[#E427F5] hover:text-black transition-colors transform -skew-x-12"
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
