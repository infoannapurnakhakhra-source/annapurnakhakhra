"use client";

import React, { useEffect } from 'react';
import { Package, Clock, Truck, CreditCard, AlertCircle, Mail, Phone } from 'lucide-react';

export default function ReturnPolicy() {

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-[#fffcfa] py-20 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="text-center pb-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-amber-900 leading-snug">
              Return & Refund Policy – ANNĀPURNA KHAKHRA
            </h1>
            <p className="text-gray-500 italic">Last Updated: 01 December 2025</p>
          </div>

          <div className="bg-[#faebd75c] border-l-4 border-amber-600 p-6 rounded-r-lg">
            <h2 className="text-3xl font-bold text-amber-900 leading-snug mb-2">OVERVIEW</h2>
            <p className="text-base sm:text-lg text-amber-900 leading-snug">
              Because we sell freshly made, perishable food items, we maintain strict quality control.
              This policy outlines situations where returns or replacements are permitted.
            </p>
          </div>
        </div>

        {/* Eligibility Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center mb-4">
            <Package className="text-amber-900 mr-3" size={28} />
            <h2 className="text-2xl font-bold text-amber-900 leading-snug">Eligibility for Return / Replacement</h2>
          </div>

          <p className="text-amber-700 mb-4">
            We accept returns or replacements only if:
          </p>

          <ul className="space-y-3 ml-6">
            <li className="text-amber-600 flex items-start"><span className="text-amber-900 mr-2">•</span>You receive the wrong product</li>
            <li className="text-amber-600 flex items-start"><span className="text-amber-900 mr-2">•</span>You receive damaged items</li>
            <li className="text-amber-600 flex items-start"><span className="text-amber-900 mr-2">•</span>Packaging is torn or tampered during delivery</li>
            <li className="text-amber-600 flex items-start"><span className="text-amber-900 mr-2">•</span>Product inside is spoiled upon arrival</li>
          </ul>

          <p className="text-amber-700 mt-4">
            Claims must be made within <strong>24 hours of delivery</strong>.
          </p>
        </div>

        {/* Ineligible Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center mb-4">
            <AlertCircle className="text-amber-900 mr-3" size={28} />
            <h2 className="text-2xl font-bold text-amber-900 leading-snug">Ineligible Situations</h2>
          </div>

          <p className="text-amber-700 mb-4">No return or refund will be provided for:</p>

          <ul className="space-y-3 ml-6">
            <li className="text-amber-600 flex">
              <span className="text-amber-900 mr-2">•</span>Change of mind
            </li>
            <li className="text-amber-600 flex">
              <span className="text-amber-900 mr-2">•</span>Wrong flavour ordered by customer
            </li>
            <li className="text-amber-600 flex">
              <span className="text-amber-900 mr-2">•</span>Partially consumed product
            </li>
            <li className="text-amber-600 flex">
              <span className="text-amber-900 mr-2">•</span>Courier delay
            </li>
            <li className="text-amber-600 flex">
              <span className="text-amber-900 mr-2">•</span>Products damaged after delivery
            </li>
            <li className="text-amber-600 flex">
              <span className="text-amber-900 mr-2">•</span>Opened pouches (unless spoilage proof is provided)
            </li>
          </ul>
        </div>

        {/* How to Request Return */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center mb-4">
            <Clock className="text-amber-900 mr-3" size={28} />
            <h2 className="text-2xl font-bold text-amber-900 leading-snug">How to Request a Return</h2>
          </div>

          <p className="text-amber-700 mb-4">You must share:</p>

          <ul className="space-y-3 ml-6">
            <li className="text-amber-600 flex"><span className="text-amber-900 mr-2">•</span>Order number</li>
            <li className="text-amber-600 flex"><span className="text-amber-900 mr-2">•</span>Photos of product</li>
            <li className="text-amber-600 flex"><span className="text-amber-900 mr-2">•</span>Video of full unboxing</li>
            <li className="text-amber-600 flex"><span className="text-amber-900 mr-2">•</span>Description of the issue</li>
          </ul>

          <p className="text-amber-700 mt-4">This helps us verify and take action.</p>
        </div>

        {/* Refund / Replacement */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center mb-4">
            <CreditCard className="text-amber-900 mr-3" size={28} />
            <h2 className="text-2xl font-bold text-amber-900 leading-snug">Refund / Replacement Method</h2>
          </div>

          <p className="text-amber-700 mb-4">After verification:</p>

          <ul className="space-y-3 ml-6">
            <li className="text-amber-600 flex"><span className="text-amber-900 mr-2">•</span>A replacement may be sent</li>
            <li className="text-amber-600 flex"><span className="text-amber-900 mr-2">•</span>A refund may be issued</li>
            <li className="text-amber-600 flex"><span className="text-amber-900 mr-2">•</span>Store credit may be provided</li>
          </ul>

          <p className="text-amber-700 mt-4">
            Decision depends on: nature of issue, product availability, and courier partner report.
          </p>

          <p className="text-amber-700 mt-2">
            Refunds take <strong>3–7 working days</strong>.
          </p>
        </div>

        {/* Cancellations */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-amber-900 leading-snug mb-4">Cancellations</h2>
          <p className="text-amber-600 leading-relaxed">
            Orders can be cancelled <strong>before dispatch only</strong>.  
            Once shipped, the order cannot be cancelled for any reason.
          </p>
        </div>

        {/* Bulk Orders */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-amber-900 leading-snug mb-4">Bulk or Corporate Orders</h2>
          <p className="text-amber-600 leading-relaxed mb-4">
            Bulk orders are not eligible for return unless:
          </p>

          <ul className="space-y-3 ml-6">
            <li className="text-amber-600 flex"><span className="text-amber-900 mr-2">•</span>Damage is proved</li>
            <li className="text-amber-600 flex"><span className="text-amber-900 mr-2">•</span>Entire shipment is tampered</li>
          </ul>

          <p className="text-amber-700 mt-4">Partial refunds are not applicable.</p>

          <div className="border-t border-gray-200 pt-6 mt-6 text-center">
            <p className="text-amber-700 italic">
              Thank you for choosing Annapurna Khakhra.  
              We maintain quality and ensure customer satisfaction.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
