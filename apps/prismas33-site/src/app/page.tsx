'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import Modals from '../components/Modals/Modals'
import Particles from '../components/Particles/Particles'
import { getProjects, type Project } from '../lib/firebase/firestore'
import { CATEGORIES, getCategoryById, CardBadge } from '../components/Categories/Categories'
import '../components/Categories/Categories.css'
import './tech-components.css'

export default function HomePage() {
  const [currentLang, setCurrentLang] = useState('pt')
  const [showCookieBanner, setShowCookieBanner] = useState(false)
  const [showNotifyModal, setShowNotifyModal] = useState(false)
  const [currentApp, setCurrentApp] = useState('')
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoadingProjects, setIsLoadingProjects] = useState(true)
  const [notification, setNotification] = useState<{show: boolean, message: string, type: 'success' | 'error' | 'info'}>({
    show: false,
    message: '',
    type: 'info'
  })

  // Refs para scroll effects
  const heroRef = useRef(null)
  const appsRef = useRef(null)
  const showcaseRef = useRef(null)
  const showcaseGridRef = useRef<HTMLDivElement>(null)
  const showcaseTrackRef = useRef<HTMLDivElement>(null)
  const contentContainerRef = useRef<HTMLDivElement>(null)
  
  // Enhanced scroll effects with smooth transitions
  const { scrollYProgress } = useScroll()
  const { scrollYProgress: contentScrollProgress } = useScroll({
    target: contentContainerRef,
    offset: ["start end", "end start"]
  })
  
  // Scroll-based easing function for smoother transitions
  const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)
  
  // Hero parallax effects - mais suaves com spring easing
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -150], { ease: easeOut })
  const contentOpacity = useTransform(scrollYProgress, [0, 0.2, 0.6, 1], [1, 0.98, 0.8, 0.4])
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 0.05, 0.3, 0.6])
  
  // Parallax sutil para elementos flutuantes com diferentes velocidades
  const floatY1 = useTransform(scrollYProgress, [0, 1], [0, -120])
  const floatY2 = useTransform(scrollYProgress, [0, 1], [0, -60])
  const floatY3 = useTransform(scrollYProgress, [0, 1], [0, -180])
  const floatRotate = useTransform(scrollYProgress, [0, 1], [0, 30])
  
  // Enhanced smooth section transitions with stagger effect
  const appsY = useTransform(contentScrollProgress, [0, 0.25], [50, 0], { ease: easeOut })
  const appsOpacity = useTransform(contentScrollProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0.9])
  const appsScale = useTransform(contentScrollProgress, [0, 0.2], [0.95, 1])
  
  const showcaseY = useTransform(contentScrollProgress, [0.15, 0.5], [80, 0], { ease: easeOut })
  const showcaseOpacity = useTransform(contentScrollProgress, [0.25, 0.4, 0.9, 1], [0, 1, 1, 0.95])
  const showcaseScale = useTransform(contentScrollProgress, [0.25, 0.45], [0.98, 1])
  
  // Subtle background shift that follows scroll
  const backgroundGradient = useTransform(
    scrollYProgress,
    [0, 0.4, 0.8, 1],
    [
      "radial-gradient(ellipse at center, #1a1a1a 0%, #000000 100%)",
      "radial-gradient(ellipse at 60% center, #0f0f0f 0%, #000000 70%, #1a1a1a 100%)",
      "radial-gradient(ellipse at 80% center, #0a0a0a 0%, #000000 60%, #1a1a1a 100%)",
      "linear-gradient(180deg, #000000 0%, #0a0a0a 40%, #1a1a1a 100%)"
    ]
  )
  
  // Content blur effect for depth
  const contentBlur = useTransform(scrollYProgress, [0, 0.8], [0, 1])
  const backdropFilter = useTransform(contentBlur, [0, 1], ["blur(0px)", "blur(2px)"])

  useEffect(() => {
    // Verificar se precisa mostrar o banner de cookies
    const cookieConsent = localStorage.getItem('cookieConsent')
    if (!cookieConsent) {
      setTimeout(() => setShowCookieBanner(true), 1000)
    }

    // Carregar projetos do Firebase
    const loadProjects = async () => {
      try {
        setIsLoadingProjects(true)
        const firebaseProjects = await getProjects()
        setProjects(firebaseProjects)
      } catch (error) {
        console.error('Erro ao carregar projetos:', error)
        setProjects([])
      } finally {
        setIsLoadingProjects(false)
      }
    }

    loadProjects()

    // Initialize Firebase and EmailJS
    const initializeServices = async () => {
      if (typeof window !== 'undefined') {
        // EmailJS initialization com as configurações das variáveis de ambiente
        const emailjs = (await import('@emailjs/browser')).default
        const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
        
        if (publicKey) {
          emailjs.init(publicKey)
          // Fazer EmailJS disponível globalmente para compatibilidade
          ;(window as any).emailjs = emailjs
          console.log('EmailJS inicializado com variáveis de ambiente')
        } else {
          console.error('EmailJS Public Key não encontrada nas variáveis de ambiente')
        }
      }
    }
    
    initializeServices()
  }, [])

  const scrollToMarketplace = () => {
    const element = document.getElementById('available-apps')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ show: true, message, type })
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }))
    }, 5000)
  }

  const showComingSoon = () => {
    showNotification('Em breve! Esta funcionalidade estará disponível em breve.', 'info')
  }

  // Função para obter a classe de cor baseada na categoria
  const getCategoryColorClass = (category: string): string => {
    const categoryData = getCategoryById(category)
    return categoryData.id
  }

  // Função para abrir preview do projeto
  const openProjectPreview = (project: Project) => {
    if (project.demoUrl) {
      window.open(project.demoUrl, '_blank')
    } else {
      showComingSoon()
    }
  }

  // Função para gerar cartões de showcase do Firebase
  const generateShowcaseCards = () => {
    const showcaseCards: JSX.Element[] = []
    
    // Adicionar todos os projetos do Firebase (incluindo os com status 'coming-soon')
    projects.forEach((project, index) => {
      const colorClass = getCategoryColorClass(project.category)
      const isComingSoon = project.status === 'coming-soon'
      
      showcaseCards.push(
        <motion.div 
          key={`project-${project.id}`}
          className={`showcase-card ${colorClass} ${isComingSoon ? 'coming-soon' : 'firebase-project'}`}
          initial={{ opacity: 0, y: 50, rotateY: index % 2 === 0 ? -10 : 10 }}
          whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
          transition={{ duration: 0.8, delay: 0.1 * (index + 1) }}
          whileHover={{ 
            y: -10, 
            scale: 1.02,
            boxShadow: colorClass === 'premium' ? "0 25px 60px rgba(255, 107, 53, 0.3)" :
                      colorClass === 'enterprise' ? "0 25px 60px rgba(64, 224, 208, 0.3)" :
                      colorClass === 'creative' ? "0 25px 60px rgba(138, 43, 226, 0.3)" :
                      "0 25px 60px rgba(255, 215, 0, 0.3)"
          }}
          viewport={{ once: true }}
        >
          <div className="showcase-media">
            <div className="preview-screen">
              {project.images && project.images.length > 0 && !isComingSoon ? (
                <img 
                  src={project.images[0]} 
                  alt={project.name}
                  className="project-preview-image"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '8px'
                  }}
                />
              ) : isComingSoon ? (
                <div className={`screen-content ${colorClass}-preview coming-soon-screen`}>
                  <div className="coming-soon-icon">
                    <i className="fas fa-rocket"></i>
                  </div>
                  <div className="coming-soon-text">
                    <span>Em Breve</span>
                  </div>
                </div>
              ) : (
                <div className={`screen-content ${colorClass}-preview`}>
                  <div className="default-header"></div>
                  <div className="default-body"></div>
                  <div className="default-footer"></div>
                </div>
              )}
            </div>
            <CardBadge categoryId={project.category} className={isComingSoon ? "coming-soon-badge" : ""} />
            {/* Hover overlay with description - apenas para projetos não coming-soon */}
            {!isComingSoon && (
              <div className="project-hover-overlay">
                <div className="project-description">
                  <p>{project.description}</p>
                </div>
              </div>
            )}
          </div>
          <div className="showcase-info">
            <div className="showcase-content-top">
              <h3 className="showcase-name">{project.name}</h3>
              <div className="tech-description">
                {project.features && project.features.length > 0 ? (
                  project.features.join('.\n')
                ) : (
                  'React, Next.js e TypeScript.\nFirebase e integração completa.\nDesign responsivo e otimizado.'
                )}
              </div>
            </div>
            <div className="showcase-content-bottom">
              <div className="showcase-footer">
                <div className="price-tag">Sob Orçamento</div>
                <motion.button 
                  className={`preview-btn ${isComingSoon ? 'coming-soon-btn' : ''}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={isComingSoon ? showComingSoon : () => openProjectPreview(project)}
                  disabled={isComingSoon}
                >
                  <i className={isComingSoon ? "fas fa-clock" : "fas fa-eye"}></i>
                  {isComingSoon ? "Em Breve" : "Preview"}
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      )
    })

    // Duplicar todos os cartões para o efeito infinito (mínimo de 8 para o efeito funcionar bem)
    if (showcaseCards.length > 0) {
      const duplicatedCards = [...showcaseCards, ...showcaseCards]
      // Se ainda não temos cartões suficientes, duplicar mais uma vez
      if (duplicatedCards.length < 16) {
        return [...duplicatedCards, ...showcaseCards]
      }
      return duplicatedCards
    }
    
    return showcaseCards
  }

  const handleCookieAccept = () => {
    localStorage.setItem('cookieConsent', JSON.stringify({
      hasConsented: true,
      essential: true,
      analytical: true,
      marketing: true,
      timestamp: Date.now()
    }))
    setShowCookieBanner(false)
    showNotification('Preferências de cookies guardadas!', 'success')
  }

  const handleCookieReject = () => {
    localStorage.setItem('cookieConsent', JSON.stringify({
      hasConsented: true,
      essential: true,
      analytical: false,
      marketing: false,
      timestamp: Date.now()
    }))
    setShowCookieBanner(false)
    showNotification('Apenas cookies essenciais foram mantidos.', 'info')
  }

  const openNotifyModal = (appName: string) => {
    setCurrentApp(appName)
    setShowNotifyModal(true)
  }

  const closeNotifyModal = () => {
    setShowNotifyModal(false)
    setCurrentApp('')
  }

  // Funcionalidade de drag para pausar/retomar o carrossel
  useEffect(() => {
    const showcaseGrid = showcaseGridRef.current
    const showcaseTrack = showcaseTrackRef.current
    
    if (!showcaseGrid || !showcaseTrack) return

    let isDragging = false
    let startX = 0
    let scrollLeft = 0

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true
      startX = e.pageX - showcaseGrid.offsetLeft
      scrollLeft = showcaseGrid.scrollLeft
      showcaseGrid.style.cursor = 'grabbing'
      // Pausa a animação quando começar a arrastar
      showcaseTrack.style.animationPlayState = 'paused'
    }

    const handleMouseLeave = () => {
      isDragging = false
      showcaseGrid.style.cursor = 'grab'
      // Retoma a animação quando parar de arrastar
      showcaseTrack.style.animationPlayState = 'running'
    }

    const handleMouseUp = () => {
      isDragging = false
      showcaseGrid.style.cursor = 'grab'
      // Retoma a animação quando soltar o mouse
      showcaseTrack.style.animationPlayState = 'running'
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      e.preventDefault()
      const x = e.pageX - showcaseGrid.offsetLeft
      const walk = (x - startX) * 2
      showcaseGrid.scrollLeft = scrollLeft - walk
    }

    // Event listeners
    showcaseGrid.addEventListener('mousedown', handleMouseDown)
    showcaseGrid.addEventListener('mouseleave', handleMouseLeave)
    showcaseGrid.addEventListener('mouseup', handleMouseUp)
    showcaseGrid.addEventListener('mousemove', handleMouseMove)

    // Cleanup
    return () => {
      showcaseGrid.removeEventListener('mousedown', handleMouseDown)
      showcaseGrid.removeEventListener('mouseleave', handleMouseLeave)
      showcaseGrid.removeEventListener('mouseup', handleMouseUp)
      showcaseGrid.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <main className="scroll-experience">
      {/* Fixed Hero Background com Enhanced Motion */}
      <motion.div 
        className="hero-background-fixed"
        style={{ 
          y: heroY,
          background: backgroundGradient
        }}
      >
        {/* Background Particles */}
        <div style={{ width: '100%', height: '100%', position: 'absolute' }}>
          <Particles
            particleColors={['#ffffff', '#ffffff']}
            particleCount={200}
            particleSpread={10}
            speed={0.1}
            particleBaseSize={100}
            moveParticlesOnHover={true}
            alphaParticles={false}
            disableRotation={false}
          />
        </div>
        
        {/* Enhanced Floating Geometric Elements */}
        <div className="floating-elements">
          <motion.div 
            className="float-element element-1" 
            style={{ 
              y: floatY1,
              rotate: floatRotate,
              scale: useTransform(scrollYProgress, [0, 0.5], [1, 0.9])
            }}
          ></motion.div>
          <motion.div 
            className="float-element element-2" 
            style={{ 
              y: floatY2,
              scale: useTransform(scrollYProgress, [0, 0.5], [1, 0.8]),
              opacity: useTransform(scrollYProgress, [0, 0.8], [1, 0.4])
            }}
          ></motion.div>
        </div>
        
        {/* Enhanced Dark Overlay */}
        <motion.div 
          className="scroll-overlay"
          style={{ 
            opacity: overlayOpacity,
            background: useTransform(
              scrollYProgress,
              [0, 0.5, 1],
              [
                "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.1) 100%)",
                "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.4) 100%)",
                "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.7) 100%)"
              ]
            )
          }}
        />
      </motion.div>

      {/* Hero Content Layer que rola dentro do background fixo */}
      <motion.div 
        className="hero-content-layer"
        style={{ 
          opacity: contentOpacity,
          backdropFilter: backdropFilter
        }}
      >
        <div className="container" style={{ position: 'relative', zIndex: 10 }}>
          <motion.div 
            className="hero-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            {/* Logo Section */}
            <motion.div 
              className="logo-section"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <div className="logo-container">
                <div className="logo-wrapper">
                  {/* Logo Real da Prismas 33 */}
                  <div className="real-logo">
                    <img src="/assets/logos/logo.png" alt="Prismas 33 Logo" className="logo-image" />
                  </div>
                  
                  {/* Logo Geométrico (Fallback) */}
                  <div className="geometric-logo hidden">
                    <div className="prism">
                      <div className="prism-face face-1"></div>
                      <div className="prism-face face-2"></div>
                      <div className="prism-face face-3"></div>
                      <div className="shine"></div>
                    </div>
                  </div>
                </div>
                
                {/* Tech Rings around logo */}
                <div className="tech-rings">
                  <div className="ring ring-1"></div>
                  <div className="ring ring-2"></div>
                  <div className="ring ring-3"></div>
                </div>
              </div>
            </motion.div>
            
            {/* Main Content */}
            <motion.div 
              className="main-content"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              <div className="hero-text">
                <motion.h1 
                  className="hero-title"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  <span className="title-line">Tecnologia que</span>
                  <span className="title-line highlight">Refrata Soluções</span>
                </motion.h1>
                <motion.p 
                  className="hero-subtitle"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1 }}
                >
                  Ferramentas inteligentes para desenvolvedores,<br/>
                  empresas e mentes criativas
                </motion.p>
              </div>
              
              <motion.div 
                className="hero-actions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
              >
                <motion.button 
                  className="cta-button primary" 
                  onClick={scrollToMarketplace}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="button-text">Explore os Apps</span>
                  <div className="button-icon">
                    <i className="fas fa-arrow-right"></i>
                  </div>
                  <div className="button-bg"></div>
                </motion.button>
                
                <motion.button 
                  className="cta-button secondary" 
                  onClick={showComingSoon}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="button-text">Documentação</span>
                  <div className="button-icon">
                    <i className="fas fa-book"></i>
                  </div>
                  <div className="button-bg"></div>
                </motion.button>
              </motion.div>
            </motion.div>
            
            {/* Tech Stats */}
            <motion.div 
              className="tech-stats"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.4 }}
            >
              <motion.div 
                className="stat-item"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="stat-number">5+</div>
                <div className="stat-label">Apps em Desenvolvimento</div>
              </motion.div>
              <motion.div 
                className="stat-item"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="stat-number">33</div>
                <div className="stat-label">Tecnologias Integradas</div>
              </motion.div>
              <motion.div 
                className="stat-item"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="stat-number">∞</div>
                <div className="stat-label">Possibilidades</div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Scroll Indicator */}
        <motion.div 
          className="scroll-indicator"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 2 }}
        >
          <div className="scroll-line"></div>
          <div className="scroll-text">Explore</div>
        </motion.div>
      </motion.div>

      {/* Enhanced Scrolling Content Container */}
      <motion.div 
        ref={contentContainerRef}
        className="content-scroll-container"
        style={{
          y: useTransform(scrollYProgress, [0, 0.1], [50, 0])
        }}
      >
        {/* Cookie Banner */}
        {showCookieBanner && (
          <div id="cookieBanner" className="cookie-banner">
            <div className="cookie-content">
              <div className="cookie-icon">
                <i className="fas fa-cookie-bite"></i>
              </div>
              <div className="cookie-text">
                <h4>Este website utiliza cookies</h4>
                <p>Utilizamos cookies para melhorar a sua experiência de navegação, analisar o tráfego do site e personalizar conteúdo. Pode gerir as suas preferências de cookies em qualquer momento.</p>
              </div>
              <div className="cookie-actions">
                <button onClick={handleCookieAccept} className="cookie-btn accept">Aceitar Todos</button>
                <button onClick={handleCookieReject} className="cookie-btn reject">Rejeitar</button>
                <button onClick={() => (window as any).openCookieSettingsModal()} className="cookie-btn configure">Configurar</button>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Available Apps Section */}
        <motion.section 
          id="available-apps" 
          ref={appsRef}
          className="marketplace available-section"
          style={{
            y: appsY,
            opacity: appsOpacity,
            scale: appsScale
          }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true, margin: "-50px" }}
        >
          <div className="container">
            <motion.div 
              className="section-header"
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.8, 
                delay: 0.2,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
              viewport={{ once: true }}
            >
              <motion.h2 
                className="section-title"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
                style={{ color: '#FF6B35' }}
              >
                Apps Disponíveis
              </motion.h2>
            </motion.div>
            
            <motion.div 
              className="apps-grid-tech"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ 
                duration: 0.6,
                delay: 0.3,
                staggerChildren: 0.15
              }}
              viewport={{ once: true }}
            >
            {/* SafeCall Kids - APLICAÇÃO DISPONÍVEL */}
            <motion.div 
              className="app-card-tech available" 
              data-app="safecallkids"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              viewport={{ once: true }}
            >
              <div className="app-tech-header">
                <div className="app-icon-tech">
                  <i className="fas fa-shield-heart"></i>
                </div>
                <div className="app-status available">
                  <span className="status-dot"></span>
                  <span>Disponível</span>
                </div>
              </div>
              <div className="app-info">
                <h3 className="app-title-tech">SafeCall Kids</h3>
                <p className="app-description-tech">
                  Sistema de segurança para crianças com bloqueio inteligente de chamadas
                </p>
              </div>
              <div className="app-tech-footer">
                <div className="tech-tags">
                  <span className="tech-tag">Segurança</span>
                  <span className="tech-tag">Mobile</span>
                </div>
                <motion.button 
                  className="app-launch-btn" 
                  onClick={() => window.open('/safecallkids', '_blank')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <i className="fas fa-external-link-alt"></i>
                  Launch
                </motion.button>
              </div>
            </motion.div>
            
            {/* LinkMind - APLICAÇÃO DISPONÍVEL */}
            <motion.div 
              className="app-card-tech available" 
              data-app="linkmind"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -5, scale: 1.02 }}
              viewport={{ once: true }}
            >
              <div className="app-tech-header">
                <div className="app-icon-tech">
                  <i className="fas fa-link"></i>
                </div>
                <div className="app-status available">
                  <span className="status-dot"></span>
                  <span>Disponível</span>
                </div>
              </div>
              <div className="app-info">
                <h3 className="app-title-tech">LinkMind</h3>
                <p className="app-description-tech">
                  Plataforma de gestão pessoal e profissional com IA integrada
                </p>
              </div>
              <div className="app-tech-footer">
                <div className="tech-tags">
                  <span className="tech-tag">Produtividade</span>
                </div>
                <motion.button 
                  className="app-launch-btn" 
                  onClick={() => window.open('https://linkmind.space/', '_blank')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <i className="fas fa-external-link-alt"></i>
                  Launch
                </motion.button>
              </div>
            </motion.div>
            </motion.div>
          </div>
        </motion.section>

      {/* Premium Showcase - Vitrine de Luxo */}
      <motion.section 
        ref={showcaseRef}
        className="premium-showcase"
        style={{
          y: showcaseY,
          opacity: showcaseOpacity,
          scale: showcaseScale
        }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <div className="container">
          <motion.div 
            className="showcase-header"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="premium-badge">
              <i className="fas fa-rocket"></i>
              <span>Branding Premium</span>
            </div>
            <h2 className="showcase-title">
              Ter um negócio é uma coisa.
              <span className="title-accent">Criar autoridade digital é outra história.</span>
            </h2>
            <p className="showcase-subtitle">
              Transformamos a sua presença digital com branding de luxo,<br/>
              plataformas inteligentes e design pensado para conversão
            </p>
          </motion.div>

          <div className="showcase-grid" ref={showcaseGridRef}>
            <div className="showcase-track" ref={showcaseTrackRef}>
              {isLoadingProjects ? (
                // Loading placeholder cards
                Array.from({ length: 8 }).map((_, index) => (
                  <motion.div 
                    key={`loading-${index}`}
                    className="showcase-card loading"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
                  >
                    <div className="showcase-media">
                      <div className="preview-screen loading-screen">
                        <div className="loading-shimmer"></div>
                      </div>
                    </div>
                    <div className="showcase-info">
                      <div className="loading-badge"></div>
                      <div className="loading-title"></div>
                      <div className="loading-description"></div>
                      <div className="loading-footer"></div>
                    </div>
                  </motion.div>
                ))
              ) : (
                generateShowcaseCards()
              )}
            </div>
          </div>

          <motion.div 
            className="showcase-cta"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            viewport={{ once: true }}
          >
            <motion.button 
              className="showcase-explore-btn"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={showComingSoon}
            >
              <span>Transformar O Meu Negócio</span>
              <i className="fas fa-rocket"></i>
            </motion.button>
            <p className="showcase-note">
              ✔ Branding de luxo adaptado ao seu negócio ✔ Plataformas com CRM integrado ✔ SEO de alto nível ✔ Integração em poucos dias
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="footer">
\        <div className="container">
          <div className="footer-signature">
            <div className="footer-brand">
              <h4 className="company-name">Prismas 33</h4>
              <p className="company-tagline">Tecnologia que Refrata Soluções</p>
            </div>
            
            <div className="footer-details">
              <div className="ownership-info">
                <p>owned by <strong>Prismas e Quadriláteros Unip. Lda.</strong></p>
                <p className="established">Estabelecida em 2020 • Portugal</p>
              </div>
              
              <div className="copyright-info">
                <p>&copy; 2025 Todos os direitos reservados.</p>
                <div className="legal-links">
                  <a href="#contact" onClick={() => (window as any).openContactModal()}>Contato</a>
                  <span className="divider">|</span>
                  <a href="#privacy" onClick={() => (window as any).openPrivacyModal()}>Política de Privacidade</a>
                  <span className="divider">|</span>
                  <a href="#terms" onClick={() => (window as any).openTermsModal()}>Termos e Condições</a>
                  <span className="divider">|</span>
                  <a href="#cookies" onClick={() => (window as any).openCookieSettingsModal()}>Cookies</a>
                </div>
                <div className="social-links">
                  <a href="#" onClick={showComingSoon} aria-label="LinkedIn">
                    <i className="fab fa-linkedin-in"></i>
                  </a>
                  <a href="#" onClick={showComingSoon} aria-label="Twitter">
                    <i className="fab fa-twitter"></i>
                  </a>
                  <a href="#" onClick={showComingSoon} aria-label="GitHub">
                    <i className="fab fa-github"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals Component */}
      <Modals currentLang={currentLang} />

      {/* Cookie Banner */}
      {showCookieBanner && (
        <div className="cookie-banner">
          <div className="cookie-content">
            <div className="cookie-info">
              <div className="cookie-icon">
                <i className="fas fa-cookie-bite"></i>
              </div>
              <div className="cookie-text">
                <h4>Este website utiliza cookies</h4>
                <p>Utilizamos cookies para melhorar a sua experiência de navegação e analisar o tráfego do nosso website.</p>
              </div>
            </div>
            <div className="cookie-actions">
              <button onClick={() => (window as any).openCookieSettingsModal()} className="cookie-btn settings">
                <i className="fas fa-cog"></i>
                Configurações
              </button>
              <button onClick={handleCookieAccept} className="cookie-btn accept">
                <i className="fas fa-check"></i>
                Aceitar
              </button>
            </div>
          </div>
        </div>
      )}
      </motion.div>
    </main>
  )
}
