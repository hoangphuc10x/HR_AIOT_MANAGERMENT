'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowDown, ArrowRight, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageDropdown from '@/components/common/ui/language-dropdown';

const ACCENT = '#c0573e';

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      {/* ---------- Header ---------- */}
      <header className="fixed inset-x-0 top-0 z-50 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/image/logo.jpg"
              alt="AIOT"
              width={120}
              height={58}
              priority
              className="h-24 w-auto object-contain"
            />
          </Link>

          <nav className="flex items-center gap-2 sm:gap-3">
            <LanguageDropdown />
            <Link
              href="/login"
              className="rounded-full px-5 py-2 text-sm font-medium text-neutral-700 transition-colors hover:text-neutral-950"
            >
              {t('nav.login')}
            </Link>
            <Link
              href="/create-user"
              className="rounded-full px-5 py-2 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.03]"
              style={{ backgroundColor: ACCENT }}
            >
              {t('nav.register')}
            </Link>
          </nav>
        </div>
      </header>

      {/* ---------- Hero ---------- */}
      <section className="relative mx-auto flex h-[500px] max-w-7xl items-center px-6 lg:px-10">
        {/* rotating scroll-down badge */}
        <div className="absolute left-6 top-1/2 hidden -translate-y-1/2 lg:left-10 lg:block">
          <div className="relative flex h-28 w-28 items-center justify-center">
            <svg
              viewBox="0 0 100 100"
              className="animate-spin-slow absolute inset-0 h-full w-full text-neutral-400"
            >
              <defs>
                <path
                  id="circlePath"
                  d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0"
                />
              </defs>
              <text className="fill-current text-[11px] uppercase tracking-[0.25em]">
                <textPath href="#circlePath" startOffset="0%">
                  {`${t('hero.scroll')} · ${t('hero.scroll')} · `}
                </textPath>
              </text>
            </svg>
            <ArrowDown className="animate-bob h-6 w-6 text-neutral-900" />
          </div>
        </div>

        <h1 className="w-full pl-0 text-center text-5xl font-light leading-none tracking-tight text-neutral-300 sm:text-7xl lg:pl-40 lg:text-left lg:text-[7rem]">
          {t('hero.welcome')}
        </h1>
      </section>

      {/* ---------- About ---------- */}
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 pb-28 lg:grid-cols-2 lg:px-10">
        {/* left: copy */}
        <div className="max-w-xl">
          <div className="mb-6 h-px w-full bg-gradient-to-r from-[#c0573e] to-transparent" />
          <h2 className="text-4xl font-bold tracking-tight">
            {t('about.title')}
          </h2>
          <p className="mt-6 text-base leading-relaxed text-neutral-600">
            {t('about.body')}
          </p>

          <Link
            href="/login"
            className="group mt-10 inline-flex items-center gap-3 rounded-full px-7 py-3 text-sm font-semibold text-white shadow-md transition-transform hover:scale-[1.03]"
            style={{ backgroundColor: ACCENT }}
          >
            {t('about.viewMore')}
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/25 transition-transform group-hover:translate-x-0.5">
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        </div>

        {/* right: stacked image cards */}
        <div className="flex items-stretch justify-center gap-4 lg:justify-end">
          <ImageCard
            src="/image/202511040915-202409271230-3.webp"
            alt="AIOT 1"
            className="mt-10 hidden sm:block"
            rotate="-rotate-2"
            icon={<Heart className="h-4 w-4 fill-rose-500 text-rose-500" />}
            badge="38"
          />

          <ImageCard
            src="/image/202511040915-202409271230-4.webp"
            alt="AIOT 2"
            rotate="rotate-1"
          />

          <ImageCard
            src="/image/202511040915-202409271230-5.webp"
            alt="AIOT 3"
            rotate="rotate-2"
          />

          <ImageCard
            src="/image/202511040915-202409271230-6.webp"
            alt="AIOT 4"
            className="mt-8 hidden lg:block"
            rotate="-rotate-1"
          />
        </div>
      </section>
    </div>
  );
}

function ImageCard({
  src,
  alt,
  className = '',
  rotate = '',
  icon,
  badge,
}: {
  src: string;
  alt: string;
  className?: string;
  rotate?: string;
  icon?: React.ReactNode;
  badge?: string;
}) {
  return (
    <div
      className={`relative h-72 w-24 flex-shrink-0 overflow-hidden rounded-3xl bg-neutral-100 shadow-lg transition-transform duration-300 hover:-translate-y-2 sm:w-28 lg:h-80 ${rotate} ${className}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 640px) 96px, 112px"
        className="object-cover"
      />
      {badge && (
        <div className="absolute left-2 top-3 z-10 flex items-center gap-1 rounded-full bg-white/80 px-2 py-1 text-xs font-semibold text-neutral-700 shadow-sm backdrop-blur">
          {icon}
          {badge}
        </div>
      )}
    </div>
  );
}
