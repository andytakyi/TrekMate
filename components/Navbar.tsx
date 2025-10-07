"use client";

import { NAV_LINKS } from "@/constants";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import Button from "./Button";
import {  X } from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <nav className="  flexBetween   max-container padding-container relative z-30 py-5">
      <Link href="/">
        <Image src="/TrekMate.png" alt="" height={29} width={200} />
      </Link>
      <ul className="hidden h-full gap-12 lg:flex">
        {NAV_LINKS.map((link) => (
          <Link
            href={link.href}
            key={link.key}
            className="regular-16 text-gray-50 flexCenter cursor-pointer pb-1.5 transition-all hover:font-bold"
          >
            {link.label}
          </Link>
        ))}
      </ul>

      <div className="hidden lg:flexCenter">
        <Button
          type="button"
          title="Log In"
          icon="/user.svg"
          variant="btn_dark_green"
          showDownloadNotice
        />
      </div>
      {/* Hamburger / Close Toggle */}
      <button
        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        aria-expanded={isMenuOpen}
        onClick={() => setIsMenuOpen((v) => !v)}
        className="inline-block lg:hidden"
        type="button"
      >
        {isMenuOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Image src={"/menu.svg"} alt="" width={32} height={32} />)}

      </button>

      {/* Mobile dropdown (animated) */}
      <div
        aria-hidden={!isMenuOpen}
        className={`absolute left-0 right-0 top-full rounded-md bg-white px-4 pb-4 shadow-lg lg:hidden z-40 transition-all duration-300 ease-out transform ${isMenuOpen
            ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
            : "opacity-0 -translate-y-2 scale-95 pointer-events-none"
          }`}
      >
        <ul className="mt-2 flex flex-col  gap-4">
          {NAV_LINKS.map((link) => (
            <Link
              href={link.href}
              key={link.key}
              onClick={() => setIsMenuOpen(false)}
              className="regular-16 text-gray-900 flex items-center cursor-pointer pb-1.5 transition-all hover:font-bold"
            >
              {link.label}
            </Link>
          ))}
        </ul>
        <div className="mt-4">
          <Button
            type="button"
            title="Log In"
            icon="/user.svg"
            variant="btn_dark_green"
            showDownloadNotice
            onClick={() => setIsMenuOpen(false)}
          />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
