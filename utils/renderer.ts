
import { AspectRatio, NickPosition, TemplateId, RenderResult, FontPair } from '../types';
import { TEMPLATES } from '../constants';

interface RenderOptions {
  text: string;
  templateId: TemplateId;
  fontPair: FontPair;
  aspectRatio: AspectRatio;
  nick: string;
  nickPosition: NickPosition;
  slideNumber: number;
  totalSlides: number;
  avatarUrl?: string | null;
  blogDescription?: string;
}

const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
};

export const renderSlideToCanvas = async (options: RenderOptions): Promise<RenderResult> => {
  const { text, templateId, fontPair, aspectRatio, nick, nickPosition, slideNumber, totalSlides, avatarUrl, blogDescription } = options;
  const template = TEMPLATES.find(t => t.id === templateId)!;

  const width = 1080;
  const height = aspectRatio === AspectRatio.PORTRAIT ? 1350 : 1080;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { alpha: false });

  if (!ctx) {
    return { blob: new Blob(), dataUrl: '', isValid: false, error: 'Ошибка холста' };
  }

  try {
    await document.fonts.ready;
  } catch (e) {
    console.warn('Font loading check failed, proceeding anyway');
  }

  // Draw Background
  ctx.fillStyle = template.bgColor;
  ctx.fillRect(0, 0, width, height);

  // Check if this is the special CTA last slide
  const isLastSlide = slideNumber === totalSlides;
  const showCTA = isLastSlide && avatarUrl;

  const wrapText = (txt: string, font: string, maxWidth: number) => {
    ctx.font = font;
    const words = txt.split(' ');
    const wrapped: string[] = [];
    let currentLine = '';

    words.forEach((word, idx) => {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      if (ctx.measureText(testLine).width > maxWidth && idx > 0) {
        wrapped.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });
    wrapped.push(currentLine);
    return wrapped;
  };

  if (showCTA) {
    try {
      const avatar = await loadImage(avatarUrl!);
      const centerX = width / 2;
      const centerY = height / 2 - 200; // Move up to make space for description
      const radius = 150;

      // Draw circular avatar with aspect-ratio correction (Center Crop)
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      // Calculate source crop to avoid stretching
      const imgWidth = avatar.width;
      const imgHeight = avatar.height;
      const minDimension = Math.min(imgWidth, imgHeight);
      const sx = (imgWidth - minDimension) / 2;
      const sy = (imgHeight - minDimension) / 2;

      ctx.drawImage(
        avatar,
        sx, sy, minDimension, minDimension, // Source rectangle
        centerX - radius, centerY - radius, radius * 2, radius * 2 // Destination rectangle
      );
      ctx.restore();

      // Border for avatar
      ctx.strokeStyle = template.textColor;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Text and CTA
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = template.textColor;

      // Handle/Username
      const handle = nick.startsWith('@') ? nick : `@${nick || 'username'}`;
      ctx.font = `700 64px "${fontPair.headerFont}"`;
      ctx.fillText(handle, centerX, centerY + radius + 80);

      let lastY = centerY + radius + 80;

      // Blog Description
      if (blogDescription) {
        const descFont = `400 42px "${fontPair.bodyFont}"`;
        const wrappedDesc = wrapText(blogDescription, descFont, width - 200);
        ctx.font = descFont;
        ctx.globalAlpha = 0.8;
        wrappedDesc.forEach((line, i) => {
          ctx.fillText(line, centerX, lastY + 100 + i * 55);
        });
        ctx.globalAlpha = 1.0;
        lastY += 100 + (wrappedDesc.length - 1) * 55;
      }

      // Subscribe Button
      const btnWidth = 500;
      const btnHeight = 110;
      const btnX = centerX - btnWidth / 2;
      const btnY = lastY + 140;

      // Button background
      ctx.fillStyle = template.textColor;
      // Rounded rect for button
      const r = 20;
      ctx.beginPath();
      ctx.moveTo(btnX + r, btnY);
      ctx.lineTo(btnX + btnWidth - r, btnY);
      ctx.quadraticCurveTo(btnX + btnWidth, btnY, btnX + btnWidth, btnY + r);
      ctx.lineTo(btnX + btnWidth, btnY + btnHeight - r);
      ctx.quadraticCurveTo(btnX + btnWidth, btnY + btnHeight, btnX + btnWidth - r, btnY + btnHeight);
      ctx.lineTo(btnX + r, btnY + btnHeight);
      ctx.quadraticCurveTo(btnX, btnY + btnHeight, btnX, btnY + btnHeight - r);
      ctx.lineTo(btnX, btnY + r);
      ctx.quadraticCurveTo(btnX, btnY, btnX + r, btnY);
      ctx.closePath();
      ctx.fill();

      // Button text
      ctx.fillStyle = template.bgColor;
      ctx.font = `700 42px "${fontPair.bodyFont}"`;
      ctx.fillText('ПОДПИСАТЬСЯ', centerX, btnY + btnHeight / 2);

    } catch (e) {
      console.error('Failed to load avatar', e);
    }
  } else {
    // Normal content rendering
    const paddingX = 100;
    const paddingY = 100;
    let drawAreaWidth = width - paddingX * 2;
    let drawAreaHeight = height - paddingY * 2;

    const rawLines = text.split('\n').filter(l => l.trim().length > 0);
    const firstLine = rawLines[0] || '';
    const remainingLines = rawLines.slice(1);
    
    const isHeaderForced = slideNumber >= 2;
    const isHeaderHeuristic = slideNumber === 1 && firstLine.length < 80;
    const useHeader = isHeaderForced || isHeaderHeuristic;

    interface LayoutItem {
      text: string;
      font: string;
      size: number;
      isHeader: boolean;
      isNewLine: boolean;
    }

    let finalLayout: LayoutItem[] = [];
    let totalContentHeight = 0;
    let fits = false;

    const reductionSteps = [1.0, 0.95, 0.9, 0.85, 0.8];

    for (const factor of reductionSteps) {
      totalContentHeight = 0;
      finalLayout = [];

      const hSize = fontPair.baseHeaderSize * factor;
      const bSize = fontPair.baseBodySize * factor;
      const lHeight = 1.25;

      if (useHeader) {
        const hFont = `700 ${hSize}px "${fontPair.headerFont}"`;
        const wrappedH = wrapText(firstLine, hFont, drawAreaWidth);
        wrappedH.forEach(l => finalLayout.push({ text: l, font: hFont, size: hSize, isHeader: true, isNewLine: true }));
        totalContentHeight += wrappedH.length * hSize * lHeight;
        totalContentHeight += 40; 
      }

      const bFont = `400 ${bSize}px "${fontPair.bodyFont}"`;
      const bodySourceLines = useHeader ? remainingLines : rawLines;
      
      bodySourceLines.forEach((part, pIdx) => {
        const wrappedB = wrapText(part, bFont, drawAreaWidth);
        wrappedB.forEach((l, lIdx) => {
          finalLayout.push({ 
            text: l, 
            font: bFont, 
            size: bSize, 
            isHeader: false, 
            isNewLine: lIdx === 0
          });
        });
        totalContentHeight += wrappedB.length * bSize * lHeight;
        if (pIdx < bodySourceLines.length - 1) totalContentHeight += bSize * 0.5;
      });

      if (totalContentHeight < drawAreaHeight - 140) {
        fits = true;
        break;
      }
    }

    if (!fits) {
      return { blob: new Blob(), dataUrl: '', isValid: false, error: `Слайд №${slideNumber} не помещается. Сократите текст.` };
    }

    ctx.fillStyle = template.textColor;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    let currentY = paddingY + (drawAreaHeight - totalContentHeight) / 2;
    
    finalLayout.forEach((item, idx) => {
      ctx.font = item.font;
      ctx.fillText(item.text, paddingX, currentY);
      currentY += item.size * 1.25;
      if (item.isHeader && !finalLayout[idx+1]?.isHeader) {
        currentY += 40;
      }
    });
  }

  // Footer Elements
  const slideNumText = `${slideNumber}/${totalSlides}`;
  const footerFont = `600 32px "${fontPair.bodyFont}"`;
  ctx.font = footerFont;
  
  ctx.save();
  ctx.globalAlpha = 0.6;
  ctx.fillStyle = template.textColor;
  const numWidth = ctx.measureText(slideNumText).width;
  ctx.fillText(slideNumText, width - 100 - numWidth, height - 100);
  ctx.restore();

  if (nick && !showCTA) {
    const handle = nick.startsWith('@') ? nick : `@${nick}`;
    ctx.font = `700 30px "${fontPair.bodyFont}"`;
    ctx.fillStyle = template.textColor;
    
    const nickW = ctx.measureText(handle).width;
    let nx = 100;
    let ny = height - 100;
    if (nickPosition === NickPosition.BOTTOM_RIGHT) {
      nx = width - 100 - nickW;
    } else if (nickPosition === NickPosition.TOP_RIGHT) {
      nx = width - 100 - nickW;
      ny = 100 - 40;
    }
    ctx.fillText(handle, nx, ny);
  }

  const dataUrl = canvas.toDataURL('image/png');
  const blob = await new Promise<Blob>(resolve => canvas.toBlob(b => resolve(b!), 'image/png'));

  return { blob, dataUrl, isValid: true };
};
