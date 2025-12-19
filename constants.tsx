
import { TemplateId, FontPair } from './types';

export interface TemplateConfig {
  id: TemplateId;
  name: string;
  bgColor: string;
  textColor: string;
  accentColor?: string;
  previewClass: string;
}

export const TEMPLATES: TemplateConfig[] = [
  {
    id: 'white',
    name: 'Белый',
    bgColor: '#FFFFFF',
    textColor: '#1A1A1A',
    previewClass: 'bg-white border'
  },
  {
    id: 'black',
    name: 'Черный',
    bgColor: '#121212',
    textColor: '#FFFFFF',
    accentColor: '#FFFFFF',
    previewClass: 'bg-zinc-900 text-white'
  },
  {
    id: 'bordeaux',
    name: 'Бордо',
    bgColor: '#660810',
    textColor: '#f1ebeb',
    previewClass: 'bg-[#660810]'
  },
  {
    id: 'forest',
    name: 'Хвоя',
    bgColor: '#465940',
    textColor: '#fdfbf0',
    previewClass: 'bg-[#465940]'
  },
  {
    id: 'navy',
    name: 'Закат',
    bgColor: '#f7f4f3',
    textColor: '#5b2333',
    previewClass: 'bg-[#f7f4f3]'
  },
  {
    id: 'deep_blue',
    name: 'Глубокий синий',
    bgColor: '#102e4a',
    textColor: '#fff7e6',
    previewClass: 'bg-[#102e4a]'
  },
  {
    id: 'ultramarine',
    name: 'Ультрамарин',
    bgColor: '#001166',
    textColor: '#f0f0e7',
    previewClass: 'bg-[#001166]'
  },
  {
    id: 'orange',
    name: 'Винтаж',
    bgColor: '#f1ebdf',
    textColor: '#a30100',
    previewClass: 'bg-[#f1ebdf]'
  }
];

export const FONT_PAIRS: FontPair[] = [
  { 
    id: 'pair-modern', 
    name: 'Современный', 
    headerFont: 'Inter', 
    bodyFont: 'Inter', 
    baseHeaderSize: 84, 
    baseBodySize: 48 
  },
  { 
    id: 'pair-impact', 
    name: 'Акцентный', 
    headerFont: 'Rubik', 
    bodyFont: 'Inter', 
    baseHeaderSize: 80, 
    baseBodySize: 44 
  },
  { 
    id: 'pair-classic', 
    name: 'Классический', 
    headerFont: 'Manrope', 
    bodyFont: 'Inter', 
    baseHeaderSize: 86, 
    baseBodySize: 48 
  },
  { 
    id: 'pair-elegant', 
    name: 'Элегантный', 
    headerFont: 'Montserrat', 
    bodyFont: 'Golos Text', 
    baseHeaderSize: 82, 
    baseBodySize: 44 
  },
  { 
    id: 'pair-clean', 
    name: 'Чистый', 
    headerFont: 'Raleway', 
    bodyFont: 'Raleway', 
    baseHeaderSize: 82, 
    baseBodySize: 44 
  },
  { 
    id: 'pair-tech', 
    name: 'Строгий', 
    headerFont: 'Oswald', 
    bodyFont: 'Roboto', 
    baseHeaderSize: 100, 
    baseBodySize: 42 
  }
];

export const MAX_SLIDES = 20;