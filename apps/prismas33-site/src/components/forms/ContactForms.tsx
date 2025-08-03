'use client';

import { useState } from 'react';
import { saveContactMessage, saveNotification } from '@/lib/firebase/integration';

interface ContactFormProps {
  currentLang?: string;
  onClose?: () => void;
}

export function ContactForm({ currentLang = 'pt', onClose }: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState('');

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
      close: "Fechar",
      nameRequired: "Nome é obrigatório",
      emailRequired: "Email é obrigatório",
      emailInvalid: "Email inválido",
      subjectRequired: "Assunto é obrigatório",
      messageRequired: "Mensagem é obrigatória",
      errorSending: "Erro ao enviar mensagem. Tente novamente."
    },
    en: {
      contact: "Get in Touch",
      contactDesc: "Send us a message and we'll get back to you as soon as possible.",
      name: "Name",
      email: "Email",
      subject: "Subject",
      message: "Message",
      sendMessage: "Send Message",
      sending: "Sending...",
      messageSent: "Message sent successfully!",
      close: "Close",
      nameRequired: "Name is required",
      emailRequired: "Email is required",
      emailInvalid: "Invalid email",
      subjectRequired: "Subject is required",
      messageRequired: "Message is required",
      errorSending: "Error sending message. Please try again."
    }
  };

  const t = translations[currentLang as keyof typeof translations] || translations.pt;

  function validateForm() {
    if (!formData.name.trim()) {
      setError(t.nameRequired);
      return false;
    }
    if (!formData.email.trim()) {
      setError(t.emailRequired);
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError(t.emailInvalid);
      return false;
    }
    if (!formData.subject.trim()) {
      setError(t.subjectRequired);
      return false;
    }
    if (!formData.message.trim()) {
      setError(t.messageRequired);
      return false;
    }
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Salvar no sistema admin (Firebase)
      await saveContactMessage({
        ...formData,
        userAgent: navigator.userAgent,
        language: navigator.language,
        referrer: document.referrer || 'direct'
      });

      setSubmitSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });

      // Fechar modal após 2 segundos
      setTimeout(() => {
        setSubmitSuccess(false);
        onClose?.();
      }, 2000);

    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
      setError(t.errorSending);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitSuccess) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.messageSent}</h3>
        <p className="text-gray-600">Responderemos em breve!</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.contact}</h2>
        <p className="text-gray-600">{t.contactDesc}</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t.name} *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t.email} *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t.subject} *
        </label>
        <input
          type="text"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t.message} *
        </label>
        <textarea
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          rows={5}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          required
        />
      </div>

      <div className="flex justify-end space-x-3">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            {t.close}
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? t.sending : t.sendMessage}
        </button>
      </div>
    </form>
  );
}

interface NotifyFormProps {
  appName: string;
  currentLang?: string;
  onClose?: () => void;
}

export function NotifyForm({ appName, currentLang = 'pt', onClose }: NotifyFormProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState('');

  const translations = {
    pt: {
      notify: "Ser Notificado",
      notifyDesc: "Deixe o seu email para ser notificado quando esta aplicação estiver disponível.",
      email: "Email",
      notifyMe: "Notificar-me",
      sending: "A enviar...",
      notificationSent: "Registo efetuado com sucesso!",
      close: "Fechar",
      emailRequired: "Email é obrigatório",
      emailInvalid: "Email inválido",
      errorSending: "Erro ao registar. Tente novamente."
    },
    en: {
      notify: "Get Notified",
      notifyDesc: "Leave your email to be notified when this app becomes available.",
      email: "Email",
      notifyMe: "Notify Me",
      sending: "Sending...",
      notificationSent: "Registration successful!",
      close: "Close",
      emailRequired: "Email is required",
      emailInvalid: "Invalid email",
      errorSending: "Registration error. Please try again."
    }
  };

  const t = translations[currentLang as keyof typeof translations] || translations.pt;

  function validateEmail() {
    if (!email.trim()) {
      setError(t.emailRequired);
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t.emailInvalid);
      return false;
    }
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!validateEmail()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Salvar no sistema admin (Firebase)
      await saveNotification({
        email,
        appName,
        userAgent: navigator.userAgent,
        language: navigator.language,
        referrer: document.referrer || 'direct'
      });

      setSubmitSuccess(true);
      setEmail('');

      // Fechar modal após 2 segundos
      setTimeout(() => {
        setSubmitSuccess(false);
        onClose?.();
      }, 2000);

    } catch (err) {
      console.error('Erro ao registar notificação:', err);
      setError(t.errorSending);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitSuccess) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.notificationSent}</h3>
        <p className="text-gray-600">Obrigado pelo seu interesse!</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.notify}</h2>
        <p className="text-gray-600">{t.notifyDesc}</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t.email} *
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="seu@email.com"
          required
        />
      </div>

      <div className="flex justify-end space-x-3">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            {t.close}
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? t.sending : t.notifyMe}
        </button>
      </div>
    </form>
  );
}
