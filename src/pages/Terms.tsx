import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

export default function Terms() {
  const [logoSize, setLogoSize] = useState(() => localStorage.getItem('logoSize') || '14');

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
  }, []);

  const headerHeight = (parseInt(logoSize) * 4) + 24;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans">
      <SEO title="Terms of Service" description="Terms of service for BOT BASH participants and visitors." />
      <motion.header 
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
      </motion.header>

      <main className="pb-24 px-6 md:px-12 max-w-4xl mx-auto" style={{ paddingTop: `${headerHeight + 32}px` }}>
        <h1 className="text-4xl md:text-6xl font-tech font-black italic uppercase tracking-tighter mb-8 text-[#E427F5]">
          Terms of Service
        </h1>
        
        <div className="space-y-8 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-tech font-bold uppercase italic mb-4 text-white">1. Acceptance of Terms</h2>
            <p>
              By registering for and participating in Bot Bash, you agree to be bound by these Terms of Service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-tech font-bold uppercase italic mb-4 text-white">2. Eligibility and Registration</h2>
            <p>
              Participation is open to teams worldwide. All participants must provide accurate, current, and complete information during the registration process. The organizing committee reserves the right to reject any application or disqualify any team at their sole discretion.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-tech font-bold uppercase italic mb-4 text-white">3. Safety and Conduct</h2>
            <p>
              Safety is our top priority. All robots must pass a strict safety inspection before being allowed into the arena. Participants must adhere to the official ruleset and follow instructions from referees and safety personnel at all times. Unsportsmanlike conduct or failure to comply with safety guidelines will result in immediate disqualification.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-tech font-bold uppercase italic mb-4 text-white">4. Media and Broadcasting Rights</h2>
            <p>
              By participating in Bot Bash, you grant Tech to Oxygen and its partners the right to photograph, record, and broadcast your team, robot, and matches. You agree that these materials may be used for promotional, commercial, or educational purposes without compensation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-tech font-bold uppercase italic mb-4 text-white">5. Liability Waiver</h2>
            <p>
              Combat robotics involves inherent risks. By participating, you acknowledge these risks and agree to hold harmless Tech to Oxygen, the venue, sponsors, and staff from any liability for personal injury, property damage, or loss incurred during the event.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
