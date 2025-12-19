
import { SplitMode } from '../types';

export const parseTextToSlides = (text: string, mode: SplitMode): string[] => {
  if (!text.trim()) return [];

  let parts: string[] = [];

  switch (mode) {
    case SplitMode.EMPTY_LINE:
      parts = text.split(/\n\s*\n/);
      break;
    case SplitMode.DASHES:
      parts = text.split(/\n?---\n?/);
      break;
    case SplitMode.SLIDE_N:
      // Split by "Slide N:" or "Слайд N:"
      parts = text.split(/(?:Слайд|Slide)\s+\d+:?\s*/i).filter(p => p.trim() !== '');
      break;
    default:
      parts = [text];
  }

  return parts
    .map(p => p.trim())
    .filter(p => p.length > 0);
};
