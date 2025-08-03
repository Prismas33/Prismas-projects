'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Modals from '../../components/Modals/Modals';
import styles from './safecallkids.module.css';

export default function SafeCallKidsPage() {
  const [currentLang, setCurrentLang] = useState('pt');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cookieBannerVisible, setCookieBannerVisible] = useState(true);

  // Verificar se o banner de cookies deve ser mostrado
  useEffect(() => {
    const cookiesAccepted = localStorage.getItem('cookiesAccepted');
    if (cookiesAccepted) {
      setCookieBannerVisible(false);
    }
  }, []);

  // Dados de tradução completos
  const translations = {
    pt: {
      title: "SafeCallKids - Protegendo Crianças de Chamadas Indesejadas",
      description: "SafeCallKids protege suas crianças bloqueando chamadas de números desconhecidos. Apenas contatos salvos podem ligar.",
      home: "Início",
      features: "Funcionalidades",
      howItWorks: "Como Funciona",
      download: "Download",
      heroTitle1: "Proteja suas crianças de",
      heroTitle2: "chamadas indesejadas", 
      heroDescription: "SafeCallKids bloqueia automaticamente todas as chamadas de números que não estão na lista de contatos, garantindo que apenas pessoas conhecidas possam ligar para seus filhos.",
      playStoreBtn: "Em breve no Google Play",
      downloadApk: "Download APK",
      featuresTitle: "Funcionalidades Principais",
      featuresSubtitle: "Proteção completa e fácil de usar para manter suas crianças seguras",
      autoBlockTitle: "Bloqueio Automático",
      autoBlockDesc: "Bloqueia automaticamente todas as chamadas de números desconhecidos, permitindo apenas contatos salvos.",
      safeContactsTitle: "Lista de Contatos Segura",
      safeContactsDesc: "Gerencie facilmente quem pode ligar para seus filhos através de uma interface simples e intuitiva.",
      reportsTitle: "Relatórios em Tempo Real",
      reportsDesc: "Veja quantas chamadas foram bloqueadas e de quais números, mantendo você sempre informado.",
      easyUseTitle: "Fácil de Usar",
      easyUseDesc: "Interface simples e amigável, perfeita para pais que querem proteção sem complicações.",
      silentBlockTitle: "Bloqueio Silencioso",
      silentBlockDesc: "As chamadas são bloqueadas silenciosamente, sem incomodar a criança ou interromper suas atividades.",
      peaceOfMindTitle: "Tranquilidade para Pais",
      peaceOfMindDesc: "Tenha a certeza de que seus filhos estão protegidos de chamadas de estranhos e potenciais perigos.",
      howItWorksTitle: "Como Funciona",
      howItWorksSubtitle: "Três passos simples para proteger seus filhos",
      step1Title: "Instale o App",
      step1Desc: "Baixe e instale o SafeCallKids no dispositivo da criança em segundos.",
      step2Title: "Configure os Contatos",
      step2Desc: "Adicione os números de telefone das pessoas que podem ligar para a criança.",
      step3Title: "Proteção Ativa",
      step3Desc: "O app bloqueia automaticamente todas as chamadas de números não autorizados.",
      downloadTitle: "Proteja seus filhos hoje mesmo",
      downloadDesc: "Baixe o SafeCallKids e tenha tranquilidade sabendo que seus filhos estão seguros.",
      comingSoon: "Em breve no",
      googlePlay: "Google Play",
      apkDownload: "APK",
      cookieText: "Utilizamos cookies para melhorar a sua experiência. Ao continuar, aceita a nossa política de cookies.",
      configure: "Configurar",
      acceptAll: "Aceitar Todos",
      contact: "Contato",
      privacy: "Política de Privacidade",
      terms: "Termos e Condições",
      cookies: "Cookies"
    },
    en: {
      title: "SafeCallKids - Protecting Children from Unwanted Calls",
      description: "SafeCallKids protects your children by blocking calls from unknown numbers. Only saved contacts can call.",
      home: "Home",
      features: "Features",
      howItWorks: "How It Works", 
      download: "Download",
      heroTitle1: "Protect your children from",
      heroTitle2: "unwanted calls",
      heroDescription: "SafeCallKids automatically blocks all calls from numbers not in the contact list, ensuring only known people can call your children.",
      playStoreBtn: "Coming soon to Google Play", 
      downloadApk: "APK Download",
      featuresTitle: "Key Features",
      featuresSubtitle: "Complete and easy-to-use protection to keep your children safe",
      autoBlockTitle: "Automatic Blocking",
      autoBlockDesc: "Automatically blocks all calls from unknown numbers, allowing only saved contacts.",
      safeContactsTitle: "Safe Contact List",
      safeContactsDesc: "Easily manage who can call your children through a simple and intuitive interface.",
      reportsTitle: "Real-time Reports",
      reportsDesc: "See how many calls were blocked and from which numbers, keeping you always informed.",
      easyUseTitle: "Easy to Use",
      easyUseDesc: "Simple and friendly interface, perfect for parents who want protection without complications.",
      silentBlockTitle: "Silent Blocking",
      silentBlockDesc: "Calls are blocked silently, without bothering the child or interrupting their activities.",
      peaceOfMindTitle: "Peace of Mind for Parents",
      peaceOfMindDesc: "Rest assured that your children are protected from calls from strangers and potential dangers.",
      howItWorksTitle: "How It Works",
      howItWorksSubtitle: "Three simple steps to protect your children",
      step1Title: "Install the App",
      step1Desc: "Download and install SafeCallKids on the child's device in seconds.",
      step2Title: "Set Up Contacts",
      step2Desc: "Add the phone numbers of people who can call the child.",
      step3Title: "Active Protection",
      step3Desc: "The app automatically blocks all calls from unauthorized numbers.",
      downloadTitle: "Protect your children today",
      downloadDesc: "Download SafeCallKids and have peace of mind knowing your children are safe.",
      comingSoon: "Coming soon to",
      googlePlay: "Google Play",
      apkDownload: "APK Download",
      cookieText: "We use cookies to improve your experience. By continuing, you accept our cookie policy.",
      configure: "Configure",
      acceptAll: "Accept All",
      contact: "Contact",
      privacy: "Privacy Policy",
      terms: "Terms and Conditions",
      cookies: "Cookies"
    }
  };

  const t = translations[currentLang as keyof typeof translations];

  // Funções para lidar com cookies
  const handleAcceptCookies = () => {
    localStorage.setItem('cookiesAccepted', 'true');
    setCookieBannerVisible(false);
  };

  const handleConfigureCookies = () => {
    if (typeof window !== 'undefined' && window.openCookieSettingsModal) {
      window.openCookieSettingsModal();
    }
  };

  // Função para fechar menu mobile ao clicar em link
  const handleMobileMenuLinkClick = () => {
    setMobileMenuOpen(false);
  };

  // Funções de download
  const handlePlayStoreClick = () => {
    // Em breve - pode adicionar link quando disponível
    alert(currentLang === 'pt' ? 'Em breve na Google Play Store!' : 'Coming soon to Google Play Store!');
  };

  const handleApkDownload = () => {
    // Link para download do APK - substituir por link real
    alert(currentLang === 'pt' ? 'Download APK em breve!' : 'APK download coming soon!');
  };

  return (
    <>
      <Head>
        <title>{t.title}</title>
        <meta name="description" content={t.description} />
        <link rel="icon" href="/assets/Safecallkids/safecallkids-favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/assets/Safecallkids/safecallkids-favicon.png" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <script 
          type="text/javascript" 
          src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"
          async
        ></script>
      </Head>

      <div className={styles.safeCallKidsPage}>
        {/* Language Switcher */}
        <div className={styles.languageSwitcher}>
          <button 
            className={`${styles.langBtn} ${currentLang === 'pt' ? styles.active : ''}`}
            onClick={() => setCurrentLang('pt')}
          >
            PT
          </button>
          <button 
            className={`${styles.langBtn} ${currentLang === 'en' ? styles.active : ''}`}
            onClick={() => setCurrentLang('en')}
          >
            EN
          </button>
        </div>

        {/* Header */}
        <header className={styles.header}>
          <nav className={styles.nav}>
            <div className={styles.navContainer}>
              <div className={styles.navLogo}>
                <img src="/assets/logos/safecallkids.jpg" alt="SafeCallKids" className={styles.logo} />
                <span className={styles.logoText}>SafeCallKids</span>
              </div>
              
              <div className={styles.navLinks}>
                <a href="/" className={styles.homeLink}>
                  <i className="fas fa-home"></i>
                  <span>{t.home}</span>
                </a>
                <a href="#features">{t.features}</a>
                <a href="#how-it-works">{t.howItWorks}</a>
                <a href="#download">{t.download}</a>
              </div>
              
              <div 
                className={`${styles.mobileMenuToggle} ${styles.menuBtnVisible}`}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <i className={mobileMenuOpen ? "fas fa-times" : "fas fa-bars"}></i>
                <span className={styles.srOnly}>Menu</span>
              </div>
            </div>
          </nav>
        </header>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className={styles.mobileMenuOverlay}>
            <div className={styles.mobileMenuContent}>
              <div className={styles.mobileMenuHeader}>
                <div className={styles.mobileMenuLogo}>
                  <img src="/assets/logos/safecallkids.jpg" alt="SafeCallKids" className={styles.logo} />
                  <span className={styles.logoText}>SafeCallKids</span>
                </div>
                <div className={styles.mobileMenuActions}>
                  <button 
                    className={styles.mobileMenuClose}
                    onClick={() => setMobileMenuOpen(false)}
                    aria-label="Fechar menu"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              </div>
              
              <div className={styles.mobileMenuLinks}>
                <a href="/" className={styles.mobileMenuLink} onClick={handleMobileMenuLinkClick}>
                  <i className="fas fa-home"></i>
                  <span>{t.home}</span>
                </a>
                <a href="#features" className={styles.mobileMenuLink} onClick={handleMobileMenuLinkClick}>
                  <i className="fas fa-star"></i>
                  <span>{t.features}</span>
                </a>
                <a href="#how-it-works" className={styles.mobileMenuLink} onClick={handleMobileMenuLinkClick}>
                  <i className="fas fa-cogs"></i>
                  <span>{t.howItWorks}</span>
                </a>
                <a href="#download" className={styles.mobileMenuLink} onClick={handleMobileMenuLinkClick}>
                  <i className="fas fa-download"></i>
                  <span>{t.download}</span>
                </a>
                
                <div className={styles.mobileLangButtonsFooter}>
                  <button 
                    className={`${styles.mobileLangBtn} ${currentLang === 'pt' ? styles.active : ''}`}
                    onClick={() => setCurrentLang('pt')}
                  >
                    <i className="fas fa-flag"></i>
                    Português
                  </button>
                  <button 
                    className={`${styles.mobileLangBtn} ${currentLang === 'en' ? styles.active : ''}`}
                    onClick={() => setCurrentLang('en')}
                  >
                    <i className="fas fa-flag"></i>
                    English
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroContainer}>
            <div className={styles.heroContent}>
              <h1 className={styles.heroTitle}>
                <span>{t.heroTitle1}</span>
                <span className={styles.highlight}>{t.heroTitle2}</span>
              </h1>
              <p className={styles.heroDescription}>
                {t.heroDescription}
              </p>
              
              <div className={styles.heroButtons}>
                <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handlePlayStoreClick}>
                  <i className="fab fa-google-play"></i>
                  <span>{t.playStoreBtn}</span>
                </button>
                <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={handleApkDownload}>
                  <i className="fas fa-download"></i>
                  <span>{t.downloadApk}</span>
                </button>
              </div>
            </div>
            
            <div className={styles.heroImage}>
              <div className={styles.phoneMockup}>
                <div className={styles.phoneScreen}>
                  <img src="/assets/logos/sfc r.jpg" alt="SafeCallKids App Interface" className={styles.appScreenshot} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className={styles.features}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <h2>{t.featuresTitle}</h2>
              <p>{t.featuresSubtitle}</p>
            </div>
            
            <div className={styles.featuresGrid}>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <i className="fas fa-shield-alt"></i>
                </div>
                <h3>{t.autoBlockTitle}</h3>
                <p>{t.autoBlockDesc}</p>
              </div>
              
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <i className="fas fa-users"></i>
                </div>
                <h3>{t.safeContactsTitle}</h3>
                <p>{t.safeContactsDesc}</p>
              </div>
              
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <i className="fas fa-clock"></i>
                </div>
                <h3>{t.reportsTitle}</h3>
                <p>{t.reportsDesc}</p>
              </div>
              
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <i className="fas fa-mobile-alt"></i>
                </div>
                <h3>{t.easyUseTitle}</h3>
                <p>{t.easyUseDesc}</p>
              </div>
              
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <i className="fas fa-bell-slash"></i>
                </div>
                <h3>{t.silentBlockTitle}</h3>
                <p>{t.silentBlockDesc}</p>
              </div>
              
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <i className="fas fa-heart"></i>
                </div>
                <h3>{t.peaceOfMindTitle}</h3>
                <p>{t.peaceOfMindDesc}</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className={styles.howItWorks}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <h2>{t.howItWorksTitle}</h2>
              <p>{t.howItWorksSubtitle}</p>
            </div>
            
            <div className={styles.steps}>
              <div className={styles.step}>
                <div className={styles.stepNumber}>1</div>
                <div className={styles.stepContent}>
                  <h3>{t.step1Title}</h3>
                  <p>{t.step1Desc}</p>
                </div>
              </div>
              
              <div className={styles.step}>
                <div className={styles.stepNumber}>2</div>
                <div className={styles.stepContent}>
                  <h3>{t.step2Title}</h3>
                  <p>{t.step2Desc}</p>
                </div>
              </div>
              
              <div className={styles.step}>
                <div className={styles.stepNumber}>3</div>
                <div className={styles.stepContent}>
                  <h3>{t.step3Title}</h3>
                  <p>{t.step3Desc}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Download Section */}
        <section id="download" className={styles.download}>
          <div className={styles.container}>
            <div className={styles.downloadContent}>
              <h2>{t.downloadTitle}</h2>
              <p>{t.downloadDesc}</p>
              
              <div className={styles.downloadButtons}>
                <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handlePlayStoreClick}>
                  <i className="fab fa-google-play"></i>
                  <div>
                    <small>{t.comingSoon}</small>
                    <span>{t.googlePlay}</span>
                  </div>
                </button>
                
                <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleApkDownload}>
                  <i className="fas fa-download"></i>
                  <div>
                    <small>{t.download}</small>
                    <span>{t.apkDownload}</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className={styles.footer}>
          <div className={styles.container}>
            <div className={styles.footerSignature}>
              <div className={styles.footerBrand}>
                <h4 className={styles.companyName}>SafeCallKids</h4>
                <p className={styles.companyTagline}>Um produto da Prismas 33</p>
              </div>
              
              <div className={styles.footerDivider}></div>
              
              <div className={styles.footerDetails}>
                <div className={styles.ownershipInfo}>
                  <p>owned by <strong>Prismas e Quadriláteros Unip. Lda.</strong></p>
                  <p className={styles.established}>Estabelecida em 2020 • Portugal</p>
                </div>
                
                <div className={styles.copyrightInfo}>
                  <p>&copy; 2025 Todos os direitos reservados.</p>
                  <div className={styles.legalLinks}>
                    <a href="#contact" onClick={() => window.openContactModal && window.openContactModal()}>{t.contact}</a>
                    <span className={styles.divider}>|</span>
                    <a href="#privacy" onClick={() => window.openPrivacyModal && window.openPrivacyModal()}>{t.privacy}</a>
                    <span className={styles.divider}>|</span>
                    <a href="#terms" onClick={() => window.openTermsModal && window.openTermsModal()}>{t.terms}</a>
                    <span className={styles.divider}>|</span>
                    <a href="#cookies" onClick={() => window.openCookieSettingsModal && window.openCookieSettingsModal()}>{t.cookies}</a>
                  </div>
                  
                  <div className={styles.socialLinks}>
                    <a href="#" aria-label="LinkedIn">
                      <i className="fab fa-linkedin-in"></i>
                    </a>
                    <a href="#" aria-label="Twitter">
                      <i className="fab fa-twitter"></i>
                    </a>
                    <a href="#" aria-label="GitHub">
                      <i className="fab fa-github"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </footer>

        {/* Cookie Banner */}
        {cookieBannerVisible && (
          <div className={styles.cookieBanner}>
            <div className={styles.cookieContent}>
              <div className={styles.cookieIcon}>
                <i className="fas fa-cookie-bite"></i>
              </div>
              <div className={styles.cookieText}>
                <p>{t.cookieText}</p>
              </div>
              <div className={styles.cookieActions}>
                <button className={`${styles.cookieBtn} ${styles.secondary}`} onClick={handleConfigureCookies}>
                  {t.configure}
                </button>
                <button 
                  className={`${styles.cookieBtn} ${styles.primary}`}
                  onClick={handleAcceptCookies}
                >
                  {t.acceptAll}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modals Component */}
        <Modals currentLang={currentLang} />
      </div>
    </>
  );
}