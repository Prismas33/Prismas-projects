// Componente de Categorias - Sistema centralizado
export interface Category {
  id: string;
  name: string;
  color: string;
  backgroundColor: string;
  borderColor: string;
  gradientColors: [string, string];
  icon: string;
}

// Lista completa de categorias disponíveis
export const CATEGORIES: Category[] = [
  {
    id: 'premium',
    name: 'Premium',
    color: '#000000',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderColor: 'rgba(0, 0, 0, 0.3)',
    gradientColors: ['#000000', '#333333'],
    icon: 'fas fa-gem'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    color: '#40e0d0',
    backgroundColor: 'rgba(64, 224, 208, 0.2)',
    borderColor: 'rgba(64, 224, 208, 0.3)',
    gradientColors: ['#40e0d0', '#48cae4'],
    icon: 'fas fa-building'
  },
  {
    id: 'creative',
    name: 'Creative',
    color: '#8a2be2',
    backgroundColor: 'rgba(138, 43, 226, 0.2)',
    borderColor: 'rgba(138, 43, 226, 0.3)',
    gradientColors: ['#8a2be2', '#9370db'],
    icon: 'fas fa-palette'
  },
  {
    id: 'fintech',
    name: 'FinTech',
    color: '#ffd700',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderColor: 'rgba(255, 215, 0, 0.3)',
    gradientColors: ['#ffd700', '#ff6b35'],
    icon: 'fas fa-university'
  },
  {
    id: 'ecommerce',
    name: 'E-commerce',
    color: '#ffd700',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderColor: 'rgba(255, 215, 0, 0.3)',
    gradientColors: ['#ffd700', '#ffed4e'],
    icon: 'fas fa-shopping-cart'
  },
  {
    id: 'saas',
    name: 'SaaS',
    color: '#40e0d0',
    backgroundColor: 'rgba(64, 224, 208, 0.2)',
    borderColor: 'rgba(64, 224, 208, 0.3)',
    gradientColors: ['#40e0d0', '#48cae4'],
    icon: 'fas fa-cloud'
  }
];

// Função para obter categoria por ID
export const getCategoryById = (id: string): Category => {
  return CATEGORIES.find(cat => cat.id === id) || CATEGORIES[0];
};

// Função para obter classe de cor
export const getCategoryColorClass = (categoryId: string): string => {
  const category = getCategoryById(categoryId);
  return category.id;
};

// Componente Badge da Categoria
interface CategoryBadgeProps {
  categoryId: string;
  className?: string;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ categoryId, className = '' }) => {
  const category = getCategoryById(categoryId);
  
  return (
    <div 
      className={`category-badge ${category.id} ${className}`}
      style={{
        backgroundColor: category.backgroundColor,
        color: category.color,
        borderColor: category.borderColor
      }}
    >
      {category.name}
    </div>
  );
};

// Componente Badge do Cartão (para o topo)
interface CardBadgeProps {
  categoryId: string;
  className?: string;
}

export const CardBadge: React.FC<CardBadgeProps> = ({ categoryId, className = '' }) => {
  const category = getCategoryById(categoryId);
  
  return (
    <div 
      className={`${category.id}-badge ${className}`}
      style={{
        background: `linear-gradient(135deg, ${category.gradientColors[0]}, ${category.gradientColors[1]})`,
        color: category.id === 'enterprise' || category.id === 'ecommerce' || category.id === 'fintech' || category.id === 'saas' ? '#000' : 'white'
      }}
    >
      <i className={category.icon}></i>
      <span>{category.name}</span>
    </div>
  );
};

// Dropdown de Categorias para Forms
interface CategorySelectProps {
  value?: string;
  onChange: (categoryId: string) => void;
  placeholder?: string;
}

export const CategorySelect: React.FC<CategorySelectProps> = ({ 
  value, 
  onChange, 
  placeholder = 'Selecionar categoria' 
}) => {
  return (
    <select 
      value={value || ''} 
      onChange={(e) => onChange(e.target.value)}
      className="category-select"
    >
      <option value="">{placeholder}</option>
      {CATEGORIES.map(category => (
        <option key={category.id} value={category.id}>
          {category.name}
        </option>
      ))}
    </select>
  );
};
