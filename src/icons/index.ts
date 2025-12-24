import {
  FileText,
  Upload,
  Search,
  FileDown,
  Sun,
  Moon,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  Check,
  X,
  AlertTriangle,
  AlertCircle,
  Info,
  Lightbulb,
  Loader2,
  ClipboardList,
  ListChecks,
  BarChart3,
  FileEdit,
  Trash2,
  RefreshCw,
  Settings,
  Home,
  Eye,
  EyeOff,
  Copy,
  Download,
  Printer,
  ExternalLink,
  Bot,
  Brain,
  Sparkles,
  CheckCircle,
  XCircle,
  MinusCircle,
  PenLine,
  BookOpen,
  GraduationCap,
  type LucideIcon,
} from 'lucide-react'

// Icon registry for Frontboot
export const icons: Record<string, LucideIcon> = {
  // Navigation & Layout
  FileText,
  Upload,
  Search,
  FileDown,
  Home,
  Settings,

  // Theme
  Sun,
  Moon,

  // Actions
  RotateCcw,
  RefreshCw,
  Check,
  X,
  Trash2,
  Copy,
  Download,
  Printer,
  ExternalLink,

  // Chevrons
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ChevronUp,

  // Status & Alerts
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
  MinusCircle,

  // Analysis & Content
  Lightbulb,
  Loader2,
  ClipboardList,
  ListChecks,
  BarChart3,
  FileEdit,
  PenLine,
  Eye,
  EyeOff,

  // AI
  Bot,
  Brain,
  Sparkles,

  // Academic
  BookOpen,
  GraduationCap,
}

export type IconName = keyof typeof icons
