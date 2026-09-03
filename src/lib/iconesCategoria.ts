// Ícones disponíveis pras categorias do menu (AppCategoria.icone guarda o nome
// lucide em kebab-case). Lista fixa e curta de propósito: importar o pacote
// inteiro (ou lucide-react/dynamic) explodiria o bundle em centenas de chunks.
// Mesmo mapa vive em EXTOAPP-PAINEL-ADM/src/lib/iconesCategoria.ts — sincronia manual,
// igual ao resto do design system. Nome desconhecido cai em LayoutGrid.
import {
  Briefcase, Building2, Calendar, ClipboardList, Cog, Database, FileText, Folder, Gavel,
  GraduationCap, Handshake, HardHat, Headset, HeartPulse, Landmark, LayoutGrid, Leaf, Mail,
  MapPin, Megaphone, Monitor, Package, Receipt, Scale, ShieldCheck, ShoppingCart, Star, Truck,
  Users, Wallet, Wrench,
} from 'lucide-react'
import type { ElementType } from 'react'

export const ICONES_CATEGORIA: Record<string, ElementType> = {
  'layout-grid': LayoutGrid, users: Users, briefcase: Briefcase, 'hard-hat': HardHat,
  wallet: Wallet, monitor: Monitor, scale: Scale, megaphone: Megaphone,
  'shopping-cart': ShoppingCart, truck: Truck, 'building-2': Building2, 'file-text': FileText,
  folder: Folder, package: Package, wrench: Wrench, 'shield-check': ShieldCheck,
  landmark: Landmark, mail: Mail, calendar: Calendar, 'heart-pulse': HeartPulse,
  'graduation-cap': GraduationCap, handshake: Handshake, 'map-pin': MapPin, cog: Cog,
  database: Database, 'clipboard-list': ClipboardList, headset: Headset, star: Star,
  receipt: Receipt, gavel: Gavel, leaf: Leaf,
}

export const iconeCategoria = (nome: string | undefined): ElementType =>
  (nome && ICONES_CATEGORIA[nome]) || LayoutGrid
