import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, ChevronRight } from 'lucide-react';

export default function Footer() {
  const [facebookLink, setFacebookLink] = useState('https://www.facebook.com/profile.php?id=61573020699132');
  const [instagramLink, setInstagramLink] = useState('#');
  const [youtubeLink, setYoutubeLink] = useState('#');
  const [eventDate, setEventDate] = useState('2026 Season');
  const [eventLocation, setEventLocation] = useState('Colombo, Sri Lanka');

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.facebookLink) setFacebookLink(data.facebookLink);
        if (data.instagramLink) setInstagramLink(data.instagramLink);
        if (data.youtubeLink) setYoutubeLink(data.youtubeLink);
        if (data.eventDate) setEventDate(data.eventDate);
        if (data.eventLocation) setEventLocation(data.eventLocation);
      })
      .catch(console.error);
  }, []);

  return (
    <footer className="relative z-30 bg-[#0A0A0A] py-16 px-6 md:px-12 border-t-8 border-[#333]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-2">
          <h2 className="text-5xl font-tech font-black italic text-white uppercase tracking-tighter mb-4">BOT BASH</h2>
          <p className="text-gray-400 text-lg max-w-md leading-relaxed font-medium">
            Sri Lanka’s premier international robo battle championship. Organized by Tech to Oxygen, bringing together the brightest minds in robotics for the ultimate combat experience.
          </p>
        </div>
        
        <div>
          <h4 className="text-white font-tech text-3xl font-bold italic uppercase tracking-widest mb-6">EVENT</h4>
          <ul className="space-y-4 text-gray-400 font-medium">
            <li className="flex items-center gap-3"><Calendar className="w-5 h-5 text-[#E427F5]" /> {eventDate}</li>
            <li className="flex items-center gap-3"><MapPin className="w-5 h-5 text-[#E427F5]" /> {eventLocation}</li>
            <li className="flex items-center gap-3"><Users className="w-5 h-5 text-[#E427F5]" /> Tech to Oxygen</li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-tech text-3xl font-bold italic uppercase tracking-widest mb-6">CONNECT</h4>
          <ul className="space-y-4 text-gray-400 font-medium uppercase tracking-wider">
            <li><a href={facebookLink} target="_blank" rel="noreferrer" className="hover:text-[#E427F5] transition-colors flex items-center gap-2"><ChevronRight className="w-4 h-4"/> Facebook</a></li>
            <li><a href={instagramLink} target="_blank" rel="noreferrer" className="hover:text-[#E427F5] transition-colors flex items-center gap-2"><ChevronRight className="w-4 h-4"/> Instagram</a></li>
            <li><a href={youtubeLink} target="_blank" rel="noreferrer" className="hover:text-[#E427F5] transition-colors flex items-center gap-2"><ChevronRight className="w-4 h-4"/> YouTube</a></li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t-2 border-[#333] flex flex-col md:flex-row justify-between items-center text-gray-500 font-medium uppercase text-sm tracking-wider">
        <p>© 2026 BOT BASH. ALL RIGHTS RESERVED.</p>
        <div className="mt-4 md:mt-0 space-x-8">
          <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
        </div>
      </div>
    </footer>
  );
}
