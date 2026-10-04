import {
  Bike,
  Cog,
  Wrench,
  Zap,
  Fuel,
  Disc,
  Settings,
  Sparkles,
  ShieldCheck,
  BadgeIndianRupee,
  Clock,
  Phone,
  Mail,
  MapPin,
  Star,
  CheckCircle2,
  ArrowLeft,
  ChevronLeft,
  ToolCase,
  Gauge,
  Flame,
  Battery,
  Wind,
  Snowflake,
  Cpu,
  Lock,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  bike: Bike,
  cog: Cog,
  wrench: Wrench,
  zap: Zap,
  fuel: Fuel,
  disc: Disc,
  settings: Settings,
  sparkles: Sparkles,
  "shield-check": ShieldCheck,
  "badge-indian-rupee": BadgeIndianRupee,
  clock: Clock,
  phone: Phone,
  mail: Mail,
  "map-pin": MapPin,
  star: Star,
  "check-circle": CheckCircle2,
  "arrow-left": ArrowLeft,
  "chevron-left": ChevronLeft,
  "tool-case": ToolCase,
  gauge: Gauge,
  flame: Flame,
  battery: Battery,
  wind: Wind,
  snowflake: Snowflake,
  cpu: Cpu,
  lock: Lock,
};

interface IconProps {
  name?: string | null;
  className?: string;
  strokeWidth?: number;
}

export function DynamicIcon({ name, className, strokeWidth = 2 }: IconProps) {
  if (!name) return <Wrench className={className} strokeWidth={strokeWidth} />;
  const Icon = ICON_MAP[name.toLowerCase()] ?? Wrench;
  return <Icon className={className} strokeWidth={strokeWidth} />;
}
