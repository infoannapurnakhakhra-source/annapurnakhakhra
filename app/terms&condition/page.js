"use client";

import React, { useEffect } from 'react';
import { Home, Heart, Package, Truck, Shield, AlertTriangle, Phone, Mail, MapPin, Clock, Users, Scale } from 'lucide-react';

export default function TermsAndConditions() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-16 pb-12 px-5 bg-gradient-to-b from-amber-50 via-orange-50 to-amber-100 min-h-screen">
      <div className="max-w-4xl mx-auto">

        {/* Header – No Image */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-10 border-4 border-amber-200 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-amber-900 mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
            Annapurna Khakhra
          </h1>
          <h2 className="text-3xl md:text-4xl font-bold text-amber-800 mb-2">Terms & Conditions</h2>
          <p className="text-lg text-amber-700">Last Updated: 01 December 2025</p>
          <p className="mt-6 text-amber-800 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            Welcome to our loving home of handmade khakhra. By using our website or placing an order, you agree to these terms with trust and warmth.
          </p>
        </div>

        {/* Compact Cards */}
        <div className="space-y-8">

          {/* 1 */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-amber-200">
            <div className="flex items-center mb-4">
              <Home className="text-amber-600 mr-3" size={28} />
              <h2 className="text-2xl font-bold text-amber-900">1. Company Overview & Business Nature</h2>
            </div>
            <p className="text-amber-800">We are a women-led Gruh Udhyog proudly making fresh handmade khakhra, flavoured varieties, and traditional roasted snacks in small batches with pure love and hygiene.</p>
          </div>

          {/* 2 */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-amber-200">
            <div className="flex items-center mb-4">
              <Heart className="text-amber-600 mr-3" size={28} />
              <h2 className="text-2xl font-bold text-amber-900">2. Acceptance of Terms</h2>
            </div>
            <p className="text-amber-800">By using our website or services, you fully accept these Terms & Conditions.</p>
          </div>

          {/* 3 */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-amber-200">
            <div className="flex items-center mb-4">
              <Users className="text-amber-600 mr-3" size={28} />
              <h2 className="text-2xl font-bold text-amber-900">3. Eligibility &  sponsibility</h2>
            </div>
            <p className="text-amber-800">You must be 18+, provide accurate details, check ingredients & allergens, and store products properly after delivery.</p>
          </div>

          {/* 4 */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-amber-200">
            <div className="flex items-center mb-4">
              <Shield className="text-amber-600 mr-3" size={28} />
              <h2 className="text-2xl font-bold text-amber-900">4. Website Content & Intellectual Property</h2>
            </div>
            <p className="text-amber-800">All content belongs to Annapurna Khakhra. Copying or distribution without permission is not allowed.</p>
          </div>

          {/* 5 */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-amber-200">
            <div className="flex items-center mb-4">


              <Package className="text-amber-600 mr-3" size={28} />
              <h2 className="text-2xl font-bold text-amber-900">5. Product Information & Accuracy</h2>
            </div>
            <p className="text-amber-800">Being 100% handmade, slight variations in shape, texture, or flavour may occur. Photos are indicative.</p>
          </div>

          {/* 6 */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-amber-200">
            <div className="flex items-center mb-4">
              <Truck className="text-amber-600 mr-3" size={28} />
              <h2 className="text-2xl font-bold text-amber-900">6. Pricing, Payment & Order Confirmation</h2>
            </div>
            <p className="text-amber-800">Prices may change • We accept COD & Bank Transfer • Orders are confirmed only after payment & stock check.</p>
          </div>

          {/* 7 */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-amber-200">
            <div className="flex items-center mb-4">
              <Clock className="text-amber-600 mr-3" size={28} />
              <h2 className="text-2xl font-bold text-amber-900">7. Shipping & Delivery</h2>
            </div>
            <p className="text-amber-800">Delivery times are estimates. We are not responsible for courier delays or external factors.</p>
          </div>

          {/* 8 */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-amber-200">
            <div className="flex items-center mb-4">
              <AlertTriangle className="text-amber-600 mr-3" size={28} />
              <h2 className="text-2xl font-bold text-amber-900">8. Returns, Refunds & Replacements</h2>
            </div>
            <p className="text-amber-800">Food items cannot be returned once opened or delivered (except manufacturing defects, handled case-by-case).</p>
          </div>

          {/* 9 */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-amber-200">
            <div className="flex items-center mb-4">
              <Shield className="text-amber-600 mr-3" size={28} />
              <h2 className="text-2xl font-bold text-amber-900">9. Limitation of Liability</h2>
            </div>
            <p className="text-amber-800">We are not liable for allergic reactions, damage after delivery, or events beyond our control.</p>
          </div>

          {/* 10 */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-amber-200">
            <div className="flex items-center mb-4">
              <AlertTriangle className="text-amber-600 mr-3" size={28} />
              <h2 className="text-2xl font-bold text-amber-900">10. Prohibited Activities</h2>
            </div>
            <p className="text-amber-800">Fraudulent orders, resale without permission, or website misuse is strictly prohibited.</p>
          </div>

          {/* 11 */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-amber-200">
            <div className="flex items-center mb-4">
              <Scale className="text-amber-600 mr-3" size={28} />
              <h2 className="text-2xl font-bold text-amber-900">11. Governing Law</h2>
            </div>
            <p className="text-amber-800">These terms are governed by Indian law.</p>
          </div>

        </div>

        {/* Final Contact Card */}
        <div className="mt-12 bg-gradient-to-r from-[#7C4A0E] via-[#7C4A0E] to-[#aa7534] rounded-3xl shadow-2xl p-10 text-white text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">We’re Here With Love</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-lg">
            <div>
              <Mail className="mx-auto mb-3" size={36} />
              <p className="font-semibold">Email</p>
              <p>info.annapurnakhakhra@gmail.com</p>
            </div>
            <div>
              <Phone className="mx-auto mb-3" size={36} />
              <p className="font-semibold">Call / WhatsApp</p>
              <p>+91-93138 69017</p>
            </div>
            <div>
              <MapPin className="mx-auto mb-3" size={36} />
              <p className="font-semibold">Made in</p>
              <p>Gujarat, India</p>
            </div>
          </div>
          <p className="mt-10 text-xl italic">~ Handmade with Pure Love by Women Artisans ~</p>
        </div>

      </div>
    </div>
  );
}