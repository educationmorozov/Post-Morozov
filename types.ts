
export enum SplitMode {
  EMPTY_LINE = 'EMPTY_LINE',
  DASHES = 'DASHES',
  SLIDE_N = 'SLIDE_N'
}

export enum AspectRatio {
  PORTRAIT = '4:5', // 1080x1350
  SQUARE = '1:1'   // 1080x1080
}

export enum NickPosition {
  BOTTOM_LEFT = 'BOTTOM_LEFT',
  BOTTOM_RIGHT = 'BOTTOM_RIGHT',
  BOTTOM_CENTER = 'BOTTOM_CENTER',
  TOP_RIGHT = 'TOP_RIGHT'
}

export type TemplateId = 'white' | 'black' | 'bordeaux' | 'forest' | 'navy' | 'deep_blue' | 'ultramarine' | 'orange';

export interface FontPair {
  id: string;
  name: string;
  headerFont: string;
  bodyFont: string;
  baseHeaderSize: number;
  baseBodySize: number;
}

export interface SlideData {
  id: number;
  text: string;
  isValid: boolean;
  error?: string;
  previewUrl?: string;
  blob?: Blob;
}

export interface AppSettings {
  splitMode: SplitMode;
  aspectRatio: AspectRatio;
  nick: string;
  nickPosition: NickPosition;
  templateId: TemplateId;
  fontPairId: string | null;
  avatarUrl?: string | null;
  blogDescription?: string;
}

export interface RenderResult {
  blob: Blob;
  dataUrl: string;
  isValid: boolean;
  error?: string;
}