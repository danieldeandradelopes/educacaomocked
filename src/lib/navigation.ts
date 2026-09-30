import {
  LayoutDashboard,
  School,
  Search,
  ListOrdered,
  Users,
  GraduationCap,
  BookOpen,
  HeartHandshake,
  Bus,
  UserRound,
  Briefcase,
  Network,
  FolderOpen,
  FileBarChart,
  Settings,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  readonly id: string;
  readonly label: string;
  readonly href?: string;
  readonly icon: LucideIcon;
  readonly comingSoon?: boolean;
  readonly children?: readonly {
    readonly id: string;
    readonly label: string;
    readonly href?: string;
    readonly comingSoon?: boolean;
  }[];
}

export const NAV_ITEMS: readonly NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', href: '/', icon: LayoutDashboard },
  {
    id: 'students',
    label: 'Alunos',
    icon: GraduationCap,
    children: [
      { id: 'students-list', label: 'Alunos', href: '/students' },
      { id: 'enrollments', label: 'Matrículas', href: '/enrollments' },
      { id: 'attendance', label: 'Frequência', href: '/attendance' },
      { id: 'history', label: 'Histórico', href: '/history' },
    ],
  },
  { id: 'active-search', label: 'Busca Ativa', href: '/active-search', icon: Search },
  { id: 'waitlist', label: 'Lista de Espera', href: '/waitlist', icon: ListOrdered },
  { id: 'tutoring', label: 'Reforço Escolar', href: '/tutoring', icon: BookOpen },
  { id: 'inclusive', label: 'Educação Inclusiva', href: '/inclusive', icon: HeartHandshake },
  { id: 'transport', label: 'Transporte', href: '/transport', icon: Bus },
  { id: 'schools', label: 'Escolas', href: '/schools', icon: School },
  { id: 'teachers', label: 'Professores', href: '/teachers', icon: UserRound },
  { id: 'employees', label: 'Funcionários', href: '/employees', icon: Briefcase },
  { id: 'staff', label: 'Quadro de Pessoal', href: '/staff', icon: Users },
  {
    id: 'intersectoral',
    label: 'Acompanhamento Intersetorial',
    href: '/intersectoral',
    icon: Network,
  },
  { id: 'documents', label: 'Documentos', href: '/documents', icon: FolderOpen },
  { id: 'reports', label: 'Relatórios', href: '/reports', icon: FileBarChart },
  { id: 'settings', label: 'Configurações', href: '/settings', icon: Settings },
];
