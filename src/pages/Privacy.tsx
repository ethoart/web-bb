import React from 'react';
import { motion } from 'framer-motion';
import Footer from '../components/Footer';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans">
      <motion.header 
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
      </motion.header>

      <main className="pt-40 pb-24 px-6 md:px-12 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-tech font-black italic uppercase tracking-tighter mb-8 text-[#E427F5]">
          Privacy Policy
        </h1>
        
        <div className="space-y-8 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-tech font-bold uppercase italic mb-4 text-white">1. Information We Collect</h2>
            <p>
              When you register for Bot Bash, we collect personal information such as your name, email address, phone number, and team details. We also collect information about your robot for competition categorization and safety checks.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-tech font-bold uppercase italic mb-4 text-white">2. How We Use Your Information</h2>
            <p>
              We use the information we collect to manage your registration, communicate important event updates, ensure safety compliance, and facilitate the competition. Your email will be used to send you your official QR code pass and other event-related announcements.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-tech font-bold uppercase italic mb-4 text-white">3. Information Sharing</h2>
            <p>
              We do not sell or rent your personal information to third parties. We may share your team name and robot details publicly on our website, social media, and during the live event broadcast. Contact information is kept strictly confidential and shared only with event organizers and safety personnel.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-tech font-bold uppercase italic mb-4 text-white">4. Data Security</h2>
            <p>
              We implement reasonable security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, no internet transmission is completely secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-tech font-bold uppercase italic mb-4 text-white">5. Contact Us</h2>
            <p>
              If you have any questions or concerns about this Privacy Policy, please contact us through our official social media channels or reach out to the Tech to Oxygen organizing committee.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
