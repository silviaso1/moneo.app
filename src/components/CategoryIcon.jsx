import {
  ShoppingCart, Utensils, Car, PartyPopper, HeartPulse, Home, Wallet, Gamepad2, Shirt,
  BookOpen, Plane, Gift, Dog, Dumbbell, Smartphone, Coffee, Briefcase, Fuel, Bus, Pill,
  GraduationCap, Music, Tv, Wifi, Zap, Droplets, Landmark, CreditCard, Target, Tag,
} from 'lucide-react';

export const ICONS = {
  ShoppingCart, Utensils, Car, PartyPopper, HeartPulse, Home, Wallet, Gamepad2, Shirt,
  BookOpen, Plane, Gift, Dog, Dumbbell, Smartphone, Coffee, Briefcase, Fuel, Bus, Pill,
  GraduationCap, Music, Tv, Wifi, Zap, Droplets, Landmark, CreditCard, Target, Tag,
};

export default function CategoryIcon({ name, size = 20, className = '' }) {
  const Icon = ICONS[name] || Tag;
  return <Icon size={size} strokeWidth={1.8} className={className} />;
}