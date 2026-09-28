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
    readonly comingSoon?: boolean;
  }[];
}

export const NAV_ITEMS: readonly NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    id: 'students',
    label: 'Alunos',
    icon: GraduationCap,
    comingSoon: true,
    children: [
      { id: 'students-list', label: 'Alunos', comingSoon: true },
      { id: 'enrollments', label: 'Matrículas', comingSoon: true },
      { id: 'attendance', label: 'Frequência', comingSoon: true },
      { id: 'history', label: 'Histórico', comingSoon: true },
    ],
  },
  {
    id: 'active-search',
    label: 'Busca Ativa',
    href: '/active-search',
    icon: Search,
  },
  {
    id: 'waitlist',
    label: 'Lista de Espera',
    href: '/waitlist',
    icon: ListOrdered,
  },
  {
    id: 'tutoring',
    label: 'Reforço Escolar',
    icon: BookOpen,
    comingSoon: true,
  },
  {
    id: 'inclusive',
    label: 'Educação Inclusiva',
    icon: HeartHandshake,
    comingSoon: true,
  },
  {
    id: 'transport',
    label: 'Transporte',
    icon: Bus,
    comingSoon: true,
  },
  {
    id: 'schools',
    label: 'Escolas',
    href: '/schools',
    icon: School,
  },
  {
    id: 'teachers',
    label: 'Professores',
    icon: UserRound,
    comingSoon: true,
  },
  {
    id: 'employees',
    label: 'Funcionários',
    icon: Briefcase,
    comingSoon: true,
  },
  {
    id: 'staff',
    label: 'Quadro de Pessoal',
    href: '/staff',
    icon: Users,
  },
  {
    id: 'intersectoral',
    label: 'Acompanhamento Intersetorial',
    icon: Network,
    comingSoon: true,
  },
  {
    id: 'documents',
    label: 'Documentos',
    icon: FolderOpen,
    comingSoon: true,
  },
  {
    id: 'reports',
    label: 'Relatórios',
    icon: FileBarChart,
    comingSoon: true,
  },
  {
    id: 'settings',
    label: 'Configurações',
    icon: Settings,
    comingSoon: true,
  },
];
