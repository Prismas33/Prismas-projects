'use client';

import { useState, useEffect } from "react";
import AdminDashboardLayout from "@/components/admin/AdminDashboardLayout";
import { 
  getProjects, 
  createProject, 
  updateProject, 
  deleteProject,
  uploadProjectImage,
  Project 
} from "@/lib/firebase/firestore";
import { CATEGORIES, CategorySelect } from "@/components/Categories/Categories";
import "@/components/Categories/Categories.css";
import { Plus, Edit, Trash2, Eye, Search, Filter } from "lucide-react";
import { resizeImage, validateImageFile } from "@/lib/utils/imageUtils";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      setLoading(true);
      const projectsData = await getProjects();
      setProjects(projectsData);
    } catch (error) {
      console.error("Erro ao carregar projetos:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  async function handleDeleteProject(id: string) {
    if (confirm("Tem certeza que deseja deletar este projeto?")) {
      try {
        await deleteProject(id);
        setProjects(projects.filter(p => p.id !== id));
      } catch (error) {
        console.error("Erro ao deletar projeto:", error);
      }
    }
  }

  function getStatusBadge(status: string) {
    const styles = {
      "coming-soon": "bg-gray-100 text-gray-800",
      development: "bg-yellow-100 text-yellow-800",
      ready: "bg-blue-100 text-blue-800",
      delivered: "bg-green-100 text-green-800"
    };
    
    const labels = {
      "coming-soon": "Em Breve",
      development: "Em Desenvolvimento",
      ready: "Pronto para Entrega",
      delivered: "Entregue"
    };

    return (
      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  }

  function getCategoryBadge(category: string) {
    const categoryData = CATEGORIES.find(cat => cat.id === category) || CATEGORIES[0];
    
    return (
      <span 
        className="px-2 py-0.5 text-xs font-medium rounded-full"
        style={{
          backgroundColor: categoryData.backgroundColor,
          color: categoryData.color
        }}
      >
        {categoryData.name}
      </span>
    );
  }

  return (
    <AdminDashboardLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Projetos</h1>
            <p className="text-gray-600 mt-2">Gerencie os projetos do portfólio</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Novo Projeto</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar projetos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">Todos os Status</option>
                <option value="coming-soon">Em Breve</option>
                <option value="development">Em Desenvolvimento</option>
                <option value="ready">Pronto para Entrega</option>
                <option value="delivered">Entregue</option>
              </select>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-300 h-32 rounded-t-lg"></div>
                <div className="bg-white p-4 rounded-b-lg border border-gray-200">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-full mb-3"></div>
                  <div className="flex space-x-2">
                    <div className="h-5 bg-gray-300 rounded w-16"></div>
                    <div className="h-5 bg-gray-300 rounded w-20"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProjects.map((project) => (
              <div key={project.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-32 bg-gradient-to-br from-purple-400 to-blue-500 relative">
                  {project.images && project.images.length > 0 ? (
                    <img 
                      src={project.images[0]} 
                      alt={project.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-white text-3xl font-bold">
                      {project.name.charAt(0)}
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-base font-semibold text-gray-900 truncate">
                      {project.name}
                    </h3>
                    <div className="flex space-x-1 ml-2">
                      <button
                        onClick={() => setEditingProject(project)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Edit className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => project.id && handleDeleteProject(project.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-xs mb-3 line-clamp-2">
                    {project.description}
                  </p>
                  
                  <div className="flex items-center space-x-1 mb-3">
                    {getCategoryBadge(project.category)}
                    {getStatusBadge(project.status)}
                  </div>
                  
                  {/* Preço - apenas se não for entregue */}
                  {project.status !== 'delivered' && (
                    <div className="text-sm font-semibold text-purple-600">
                      Sob Orçamento
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredProjects.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">Nenhum projeto encontrado</div>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== "all" 
                ? "Tente ajustar os filtros de busca"
                : "Comece criando seu primeiro projeto"
              }
            </p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal será implementado posteriormente */}
      {showCreateModal && (
        <ProjectModal
          onClose={() => setShowCreateModal(false)}
          onSave={loadProjects}
        />
      )}
      
      {editingProject && (
        <ProjectModal
          project={editingProject}
          onClose={() => setEditingProject(null)}
          onSave={loadProjects}
        />
      )}
    </AdminDashboardLayout>
  );
}

// Modal Component (simplified version)
function ProjectModal({ 
  project, 
  onClose, 
  onSave 
}: { 
  project?: Project; 
  onClose: () => void; 
  onSave: () => void; 
}) {
  const [formData, setFormData] = useState({
    name: project?.name || "",
    description: project?.description || "",
    category: project?.category || "premium",
    status: project?.status || "coming-soon",
    features: project?.features?.join("\n") || "",
    demoUrl: project?.demoUrl || ""
  });
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>((project?.images && project.images.length > 0) ? project.images[0] : "");
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);

  // Função para validar e atualizar a prévia da imagem
  async function handleImageFileChange(file: File | null) {
    if (!file) {
      setImageFile(null);
      setImagePreview((project?.images && project.images.length > 0) ? project.images[0] : "");
      return;
    }

    // Validar arquivo
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      alert(validation.error);
      return;
    }

    try {
      // Redimensionar se necessário
      const processedFile = await resizeImage(file, 1200, 800, 0.85);
      setImageFile(processedFile);
      
      // Criar prévia
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string || "");
      };
      reader.readAsDataURL(processedFile);
      
      // Mostrar informações sobre o processamento
      if (processedFile.size !== file.size) {
        console.log(`Imagem otimizada: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(processedFile.size / 1024 / 1024).toFixed(2)}MB`);
      }
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      alert('Erro ao processar a imagem. Tente novamente.');
    }
  }

  // Funções para drag & drop
  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleImageFileChange(files[0]);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setUploadProgress(0);

    try {
      let imageUrls: string[] = [];
      
      // Se há um novo arquivo para upload
      if (imageFile) {
        setUploadProgress(30);
        const uploadedUrl = await uploadProjectImage(imageFile, formData.name);
        imageUrls = [uploadedUrl];
        setUploadProgress(70);
      } else if (project?.images) {
        // Manter imagens existentes se não há novo upload
        imageUrls = project.images;
      }

      const projectData = {
        ...formData,
        features: formData.features.split("\n").filter(f => f.trim()),
        images: imageUrls
      };

      setUploadProgress(90);

      if (project?.id) {
        await updateProject(project.id, projectData);
      } else {
        await createProject(projectData);
      }

      setUploadProgress(100);
      onSave();
      onClose();
    } catch (error) {
      console.error("Erro ao salvar projeto:", error);
      alert("Erro ao salvar projeto. Tente novamente.");
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">
            {project ? "Editar Projeto" : "Novo Projeto"}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Projeto
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria
              </label>
              <CategorySelect
                value={formData.category}
                onChange={(categoryId) => setFormData({...formData, category: categoryId as any})}
                placeholder="Selecionar categoria"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          {/* Campo de Imagem */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Imagem do Projeto
            </label>
            <div 
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                isDragging 
                  ? 'border-purple-500 bg-purple-50' 
                  : 'border-gray-300 hover:border-purple-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageFileChange(e.target.files?.[0] || null)}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <div className="flex flex-col items-center">
                  <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="text-sm text-gray-600">
                    {imageFile ? `✅ ${imageFile.name}` : isDragging ? "Solte a imagem aqui" : "Clique ou arraste uma imagem"}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    PNG, JPG, WebP ou GIF (máximo 10MB - será otimizada automaticamente)
                  </span>
                </div>
              </label>
            </div>
            
            {/* Botão para remover imagem */}
            {(imageFile || imagePreview) && (
              <button
                type="button"
                onClick={() => handleImageFileChange(null)}
                className="mt-2 text-sm text-red-600 hover:text-red-800"
              >
                �️ Remover imagem
              </button>
            )}
            
            {/* Prévia da Imagem */}
            {!imageFile && imagePreview && (
              <div className="mt-3">
                <div className="text-sm font-medium text-gray-700 mb-2">Imagem atual:</div>
                <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden border">
                  <img
                    src={imagePreview}
                    alt="Imagem do projeto"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
            
            {/* Barra de progresso durante upload */}
            {loading && uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mt-2">
                <div className="text-sm text-gray-600 mb-1">Fazendo upload... {uploadProgress}%</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="coming-soon">Em Breve</option>
                <option value="development">Em Desenvolvimento</option>
                <option value="ready">Pronto para Entrega</option>
                <option value="delivered">Entregue</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL Demo
              </label>
              <input
                type="url"
                value={formData.demoUrl}
                onChange={(e) => setFormData({...formData, demoUrl: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="https://exemplo.com"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Funcionalidades (uma por linha)
            </label>
            <textarea
              value={formData.features}
              onChange={(e) => setFormData({...formData, features: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Funcionalidade 1&#10;Funcionalidade 2&#10;Funcionalidade 3"
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>
                    {uploadProgress > 0 && uploadProgress < 100 
                      ? `Uploading... ${uploadProgress}%` 
                      : "Salvando..."
                    }
                  </span>
                </>
              ) : (
                <span>Salvar</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
