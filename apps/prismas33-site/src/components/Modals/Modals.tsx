'use client';

import { useState, useEffect } from 'react';
import styles from './Modals.module.css';

interface ModalsProps {
  currentLang: string;
}

// Declarações globais para EmailJS e Firebase
declare global {
  interface Window {
    emailjs: any;
    firebaseApp: any;
    firestoreDb: any;
    firestoreCollection: any;
    firestoreAddDoc: any;
    firestoreServerTimestamp: any;
    openContactModal: () => void;
    openPrivacyModal: () => void;
    openTermsModal: () => void;
    openCookieSettingsModal: () => void;
  }
}

export default function Modals({ currentLang }: ModalsProps) {
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [cookieSettingsOpen, setCookieSettingsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Traduções para os modais
  const translations = {
    pt: {
      contact: "Entre em Contacto",
      contactDesc: "Envie-nos uma mensagem e entraremos em contacto o mais breve possível.",
      name: "Nome",
      email: "Email",
      subject: "Assunto",
      message: "Mensagem",
      sendMessage: "Enviar Mensagem",
      sending: "A enviar...",
      messageSent: "Mensagem enviada com sucesso!",
      privacy: "Política de Privacidade",
      terms: "Termos e Condições",
      cookieSettings: "Configurações de Cookies",
      essentialCookies: "Cookies Essenciais",
      analyticalCookies: "Cookies Analíticos",
      marketingCookies: "Cookies de Marketing",
      savePreferences: "Guardar Preferências",
      acceptAll: "Aceitar Todos",
      rejectOptional: "Rejeitar Opcionais",
      emailError: "Por favor, insira um email válido.",
      emailjsError: "Erro ao enviar mensagem. Tente novamente.",
      required: "Este campo é obrigatório."
    },
    en: {
      contact: "Contact Us",
      contactDesc: "Send us a message and we'll get back to you as soon as possible.",
      name: "Name",
      email: "Email", 
      subject: "Subject",
      message: "Message",
      sendMessage: "Send Message",
      sending: "Sending...",
      messageSent: "Message sent successfully!",
      privacy: "Privacy Policy",
      terms: "Terms and Conditions",
      cookieSettings: "Cookie Settings",
      essentialCookies: "Essential Cookies",
      analyticalCookies: "Analytical Cookies",
      marketingCookies: "Marketing Cookies",
      savePreferences: "Save Preferences",
      acceptAll: "Accept All",
      rejectOptional: "Reject Optional",
      emailError: "Please enter a valid email.",
      emailjsError: "Error sending message. Please try again.",
      required: "This field is required."
    }
  };

  const t = translations[currentLang as keyof typeof translations];

  // Configurações do EmailJS (usando variáveis de ambiente)
  const emailjsConfig = {
    publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
    serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
    templateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID
  };

  // Função para validar email
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Função para fechar modais ao clicar fora
  const handleModalBackdropClick = (e: React.MouseEvent, closeModal: () => void) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  // Função para envio do formulário de contato (sistema original)
  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (isSubmitting) return;

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const subject = formData.get('subject') as string;
    const message = formData.get('message') as string;

    // Validação
    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      alert(t.required);
      return;
    }

    if (!validateEmail(email)) {
      alert(t.emailError);
      return;
    }

    setIsSubmitting(true);

    try {
      // Verificar se EmailJS está carregado
      if (typeof window.emailjs === 'undefined') {
        console.error('EmailJS not loaded');
        alert(t.emailjsError);
        setIsSubmitting(false);
        return;
      }

      // Enviar via EmailJS (configuração original)
      const response = await window.emailjs.send(
        emailjsConfig.serviceId,
        emailjsConfig.templateId,
        {
          from_name: name,
          from_email: email,
          subject: subject,
          message: message
        },
        emailjsConfig.publicKey
      );

      console.log('Email sent successfully:', response);
      setSubmitSuccess(true);
      
      // Resetar formulário após 2 segundos
      setTimeout(() => {
        setContactModalOpen(false);
        setSubmitSuccess(false);
        setIsSubmitting(false);
        // Reset form
        (e.target as HTMLFormElement).reset();
      }, 2000);

    } catch (error) {
      console.error('Error sending email:', error);
      alert(t.emailjsError);
      setIsSubmitting(false);
    }
  };

  // Inicializar EmailJS quando o componente monta
  useEffect(() => {
    // Inicializar EmailJS se não estiver inicializado
    if (typeof window !== 'undefined' && window.emailjs && !window.emailjs.init) {
      window.emailjs.init({ publicKey: emailjsConfig.publicKey });
      console.log('EmailJS initialized in Modals component');
    }
  }, []);

  // Funções globais para abrir modais (compatibilidade com sistema original)
  useEffect(() => {
    // Disponibilizar funções globalmente
    window.openContactModal = () => setContactModalOpen(true);
    window.openPrivacyModal = () => setPrivacyModalOpen(true);
    window.openTermsModal = () => setTermsModalOpen(true);
    window.openCookieSettingsModal = () => setCookieSettingsOpen(true);
    
    return () => {
      // Cleanup
      (window as any).openContactModal = undefined;
      (window as any).openPrivacyModal = undefined;
      (window as any).openTermsModal = undefined;
      (window as any).openCookieSettingsModal = undefined;
    };
  }, []);

  return (
    <>
      {/* Contact Modal */}
      {contactModalOpen && (
        <div 
          className={styles.modal}
          onClick={(e) => handleModalBackdropClick(e, () => setContactModalOpen(false))}
        >
          <div className={styles.modalContent}>
            <span 
              className={styles.close}
              onClick={() => setContactModalOpen(false)}
            >
              &times;
            </span>
            <div className={styles.modalHeader}>
              <div className={styles.modalIcon}>
                <i className="fas fa-envelope"></i>
              </div>
              <h3>{t.contact}</h3>
            </div>
            <div className={styles.contactContent}>
              <p>{t.contactDesc}</p>
              {!submitSuccess ? (
                <form onSubmit={handleContactSubmit}>
                  <div className={styles.formGroup}>
                    <label htmlFor="contactName">{t.name} *</label>
                    <input 
                      type="text" 
                      id="contactName" 
                      name="name" 
                      placeholder="O seu nome completo"
                      required 
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="contactEmail">{t.email} *</label>
                    <input 
                      type="email" 
                      id="contactEmail" 
                      name="email" 
                      placeholder="o-seu@email.com" 
                      required 
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="contactSubject">{t.subject} *</label>
                    <input 
                      type="text" 
                      id="contactSubject" 
                      name="subject" 
                      placeholder="Assunto da mensagem"
                      required 
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="contactMessage">{t.message} *</label>
                    <textarea 
                      id="contactMessage" 
                      name="message" 
                      placeholder="Escreva a sua mensagem aqui..."
                      rows={4} 
                      required
                      disabled={isSubmitting}
                    ></textarea>
                  </div>
                  <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        {t.sending}
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane"></i>
                        {t.sendMessage}
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className={styles.successMessage}>
                  <i className="fas fa-check-circle"></i>
                  <span>{t.messageSent}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {privacyModalOpen && (
        <div 
          className={styles.modal}
          onClick={(e) => handleModalBackdropClick(e, () => setPrivacyModalOpen(false))}
        >
          <div className={styles.modalContent}>
            <span 
              className={styles.close}
              onClick={() => setPrivacyModalOpen(false)}
            >
              &times;
            </span>
            <div className={styles.modalHeader}>
              <div className={styles.modalIcon}>
                <i className="fas fa-shield-alt"></i>
              </div>
              <h3>{t.privacy}</h3>
            </div>
            <div className={styles.privacyContent}>
              <h4>1. Responsável pelo Tratamento de Dados</h4>
              <p>Prismas33, com sede em Portugal, é responsável pelo tratamento dos seus dados pessoais.</p>
              
              <h4>2. Dados Recolhidos</h4>
              <p>Recolhemos apenas os dados necessários para fornecer os nossos serviços, incluindo:</p>
              <ul>
                <li>Dados de contacto (email)</li>
                <li>Dados de navegação (cookies)</li>
                <li>Informações técnicas (endereço IP, browser)</li>
              </ul>
              
              <h4>3. Finalidades do Tratamento</h4>
              <p>Os seus dados são utilizados para:</p>
              <ul>
                <li>Fornecer os nossos serviços</li>
                <li>Comunicar sobre produtos e atualizações</li>
                <li>Melhorar a experiência do utilizador</li>
                <li>Cumprir obrigações legais</li>
              </ul>
              
              <h4>4. Base Legal</h4>
              <p>O tratamento baseia-se no consentimento, interesse legítimo e cumprimento de obrigações legais.</p>
              
              <h4>5. Partilha de Dados</h4>
              <p>Não partilhamos os seus dados com terceiros, exceto quando legalmente obrigatório.</p>
              
              <h4>6. Direitos do Titular</h4>
              <p>Tem direito a:</p>
              <ul>
                <li>Aceder aos seus dados</li>
                <li>Retificar dados incorretos</li>
                <li>Apagar dados (direito ao esquecimento)</li>
                <li>Portabilidade dos dados</li>
                <li>Opor-se ao tratamento</li>
                <li>Limitação do tratamento</li>
              </ul>
              
              <h4>7. Retenção de Dados</h4>
              <p>Os dados são conservados pelo tempo necessário para as finalidades estabelecidas.</p>
              
              <h4>8. Contacto</h4>
              <p>Para exercer os seus direitos ou esclarecimentos, contacte-nos através do email: privacy@prismas33.com</p>
            </div>
          </div>
        </div>
      )}

      {/* Terms Modal */}
      {termsModalOpen && (
        <div 
          className={styles.modal}
          onClick={(e) => handleModalBackdropClick(e, () => setTermsModalOpen(false))}
        >
          <div className={styles.modalContent}>
            <span 
              className={styles.close}
              onClick={() => setTermsModalOpen(false)}
            >
              &times;
            </span>
            <div className={styles.modalHeader}>
              <div className={styles.modalIcon}>
                <i className="fas fa-file-contract"></i>
              </div>
              <h3>{t.terms}</h3>
            </div>
            <div className={styles.termsContent}>
              <h4>1. Aceitação dos Termos</h4>
              <p>Ao utilizar este website, aceita estar vinculado a estes termos e condições.</p>
              
              <h4>2. Uso do Website</h4>
              <p>Este website destina-se a fins informativos sobre os produtos e serviços da Prismas 33.</p>
              
              <h4>3. Propriedade Intelectual</h4>
              <p>Todo o conteúdo deste website é propriedade da Prismas 33 e está protegido por direitos de autor.</p>
              
              <h4>4. Disponibilidade do Serviço</h4>
              <p>Esforçamo-nos para manter o website disponível 24/7, mas não garantimos disponibilidade contínua.</p>
              
              <h4>5. Limitação de Responsabilidade</h4>
              <p>A Prismas33 não se responsabiliza por danos diretos, indiretos, incidentais ou consequenciais.</p>
              
              <h4>6. Modificações</h4>
              <p>Reservamo-nos o direito de modificar estes termos a qualquer momento.</p>
              
              <h4>7. Lei Aplicável</h4>
              <p>Estes termos são regidos pela lei portuguesa.</p>
              
              <h4>8. Contacto</h4>
              <p>Para questões relacionadas com estes termos, contacte-nos através do email: legal@prismas33.com</p>
            </div>
          </div>
        </div>
      )}

      {/* Cookie Settings Modal */}
      {cookieSettingsOpen && (
        <div 
          className={styles.modal}
          onClick={(e) => handleModalBackdropClick(e, () => setCookieSettingsOpen(false))}
        >
          <div className={styles.modalContent}>
            <span 
              className={styles.close}
              onClick={() => setCookieSettingsOpen(false)}
            >
              &times;
            </span>
            <div className={styles.modalHeader}>
              <div className={styles.modalIcon}>
                <i className="fas fa-cookie-bite"></i>
              </div>
              <h3>{t.cookieSettings}</h3>
            </div>
            <div className={styles.cookieSettings}>
              <p>Personalize as suas preferências de cookies:</p>
              
              <div className={styles.cookieCategory}>
                <div className={styles.cookieToggle}>
                  <label className={styles.switch}>
                    <input type="checkbox" id="essentialCookies" checked disabled />
                    <span className={styles.slider}></span>
                  </label>
                  <div className={styles.cookieInfo}>
                    <h4>{t.essentialCookies}</h4>
                    <p>Necessários para o funcionamento básico do site.</p>
                  </div>
                </div>
              </div>
              
              <div className={styles.cookieCategory}>
                <div className={styles.cookieToggle}>
                  <label className={styles.switch}>
                    <input type="checkbox" id="analyticalCookies" />
                    <span className={styles.slider}></span>
                  </label>
                  <div className={styles.cookieInfo}>
                    <h4>{t.analyticalCookies}</h4>
                    <p>Ajudam-nos a entender como utiliza o nosso site.</p>
                  </div>
                </div>
              </div>
              
              <div className={styles.cookieCategory}>
                <div className={styles.cookieToggle}>
                  <label className={styles.switch}>
                    <input type="checkbox" id="marketingCookies" />
                    <span className={styles.slider}></span>
                  </label>
                  <div className={styles.cookieInfo}>
                    <h4>{t.marketingCookies}</h4>
                    <p>Utilizados para personalizar anúncios e conteúdo.</p>
                  </div>
                </div>
              </div>
              
              <div className={styles.cookieActions}>
                <button 
                  className={`${styles.cookieBtn} ${styles.secondary}`}
                  onClick={() => {
                    // Rejeitar cookies opcionais
                    localStorage.setItem('prismas33_cookie_consent', JSON.stringify({
                      hasConsented: true,
                      essential: true,
                      analytical: false,
                      marketing: false,
                      timestamp: Date.now()
                    }));
                    setCookieSettingsOpen(false);
                  }}
                >
                  {t.rejectOptional}
                </button>
                <button 
                  className={`${styles.cookieBtn} ${styles.primary}`}
                  onClick={() => {
                    // Salvar preferências atuais
                    const analytical = (document.getElementById('analyticalCookies') as HTMLInputElement)?.checked || false;
                    const marketing = (document.getElementById('marketingCookies') as HTMLInputElement)?.checked || false;
                    
                    localStorage.setItem('prismas33_cookie_consent', JSON.stringify({
                      hasConsented: true,
                      essential: true,
                      analytical: analytical,
                      marketing: marketing,
                      timestamp: Date.now()
                    }));
                    setCookieSettingsOpen(false);
                  }}
                >
                  {t.savePreferences}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
