// app/page.jsx
import { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import Link from "next/link";
import Skyline from "./components/Skyline";

const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "700", "800"] });

export const metadata = {
  title: "LOGS — Building Compliance Made Simple",
  description:
    "Modern QR-code electronic logbooks for NZ building compliance. Simple logging, secure records, instant exports.",
};

const Bullet = ({ children }) => (
  <li className="flex gap-3">
    <span aria-hidden className="mt-1 size-2 shrink-0 rounded-full bg-brand-600" />
    <span>{children}</span>
  </li>
);

export default function Page() {
  return (
    <main className={dmSans.className}>
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/80 backdrop-blur">
        <div className="container mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-md bg-brand-700 text-white font-extrabold">
              L
            </div>
            <span className="sr-only">LOGS</span>
            <p className="text-xl font-extrabold tracking-wide text-neutral-900">
              LOGS
            </p>
          </div>

          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="nav-link">Features</a>
            <a href="#how" className="nav-link">How it works</a>
            <a href="#pricing" className="nav-link">Pricing</a>
            <a href="#faq" className="nav-link">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="#demo"
              className="btn btn-ghost"
              aria-label="Try a demo"
            >
              Try a Demo
            </Link>
            <Link
              href="#contact"
              className="btn btn-primary"
              aria-label="Contact us"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-brand-800 text-brand-50">
        <div className="container mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-6 py-24 lg:grid-cols-2">
          <div>
            <h1 className="text-5xl font-extrabold leading-[1.1] sm:text-6xl">
              Building Compliance{" "}
              <span className="text-brand-200">Made Simple</span>
            </h1>
            <p className="mt-6 text-lg/8 opacity-90">
              LOGS is a modern, digital logbook for inspections and
              compliance—powered by on-site QR codes, secure cloud storage, and
              instant reporting. Built for New&nbsp;Zealand regulations and
              auditor expectations.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="#demo" className="btn btn-primary btn-lg">
                Try a Demo
              </Link>
              <Link href="#contact
