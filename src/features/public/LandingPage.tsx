import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Scale,
  Target,
  Eye,
  Info,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  FileText,
  Users,
  CheckCircle,
  Upload,
  Search,
  Shield,
  Clock,
  Menu,
  X,
  ArrowRight,
  BadgeCheck,
} from 'lucide-react';
import { NewsWidget } from '../../components/widgets/NewsWidget';
import { useAuthStore } from '../../stores/authStore';
import { PublicThemeToggle } from '../../components/PublicThemeToggle';
import { useLanguage } from '../../i18n';

export const LandingPage = () => {
  const { isAuthenticated } = useAuthStore();
  const { t, toggleLanguage, language } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;

    const y = el.getBoundingClientRect().top + window.scrollY - 96;
    window.scrollTo({ top: y, behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const navItems = useMemo(
    () => [
      { id: 'values', label: t('ourCoreValues') },
      { id: 'services', label: t('ourServices') },
      { id: 'how-it-works', label: t('howItWorksTitle') },
      { id: 'news', label: t('news') },
      { id: 'about', label: t('aboutUs') },
      { id: 'contact', label: t('contact') },
    ],
    [t]
  );

  const ui = {
    appName: t('appName'),
    heroTitle: t('landingHeroTitle'),
    heroSubtitle: t('landingHeroSubtitle'),
    heroPrimaryCta: t('heroPrimaryCta'),
    heroSecondaryCta: t('heroSecondaryCta'),
    heroTertiaryCta: t('heroTertiaryCta'),
    // Changed: authenticated users see "Home", unauthenticated see "Sign In"
    homeButton: t('home') || 'Home',
    signIn: t('signIn'),
    register: t('register'),
    ourCoreValues: t('ourCoreValues'),
    ourServices: t('ourServices'),
    aboutUs: t('aboutUs'),
    contact: t('contact'),
    valuesIntro: t('landingValuesIntro'),
    missionTitle: t('ourMission'),
    missionBody: t('missionDescription'),
    visionTitle: t('ourVision'),
    visionBody: t('visionDescription'),
    goalTitle: t('ourGoal'),
    goalBody: t('goalDescription'),
    servicesHeading: t('ourServices'),
    servicesSubheading: t('servicesDescription'),
    eFilingTitle: t('eFiling'),
    eFilingBody: t('eFilingDescription'),
    caseManagementTitle: t('caseManagement'),
    caseManagementBody: t('caseManagementDescription'),
    publicDirectoryTitle: t('publicDirectory'),
    publicDirectoryBody: t('publicDirectoryDescription'),
    howItWorksTitle: t('howItWorksTitle'),
    howItWorksSubtitle: t('howItWorksSubtitle'),
    trustTitle: t('trustTitle'),
    trustSubtitle: t('trustSubtitle'),
    aboutHeading: t('aboutUs'),
    aboutBody: t('aboutDescription'),
    visitUs: t('visitUs'),
    callUs: t('callUs'),
    emailUs: t('emailUs'),
    callHours: t('callHours'),
    footerCopy: t('copyright'),
    languageLabel: language === 'en' ? 'አማርኛ' : 'English',
  };

  const steps = [
    {
      step: '01',
      icon: <Upload className="h-7 w-7" />,
      title: t('registerSubmitTitle'),
      desc: t('registerSubmitBody'),
    },
    {
      step: '02',
      icon: <Search className="h-7 w-7" />,
      title: t('trackProgressTitle'),
      desc: t('trackProgressBody'),
    },
    {
      step: '03',
      icon: <CheckCircle className="h-7 w-7" />,
      title: t('receiveJudgmentTitle'),
      desc: t('receiveJudgmentBody'),
    },
  ];

  const trustItems = [
    {
      icon: <Shield className="h-6 w-6" />,
      title: t('secureAndConfidentialTitle'),
      body: t('secureAndConfidentialBody'),
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: t('fasterResolutionsTitle'),
      body: t('fasterResolutionsBody'),
    },
    {
      icon: <BadgeCheck className="h-6 w-6" />,
      title: t('officiallyRecognizedTitle'),
      body: t('officiallyRecognizedBody'),
    },
  ];

  return (
    <div className="w-full flex min-h-screen flex-col pt-[76px]">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-[var(--app-public-nav-border)] bg-[var(--app-public-nav-bg)] shadow-[0_12px_40px_rgba(0,0,0,0.12)] backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:gap-5">
          <Link
            to="/"
            className="flex shrink-0 items-center gap-3 text-[var(--app-public-nav-text)] transition-opacity hover:opacity-85"
          >
            <Scale className="h-7 w-7 shrink-0 text-[var(--app-accent)]" />
            <span className="whitespace-nowrap text-sm font-black leading-none tracking-wide sm:text-lg lg:text-xl">
              {ui.appName}
            </span>
          </Link>

          <nav className="hidden min-w-0 flex-1 justify-center xl:flex">
            <div className="flex min-w-0 flex-wrap items-center justify-center gap-1 rounded-full border border-[var(--app-public-nav-chip-border)] bg-[var(--app-public-nav-chip-bg)] p-1.5 backdrop-blur-md">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  className="whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-semibold text-[var(--app-public-nav-text)] transition-all duration-200 hover:bg-[var(--app-public-nav-chip-hover-bg)] hover:text-[var(--app-accent)]"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="whitespace-nowrap rounded-xl bg-[var(--app-accent)] px-4 py-2.5 text-sm font-bold text-[var(--app-on-accent)] shadow-md transition-all hover:bg-[var(--app-accent-hover)] sm:px-5"
              >
                {ui.homeButton}
              </Link>
            ) : (
              <Link
                to="/login"
                className="whitespace-nowrap rounded-xl bg-[var(--app-accent)] px-4 py-2.5 text-sm font-bold text-[var(--app-on-accent)] shadow-md transition-all hover:bg-[var(--app-accent-hover)] sm:px-5"
              >
                {ui.signIn}
              </Link>
            )}

            <div className="flex items-center gap-2">
              <PublicThemeToggle className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--app-public-nav-chip-border)] bg-[var(--app-public-nav-chip-bg)] px-3 py-2 text-xs font-semibold text-[var(--app-public-nav-text)] shadow-md transition hover:bg-[var(--app-public-nav-chip-hover-bg)]" />

              <button
                type="button"
                onClick={toggleLanguage}
                className="inline-flex items-center justify-center rounded-lg border border-[var(--app-public-nav-chip-border)] bg-[var(--app-public-nav-chip-bg)] px-3 py-2 text-xs font-semibold text-[var(--app-public-nav-text)] shadow-md transition hover:bg-[var(--app-public-nav-chip-hover-bg)]"
                aria-label={language === 'en' ? 'Switch to Amharic' : 'Switch to English'}
              >
                {language === 'en' ? 'AM' : 'EN'}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="inline-flex items-center justify-center rounded-xl border border-[var(--app-public-nav-chip-border)] bg-[var(--app-public-nav-chip-bg)] p-2 text-[var(--app-public-nav-text)] transition hover:bg-[var(--app-public-nav-chip-hover-bg)] xl:hidden"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-[var(--app-public-nav-border)] bg-[var(--app-public-nav-menu-bg)] px-4 py-4 xl:hidden">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  className="flex items-center justify-between rounded-2xl border border-[var(--app-public-nav-chip-border)] bg-[var(--app-public-nav-chip-bg)] px-4 py-3 text-left text-sm font-semibold text-[var(--app-public-nav-menu-text)] transition hover:bg-[var(--app-public-nav-chip-hover-bg)]"
                >
                  <span>{item.label}</span>
                  <ArrowRight className="h-4 w-4 text-[var(--app-accent)]" />
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  toggleLanguage();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-between rounded-2xl border border-[var(--app-public-nav-chip-border)] bg-[var(--app-public-nav-chip-bg)] px-4 py-3 text-left text-sm font-semibold text-[var(--app-public-nav-menu-text)] transition hover:bg-[var(--app-public-nav-chip-hover-bg)]"
              >
                <span>{ui.languageLabel}</span>
                <ArrowRight className="h-4 w-4 text-[var(--app-accent)]" />
              </button>
              <Link
                to={isAuthenticated ? '/dashboard' : '/login'}
                onClick={() => setMobileMenuOpen(false)}
                className="mt-2 flex items-center justify-center rounded-2xl bg-[var(--app-accent)] px-4 py-3 text-sm font-bold text-[var(--app-on-accent)] shadow-md transition hover:bg-[var(--app-accent-hover)]"
              >
                {isAuthenticated ? ui.homeButton : ui.signIn}
              </Link>
            </div>
          </div>
        )}
      </header>

      <section
        className="relative flex min-h-[85vh] flex-col items-center justify-center overflow-hidden px-4 text-center"
        style={{
          backgroundImage:
            'linear-gradient(rgba(6, 10, 18, 0.62), rgba(6, 10, 18, 0.8)), url(/gondar-2.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: ' top center',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="relative z-10 mx-auto max-w-5xl text-white">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-white/90">
            <Scale className="h-4 w-4 text-[var(--app-accent)]" />
            {t('landingHeroEyebrow')}
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight drop-shadow-2xl sm:text-5xl md:text-6xl lg:text-7xl">
            {ui.heroTitle}
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-gray-100 sm:text-xl md:text-2xl">
            {ui.heroSubtitle}
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--app-accent)] px-6 py-3.5 text-sm font-black text-white shadow-xl transition hover:bg-[var(--app-accent-hover)] sm:px-7"
            >
              {ui.heroPrimaryCta}
              <ArrowRight className="h-4 w-4" />
            </Link>

            <button
              type="button"
              onClick={() => scrollToSection('how-it-works')}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-transparent px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/10 sm:px-7"
            >
              {ui.heroSecondaryCta}
            </button>

            <button
              type="button"
              onClick={() => scrollToSection('news')}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-transparent px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/10 sm:px-7"
            >
              {ui.heroTertiaryCta}
            </button>
          </div>
        </div>
      </section>

      <section id="values" className="scroll-mt-24 bg-[var(--app-bg)] relative z-10 rounded-t-[3rem] -mt-8 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
        <div className="mx-auto max-w-7xl px-4 py-20">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-[var(--app-text)] md:text-5xl">{ui.ourCoreValues}</h2>
            <p className="mt-4 text-lg leading-relaxed text-[var(--app-text)] opacity-80">
              {ui.valuesIntro}
            </p>
            <div className="mx-auto mt-6 h-1 w-24 rounded-full bg-[var(--app-accent)]" />
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <article className="app-card group rounded-3xl border border-[var(--app-border)] bg-[var(--app-surface)] p-10 shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
              <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--app-accent-soft)] text-[var(--app-accent)] transition-transform group-hover:scale-110">
                <Target className="h-8 w-8" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-[var(--app-text)]">{ui.missionTitle}</h3>
              <p className="text-lg leading-relaxed app-muted">{ui.missionBody}</p>
            </article>

            <article className="app-card group rounded-3xl border border-[var(--app-border)] bg-[var(--app-surface)] p-10 shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
              <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--app-accent-soft)] text-[var(--app-accent)] transition-transform group-hover:scale-110">
                <Eye className="h-8 w-8" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-[var(--app-text)]">{ui.visionTitle}</h3>
              <p className="text-lg leading-relaxed app-muted">{ui.visionBody}</p>
            </article>

            <article className="app-card group rounded-3xl border border-[var(--app-border)] bg-[var(--app-surface)] p-10 shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
              <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--app-accent-soft)] text-[var(--app-accent)] transition-transform group-hover:scale-110">
                <Scale className="h-8 w-8" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-[var(--app-text)]">{ui.goalTitle}</h3>
              <p className="text-lg leading-relaxed app-muted">{ui.goalBody}</p>
            </article>
          </div>
        </div>
      </section>

      <section id="services" className="scroll-mt-24 border-t border-[var(--app-border)] bg-[var(--app-surface-alt)] py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-[var(--app-text)] md:text-5xl">{ui.servicesHeading}</h2>
            <div className="mx-auto my-6 h-1 w-24 rounded-full bg-[var(--app-accent)]" />
            <p className="text-xl leading-relaxed text-[var(--app-text)] opacity-80">
              {ui.servicesSubheading}
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <article className="app-card group rounded-3xl border border-[var(--app-border)] bg-[var(--app-surface)] p-8 shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--app-accent-soft)] text-[var(--app-accent)] transition-transform group-hover:scale-110">
                <FileText className="h-7 w-7" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-[var(--app-text)]">{ui.eFilingTitle}</h3>
              <p className="leading-relaxed app-muted">{ui.eFilingBody}</p>
            </article>

            <article className="app-card group rounded-3xl border border-[var(--app-border)] bg-[var(--app-surface)] p-8 shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--app-accent-soft)] text-[var(--app-accent)] transition-transform group-hover:scale-110">
                <Briefcase className="h-7 w-7" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-[var(--app-text)]">{ui.caseManagementTitle}</h3>
              <p className="leading-relaxed app-muted">{ui.caseManagementBody}</p>
            </article>

            <article className="app-card group rounded-3xl border border-[var(--app-border)] bg-[var(--app-surface)] p-8 shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--app-accent-soft)] text-[var(--app-accent)] transition-transform group-hover:scale-110">
                <Users className="h-7 w-7" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-[var(--app-text)]">{ui.publicDirectoryTitle}</h3>
              <p className="leading-relaxed app-muted">{ui.publicDirectoryBody}</p>
            </article>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-24 border-t border-[var(--app-border)] bg-[var(--app-bg)] py-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-[var(--app-text)] md:text-5xl">{ui.howItWorksTitle}</h2>
            <div className="mx-auto my-6 h-1 w-24 rounded-full bg-[var(--app-accent)]" />
            <p className="text-xl leading-relaxed text-[var(--app-text)] opacity-80">
              {ui.howItWorksSubtitle}
            </p>
          </div>

          <div className="relative grid gap-8 md:grid-cols-3">
            <div className="hidden md:block absolute left-1/3 right-1/3 top-16 z-0 h-0.5 bg-[var(--app-border)]" />
            {steps.map((item) => (
              <article
                key={item.step}
                className="relative z-10 flex flex-col items-center rounded-3xl border border-[var(--app-border)] bg-[var(--app-surface)] p-8 text-center shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="absolute -top-5 left-1/2 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full bg-[var(--app-accent)] text-sm font-black text-white shadow-lg">
                  {item.step}
                </div>
                <div className="mt-4 mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--app-accent-soft)] text-[var(--app-accent)] transition-transform hover:scale-110">
                  {item.icon}
                </div>
                <h3 className="mb-3 text-xl font-bold text-[var(--app-text)]">{item.title}</h3>
                <p className="leading-relaxed app-muted">{item.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--app-border)] bg-[var(--app-surface-alt)] py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <h2 className="text-2xl font-bold text-[var(--app-text)] md:text-3xl">{ui.trustTitle}</h2>
            <p className="mt-3 text-lg leading-relaxed text-[var(--app-text)] opacity-80">
              {ui.trustSubtitle}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {trustItems.map((item) => (
              <article
                key={item.title}
                className="flex items-start gap-4 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-md"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--app-accent-soft)] text-[var(--app-accent)]">
                  {item.icon}
                </div>
                <div>
                  <h3 className="mb-1 text-base font-bold text-[var(--app-text)]">{item.title}</h3>
                  <p className="text-sm leading-relaxed app-muted">{item.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="news" className="scroll-mt-24 border-t border-[var(--app-border)] bg-[var(--app-bg)] py-16">
        <div className="mx-auto max-w-7xl px-4">
          <NewsWidget />
        </div>
      </section>

      <section id="about" className="scroll-mt-24 border-t border-[var(--app-border)] bg-[var(--app-surface-alt)] py-24">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-[var(--app-accent-soft)] text-[var(--app-accent)] shadow-inner">
            <Info className="h-10 w-10" />
          </div>
          <h2 className="mb-8 text-4xl font-bold text-[var(--app-text)] md:text-5xl">{ui.aboutHeading}</h2>
          <p className="mb-12 text-xl leading-relaxed text-[var(--app-text)] opacity-80">
            {ui.aboutBody}
          </p>
        </div>
      </section>

      <section id="contact" className="scroll-mt-24 border-t border-[var(--app-border)] bg-[var(--app-surface)] py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-8 text-center md:grid-cols-3">
            <article className="flex flex-col items-center rounded-2xl border border-transparent p-6 shadow-sm transition-colors hover:border-[var(--app-border)] hover:bg-[var(--app-bg)] hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--app-accent-soft)] text-[var(--app-accent)]">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-[var(--app-text)]">{ui.visitUs}</h3>
              <p className="text-lg app-muted">
                Fasil Ghebbi (Gondar Castle), Piasa
                <br />
                Gondar, Ethiopia
              </p>
            </article>

            <article className="flex flex-col items-center rounded-2xl border border-transparent p-6 shadow-sm transition-colors hover:border-[var(--app-border)] hover:bg-[var(--app-bg)] hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--app-accent-soft)] text-[var(--app-accent)]">
                <Phone className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-[var(--app-text)]">{ui.callUs}</h3>
              <p className="text-lg app-muted">
                +251581111330
                <br />
                {ui.callHours}
              </p>
            </article>

            <article className="flex flex-col items-center rounded-2xl border border-transparent p-6 shadow-sm transition-colors hover:border-[var(--app-border)] hover:bg-[var(--app-bg)] hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--app-accent-soft)] text-[var(--app-accent)]">
                <Mail className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-[var(--app-text)]">{ui.emailUs}</h3>
              <p className="text-lg app-muted">
                support@courtmanagement.gov
                <br />
                info@courtmanagement.gov
              </p>
            </article>
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--app-border)] bg-[var(--app-surface-alt)] py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 md:flex-row">
          <p className="text-sm app-muted">{ui.footerCopy}</p>
          <div className="flex gap-6 text-sm font-medium text-[var(--app-accent)]">
            <Link to="/register" className="hover:underline">
              {ui.register}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};