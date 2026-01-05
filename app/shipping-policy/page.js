"use client";

import React, { useEffect } from 'react';
import { Truck, MapPin, Clock, Package, Shield, Bell, AlertCircle, Phone, Mail } from 'lucide-react';

export default function ShippingPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-16 pb-12 px-5 bg-gradient-to-b from-amber-50 via-orange-50 to-amber-100 min-h-screen">
      <div className="max-w-4xl mx-auto">

        {/* Header – Brand Name Only */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-10 border-4 border-amber-200 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-amber-900 mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
            Annapurna Khakhra
          </h1>
          <h2 className="text-3xl md:text-4xl font-bold text-amber-800 mb-2">Shipping Policy</h2>
          <p className="text-lg text-amber-700">Last Updated: 01 December 2025</p>
          <p className="mt-6 text-amber-800 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            We pack and deliver your fresh, handmade khakhra with utmost care — straight from our home to yours.
          </p>
        </div>

        <div className="space-y-8">

          {/* 1. Geographic Service Area */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-amber-200">
            <div className="flex items-center mb-4">
              <MapPin className="text-amber-600 mr-3" size={28} />
              <h2 className="text-2xl font-bold text-amber-900">1. Where We Deliver</h2>
            </div>
            <p className="text-amber-800">We proudly deliver across India to:</p>
            <ul className="mt-3 space-y-2 text-amber-700 ml-6">
              <li>• All major cities</li>
              <li>• Most Tier-2 & Tier-3 towns</li>
              <li>• Select remote areas (subject to courier availability)</li>
            </ul>
            <p className="mt-3 text-amber-800 text-sm">
              <strong>Note:</strong> Orders to restricted or remote service areas (RAS) may be cancelled with full refund if undeliverable.
            </p>
          </div>

          {/* 2. Order Processing Time */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-amber-200">
            <div className="flex items-center mb-4">
              <Clock className="text-amber-600 mr-3" size={28} />
              <h2 className="text-2xl font-bold text-amber-900">2. Order Processing Time</h2>
            </div>
            <p className="text-amber-800">
              Orders are processed within <strong>24–48 hours</strong> on working days.<br />
              During festivals or high demand, fresh preparation may take an extra 1–2 days — we’ll keep you updated!
            </p>
          </div>

          {/* 3. Delivery Timelines */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-amber-200">
            <div className="flex items-center mb-4">
              <Truck className="text-amber-600 mr-3" size={28} />
              <h2 className="text-2xl font-bold text-amber-900">3. Expected Delivery Time</h2>
            </div>
            <div className="space-y-3 text-amber-800">
              <p>• Metro Cities: <strong>3–5 business days</strong></p>
              <p>• Tier-1 & Tier-2 Cities: <strong>4–7 business days</strong></p>
              <p>• Rural/Remote Areas: <strong>7–10 business days</strong></p>
            </div>
            <p className="mt-4 text-sm text-amber-700">
              Sundays, holidays, strikes, or bad weather may cause slight delays — thank you for your patience!
            </p>
          </div>

          {/* 4. Packaging */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-amber-200">
            <div className="flex items-center mb-4">
              <Package className="text-amber-600 mr-3" size={28} />
              <h2 className="text-2xl font-bold text-amber-900">4. How We Pack Your Khakhra</h2>
            </div>
            <p className="text-amber-800">Every parcel is packed with love using:</p>
            <ul className="mt-3 space-y-2 text-amber-700 ml-6">
              <li>• Air-tight, moisture-proof pouches</li>
              <li>• Multi-layer protective wrapping</li>
              <li>• Extra bubble wrap for bulk orders</li>
              <li>• Tamper-evident sealing</li>
            </ul>
            <p className="mt-3 text-amber-800 text-sm italic">So your khakhra arrives fresh, crisp, and unbroken.</p>
          </div>

          {/* 5. Shipping Charges */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-amber-200">
            <div className="flex items-center mb-4">
              <Shield className="text-amber-600 mr-3" size={28} />
              <h2 className="text-2xl font-bold text-amber-900">5. Shipping Charges</h2>
            </div>
            <p className="text-amber-800">
              Charges depend on weight, pincode, and order value.<br />
              <strong>Free shipping</strong> is often available on promotions or above a minimum order amount.
            </p>
          </div>

          {/* 6. Tracking */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-amber-200">
            <div className="flex items-center mb-4">
              <Bell className="text-amber-600 mr-3" size={28} />
              <h2 className="text-2xl font-bold text-amber-900">6. Tracking & Updates</h2>
            </div>
            <p className="text-amber-800">
              As soon as your order is dispatched, you’ll receive a tracking link via <strong>Email, WhatsApp, or SMS</strong>.
            </p>
          </div>

          {/* 7. Undeliverable Packages */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-amber-200">
            <div className="flex items-center mb-4">
              <AlertCircle className="text-amber-600 mr-3" size={28} />
              <h2 className="text-2xl font-bold text-amber-900">7. Undeliverable Packages</h2>
            </div>
            <p className="text-amber-800 text-sm">
              If delivery fails due to incorrect address, unreachable phone, or customer unavailability — re-delivery will require extra shipping charges. No refund for customer-side errors.
            </p>
          </div>

          {/* 8. Delays Beyond Control */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-amber-200">
            <div className="flex items-center mb-4">
              <AlertCircle className="text-amber-600 mr-3" size={28} />
              <h2 className="text-2xl font-bold text-amber-amber-900">8. Delays Beyond Our Control</h2>
            </div>
            <p className="text-amber-800 text-sm">
              We are not responsible for delays due to weather, natural disasters, strikes, holidays, or courier restrictions — but we’ll always help you track it!
            </p>
          </div>

          {/* 9. Damaged / Missing Items */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-amber-200">
            <div className="flex items-center mb-4">
              <Package className="text-amber-600 mr-3" size={28} />
              <h2 className="text-2xl font-bold text-amber-900">9. Damaged or Missing Items</h2>
            </div>
            <p className="text-amber-800">
              Found torn packaging or broken khakhra?<br />
              Please report within <strong>24 hours</strong> with photos/video + order number.<br />
              We’ll arrange replacement or refund as per our policy.
            </p>
          </div>

        </div>

        {/* Final Loving Note */}
        <div className="mt-12 bg-gradient-to-r from-[#7C4A0E] via-[#7C4A0E] to-[#aa7534] rounded-3xl shadow-2xl p-10 text-white text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Packed & Sent With Love</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Every parcel leaves our home with a prayer for your happiness and health.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-lg">
            <div className="flex flex-col items-center">
              <Mail className="mb-3" size={36} />
              <p>info.annapurnakhakhra@gmail.com</p>
            </div>
            <div className="flex flex-col items-center">
              <Phone className="mb-3" size={36} />
              <p>+91-93138 69017</p>
            </div>
          </div>
          <p className="mt-10 text-xl italic">
            ~ Freshly Made & Delivered with Pure Love from Gujarat ~
          </p>
        </div>

      </div>
    </div>
  );
}