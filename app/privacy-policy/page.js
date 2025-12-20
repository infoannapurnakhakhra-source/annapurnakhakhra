"use client";

import React,{useEffect} from 'react';
import { Shield, User, Database, Lock, FileText, Eye, Mail, Scale } from 'lucide-react';

export default function PrivacyPolicy() {

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-[#fffcfa] py-20 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="text-center pb-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-amber-900 leading-snug">
              Privacy Policy – Annapurna Khakhra
            </h1>

            <p className="text-base sm:text-lg text-amber-800 leading-snug mx-auto pt-3">
              Your privacy matters to us. We are committed to protecting your personal data and being fully transparent about how your information is collected and used.
            </p>
          </div>

          <div className="bg-[#faebd75c] border-l-4 border-amber-600 p-6 rounded-r-lg">
            <h2 className="text-3xl font-bold text-amber-900 leading-snug mb-1">Overview</h2>
            <p className="text-base sm:text-lg text-amber-900 leading-snug">
              This Privacy Policy explains how Annapurna Khakhra collects, uses, and protects your personal information while you interact with our platform.
            </p>
            <p className="text-base sm:text-lg text-amber-900 leading-snug mt-2">
              Last Updated: <strong>01 December 2025</strong>
            </p>
          </div>
        </div>

        {/* 1. Personal Information We Collect */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center mb-4">
            <Database className="text-amber-900 mr-3" size={28} />
            <h2 className="text-2xl font-bold text-amber-900 leading-snug">
              1. Personal Information We Collect
            </h2>
          </div>

          <ul className="space-y-3 ml-6">
            {[
              "Full name",
              "Contact number",
              "Delivery address",
              "Email ID",
              "Order history",
              "Payment-related data (processed securely through payment gateway)",
              "Device information (browser, IP address)",
            ].map((item, index) => (
              <li key={index} className="text-amber-600 flex items-start">
                <span className="text-amber-900 mr-2">•</span>{item}
              </li>
            ))}
          </ul>

          <p className="text-xl font-bold text-amber-700 mt-6">Automatically Collected Data:</p>

          <ul className="space-y-3 ml-6 mt-3">
            {[
              "Cookies",
              "Analytics tools",
              "Website interaction tracking",
            ].map((item, index) => (
              <li key={index} className="text-amber-600 flex items-start">
                <span className="text-amber-900 mr-2">•</span>{item}
              </li>
            ))}
          </ul>
        </div>

        {/* 2. Why We Collect Information */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center mb-4">
            <Eye className="text-amber-900 mr-3" size={28} />
            <h2 className="text-2xl font-bold text-amber-900 leading-snug">
              2. Why We Collect Your Information
            </h2>
          </div>

          <ul className="space-y-3 ml-6">
            {[
              "Process orders",
              "Deliver products",
              "Communicate updates, offers, and promotions",
              "Provide customer support",
              "Improve website performance",
              "Maintain security and prevent fraud",
              "We never sell customer information to third parties",
            ].map((item, index) => (
              <li key={index} className="text-amber-600 flex items-start">
                <span className="text-amber-900 mr-2">•</span>{item}
              </li>
            ))}
          </ul>
        </div>

        {/* 3. Cookies & Tracking */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center mb-4">
            <FileText className="text-amber-900 mr-3" size={28} />
            <h2 className="text-2xl font-bold text-amber-900 leading-snug">3. Cookies & Tracking Technologies</h2>
          </div>

          <p className="text-amber-700 mb-4">Cookies help us:</p>

          <ul className="space-y-3 ml-6">
            {[
              "Identify repeat customers",
              "Track cart details",
              "Improve site loading speed",
              "Personalize your browsing experience",
              "Analyze visitor behaviour",
            ].map((item, index) => (
              <li key={index} className="text-amber-600 flex items-start">
                <span className="text-amber-900 mr-2">•</span>{item}
              </li>
            ))}
          </ul>

          <p className="text-amber-700 mt-4">
            You may disable cookies anytime; however, some website features may not work properly.
          </p>
        </div>

        {/* 4. How We Protect */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center mb-4">
            <Lock className="text-amber-900 mr-3" size={28} />
            <h2 className="text-2xl font-bold text-amber-900 leading-snug">
              4. How We Protect Your Information
            </h2>
          </div>

          <ul className="space-y-3 ml-6">
            {[
              "Encrypted servers",
              "SSL certificates",
              "Secure payment gateways",
              "Firewall protection",
              "Role-based data access",
              "No human at Annapurna Khakhra ever sees your card details",
            ].map((item, index) => (
              <li key={index} className="text-amber-600 flex items-start">
                <span className="text-amber-900 mr-2">•</span>{item}
              </li>
            ))}
          </ul>
        </div>

        {/* 5. Sharing */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center mb-4">
            <Shield className="text-amber-900 mr-3" size={28} />
            <h2 className="text-2xl font-bold text-amber-900 leading-snug">
              5. Sharing of Information
            </h2>
          </div>

          <p className="text-amber-700 mb-4">We only share limited information with:</p>

          <ul className="space-y-3 ml-6">
            {[
              "Courier partners (delivery only)",
              "Payment gateways (for secure transactions)",
              "Analytics tools (for improving site performance)",
            ].map((item, index) => (
              <li key={index} className="text-amber-600 flex items-start">
                <span className="text-amber-900 mr-2">•</span>{item}
              </li>
            ))}
          </ul>
        </div>

        {/* 6. Customer Rights */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center mb-4">
            <User className="text-amber-900 mr-3" size={28} />
            <h2 className="text-2xl font-bold text-amber-900 leading-snug">6. Customer Rights</h2>
          </div>

          <ul className="space-y-3 ml-6">
            {[
              "Request a copy of your stored data",
              "Correct incorrect details",
              "Request deletion of your information",
              "Opt-out from promotional messages",
            ].map((item, index) => (
              <li key={index} className="text-amber-600 flex items-start">
                <span className="text-amber-900 mr-2">•</span>{item}
              </li>
            ))}
          </ul>
        </div>

        {/* 7. Policy Updates */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-amber-900 leading-snug">7. Policy Updates</h2>
          <p className="text-amber-600 leading-relaxed">
            We may update this Privacy Policy periodically. All changes will be posted on this page.
          </p>
        </div>

        {/* 8. Contact */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center mb-4">
            <Mail className="text-amber-900 mr-3" size={28} />
            <h2 className="text-2xl font-bold text-amber-900 leading-snug">8. Contact Us</h2>
          </div>

          <p className="text-amber-600 mt-2 text-lg">
            📧 <strong>info.annapurnakhakhara@gmail.com</strong>
          </p>
          <p className="text-amber-600 text-lg">
            📞 <strong>+91-9313869017</strong>
          </p>
        </div>

      </div>
    </div>
  );
}
