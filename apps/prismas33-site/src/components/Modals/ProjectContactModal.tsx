'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getProjects, type Project } from '../../lib/api/admin';
import styles from './ProjectContactModal.module.css';

interface ProjectContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProjectContactModal({ isOpen, onClose, onSuccess }: ProjectContactModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    projectType: '',
    isNewProject: true,
    message: ''
  });
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Carregar projetos quando modal abre
  useEffect(() => {
    if (isOpen) {
      loadProjects();
    }
  }, [isOpen]);

  const loadProjects = async () => {
    try {
      setIsLoadingProjects(true);
      const projectsData = await getProjects();
      setProjects(projectsData);
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.projectType.trim()) {
      newErrors.projectType = 'Tipo de projeto é obrigatório';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Mensagem é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/project-contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        onSuccess();
        onClose();
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          company: '',
          projectType: '',
          isNewProject: true,
          message: ''
        });
      } else {
        setErrors({ general: result.error || 'Erro ao enviar mensagem' });
      }
    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
      setErrors({ general: 'Erro ao enviar mensagem. Tente novamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleProjectTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    // Identifica se é um novo projeto baseado no valor selecionado
    const isNewProject = value.startsWith('novo-') || value === 'novo-projeto';
    
    setFormData(prev => ({
      ...prev,
      projectType: value,
      isNewProject
    }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className={styles.overlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div 
          className={styles.modal}
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 50 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.header}>
            <h2>Transformar O Meu Negócio</h2>
            <p>Conte-nos sobre o seu projeto e entraremos em contacto em breve!</p>
            <button 
              className={styles.closeBtn}
              onClick={onClose}
              type="button"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="name">Nome *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={errors.name ? styles.error : ''}
                  disabled={isSubmitting}
                />
                {errors.name && <span className={styles.errorText}>{errors.name}</span>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={errors.email ? styles.error : ''}
                  disabled={isSubmitting}
                />
                {errors.email && <span className={styles.errorText}>{errors.email}</span>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="phone">Telefone</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="company">Empresa</label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="projectType">Tipo de Projeto *</label>
              <select
                id="projectType"
                name="projectType"
                value={formData.projectType}
                onChange={handleProjectTypeChange}
                className={errors.projectType ? styles.error : ''}
                disabled={isSubmitting || isLoadingProjects}
              >
                <option value="">Selecione o tipo de projeto</option>
                <optgroup label="Novo Projeto">
                  <option value="novo-projeto">Novo Projeto Personalizado</option>
                  <option value="novo-website">Novo Website</option>
                  <option value="novo-ecommerce">Nova Loja Online</option>
                  <option value="novo-app">Nova Aplicação</option>
                  <option value="novo-crm">Novo Sistema CRM</option>
                </optgroup>
                <optgroup label="Projetos Existentes">
                  {projects.map((project) => (
                    <option key={project.id} value={project.name}>
                      {project.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Serviços">
                  <option value="orcamento">Solicitar Orçamento</option>
                  <option value="consultoria">Consultoria Técnica</option>
                  <option value="manutencao">Manutenção/Suporte</option>
                  <option value="integracao">Integração de Sistemas</option>
                </optgroup>
              </select>
              {errors.projectType && <span className={styles.errorText}>{errors.projectType}</span>}
              {isLoadingProjects && <span className={styles.loadingText}>Carregando projetos...</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="message">Mensagem *</label>
              <textarea
                id="message"
                name="message"
                rows={4}
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Descreva o seu projeto, objetivos e como podemos ajudar..."
                className={errors.message ? styles.error : ''}
                disabled={isSubmitting}
              />
              {errors.message && <span className={styles.errorText}>{errors.message}</span>}
            </div>

            {errors.general && (
              <div className={styles.generalError}>
                {errors.general}
              </div>
            )}

            <div className={styles.footer}>
              <button
                type="button"
                onClick={onClose}
                className={styles.cancelBtn}
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Enviando...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane"></i>
                    Enviar Mensagem
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
