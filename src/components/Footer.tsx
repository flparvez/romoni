"use client";
import Link from "next/link";
import { Facebook, Instagram, Phone, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-4 pb-2">
      <div className="container mx-auto px-2">
        {/* 🔹 Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-center md:text-left">
          {/* Brand Section */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-3">
              A1 Romoni - Quality Is Here
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              Quality products at the best price. <br />
              Trustworthy online shop in Bangladesh.
            </p>
            {/* Social Icons */}
            <div className="flex justify-center md:justify-start space-x-4 mt-4">
              <Link
                href="https://www.facebook.com/uniquestorebd23"
                target="_blank"
              >
                <Facebook className="w-6 h-6 hover:text-blue-500 transition" />
              </Link>
              <Link href="https://www.instagram.com/uniquestorebd" target="_blank">
                <Instagram className="w-6 h-6 hover:text-pink-500 transition" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/policy/return-policy"
                  className="hover:text-white transition"
                >
                  Return Policy
                </Link>
              </li>   
                    <li>
                <Link
                  href="/products"
                  className="hover:text-white transition"
                >
                 All Products
                </Link>
              </li>
              <li>
                <Link
                  href="/policy/replacement-warranty"
                  className="hover:text-white transition"
                >
                  Replacement Warranty
                </Link>
              </li>
              <li>
                <Link
                  href="/policy/after-sales-support"
                  className="hover:text-white transition"
                >
                  After Sales Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">
              Contact Us
            </h3>
            <ul className="space-y-2">
              <li className="flex justify-center md:justify-start items-center gap-2">
                <Phone className="w-5 h-5 text-gray-400" />
                <span>+880 9638-617746</span>
              </li>
              <li className="flex justify-center md:justify-start items-center gap-2">
                <Mail className="w-5 h-5 text-gray-400" />
                <span>contact@uniquestorebd.store </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 mt-10 pt-4 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} A1 Romoni. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
