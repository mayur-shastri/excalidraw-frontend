import { ArrowElement, DrawElement, FreedrawElement, LineElement, ResizeHandle, TextElement } from "../types";

export const renderElement = (ctx: CanvasRenderingContext2D, element: DrawElement, multiSelectionFlag : boolean) => {
  const { style, isSelected } = element;
  
  ctx.strokeStyle = style.strokeColor;
  ctx.fillStyle = style.backgroundColor;
  ctx.lineWidth = style.strokeWidth;
  ctx.globalAlpha = style.opacity;
  
  ctx.save();
  
  if (element.angle !== 0) {
    const centerX = element.x + element.width / 2;
    const centerY = element.y + element.height / 2;
    
    ctx.translate(centerX, centerY);
    ctx.rotate(element.angle);
    ctx.translate(-centerX, -centerY);
  }
  
  switch (element.type) {
    case 'freedraw':
      renderFreedraw(ctx, element as FreedrawElement);
      break;
    case 'rectangle':
      renderRectangle(ctx, element);
      break;
    case 'ellipse':
      renderEllipse(ctx, element);
      break;
    case 'arrow':
      renderArrow(ctx, element as ArrowElement);
      break;
    case 'line':
      renderLine(ctx, element as LineElement);
      break;
    case 'diamond':
      renderDiamond(ctx, element);
      break;
    case 'rhombus':
      renderRhombus(ctx, element);
      break;
    case 'text':
      renderText(ctx, element as TextElement);
      break;
  }
  
  // Draw centered text for all elements except freedraw and line (unless you want it for those too)
  if (
    element.text &&
    element.text.trim() !== '' &&
    element.type !== 'freedraw' &&
    element.type !== 'line'
  ) {
    renderCenteredText(ctx, element);
  }
  
  if (isSelected && !multiSelectionFlag) {
    drawSelectionOutline(ctx, element);
  }
  
  ctx.restore();
};

const renderText = (ctx: CanvasRenderingContext2D, element: TextElement) => {
  // For text elements, center the text in the bounding box
  renderCenteredText(ctx, element);
};

const renderFreedraw = (ctx: CanvasRenderingContext2D, element: FreedrawElement) => {
  const { points } = element;
  
  if (points.length < 2) return;
  
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  
  ctx.stroke();
};

const renderRectangle = (ctx: CanvasRenderingContext2D, element: DrawElement) => {
  const { x, y, width, height, style } = element;
  
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  
  if (style.fillStyle === 'solid') {
    ctx.fill();
  }
  
  ctx.stroke();
};

const renderEllipse = (ctx: CanvasRenderingContext2D, element: DrawElement) => {
  const { x, y, width, height, style } = element;
  
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  const radiusX = width / 2;
  const radiusY = height / 2;
  
  ctx.beginPath();
  ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
  
  if (style.fillStyle === 'solid') {
    ctx.fill();
  }
  
  ctx.stroke();
};

const renderDiamond = (ctx: CanvasRenderingContext2D, element: DrawElement) => {
  const { x, y, width, height, style } = element;
  
  ctx.beginPath();
  ctx.moveTo(x + width / 2, y);
  ctx.lineTo(x + width, y + height / 2);
  ctx.lineTo(x + width / 2, y + height);
  ctx.lineTo(x, y + height / 2);
  ctx.closePath();
  
  if (style.fillStyle === 'solid') {
    ctx.fill();
  }
  
  ctx.stroke();
};

const renderRhombus = (ctx: CanvasRenderingContext2D, element: DrawElement) => {
  const { x, y, width, height, style } = element;
  const skew = width * 0.25;

  ctx.beginPath();
  ctx.moveTo(x + skew, y);
  ctx.lineTo(x + width, y);
  ctx.lineTo(x + width - skew, y + height);
  ctx.lineTo(x, y + height);
  ctx.closePath();

  if (style.fillStyle === 'solid') {
    ctx.fill();
  }

  ctx.stroke();
};

const renderArrow = (ctx: CanvasRenderingContext2D, element: ArrowElement) => {
  const { startPoint, endPoint, style } = element;
  
  ctx.beginPath();
  ctx.moveTo(startPoint.x, startPoint.y);
  ctx.lineTo(endPoint.x, endPoint.y);
  ctx.stroke();
  
  const headLength = 10 + style.strokeWidth;
  const angle = Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x);
  
  ctx.beginPath();
  ctx.moveTo(endPoint.x, endPoint.y);
  ctx.lineTo(
    endPoint.x - headLength * Math.cos(angle - Math.PI / 6),
    endPoint.y - headLength * Math.sin(angle - Math.PI / 6)
  );
  ctx.moveTo(endPoint.x, endPoint.y);
  ctx.lineTo(
    endPoint.x - headLength * Math.cos(angle + Math.PI / 6),
    endPoint.y - headLength * Math.sin(angle + Math.PI / 6)
  );
  ctx.stroke();

  // Draw centered text for arrow if present
  if (element.text && element.text.trim() !== '') {
    renderCenteredText(ctx, element);
  }
};

const renderLine = (ctx: CanvasRenderingContext2D, element: LineElement) => {
  const { startPoint, endPoint } = element;
  
  ctx.beginPath();
  ctx.moveTo(startPoint.x, startPoint.y);
  ctx.lineTo(endPoint.x, endPoint.y);
  ctx.stroke();

  // Draw centered text for line if present
  if (element.text && element.text.trim() !== '') {
    renderCenteredText(ctx, element);
  }
};

const renderCenteredText = (ctx: CanvasRenderingContext2D, element: any) => {
  const { x, y, width, height, style, text } = element;
  if (!text || text.trim() === '') return;

  // Default font settings
  const fontSize = style?.fontSize || 16;
  const fontFamily = style?.fontFamily || 'Arial';
  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = style?.strokeColor || '#000';

  let centerX = x + (width ? width / 2 : 0);
  let centerY = y + (height ? height / 2 : 0);

  // For lines/arrows, center between startPoint and endPoint
  if (element.type === 'line' || element.type === 'arrow') {
    const { startPoint, endPoint } = element;
    centerX = (startPoint.x + endPoint.x) / 2;
    centerY = (startPoint.y + endPoint.y) / 2;
  }

  ctx.fillText(text, centerX, centerY);
};

const drawSelectionOutline = (ctx: CanvasRenderingContext2D, element: DrawElement) => {
  const { x, y, width, height } = element;
  ctx.strokeStyle = '#4285f4';
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 5]);
  ctx.strokeRect(x - 4, y - 4, width + 8, height + 8);
  ctx.setLineDash([]);
  
  const handleSize = 8;
  const handles: { position: ResizeHandle; x: number; y: number }[] = [
    { position: 'top-left', x: x - handleSize / 2, y: y - handleSize / 2 },
    { position: 'top', x: x + width / 2 - handleSize / 2, y: y - handleSize / 2 },
    { position: 'top-right', x: x + width - handleSize / 2, y: y - handleSize / 2 },
    { position: 'left', x: x - handleSize / 2, y: y + height / 2 - handleSize / 2 },
    { position: 'right', x: x + width - handleSize / 2, y: y + height / 2 - handleSize / 2 },
    { position: 'bottom-left', x: x - handleSize / 2, y: y + height - handleSize / 2 },
    { position: 'bottom', x: x + width / 2 - handleSize / 2, y: y + height - handleSize / 2 },
    { position: 'bottom-right', x: x + width - handleSize / 2, y: y + height - handleSize / 2 },
  ];
  
  ctx.fillStyle = 'white';
  ctx.strokeStyle = '#4285f4';
  ctx.lineWidth = 1;
  
  handles.forEach(handle => {
    ctx.beginPath();
    ctx.rect(handle.x, handle.y, handleSize, handleSize);
    ctx.fill();
    ctx.stroke();
  });
  
  // Draw rotation handle
  const rotationHandleY = y - 30;
  ctx.beginPath();
  ctx.moveTo(x + width / 2, y - 10);
  ctx.lineTo(x + width / 2, rotationHandleY);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.arc(x + width / 2, rotationHandleY, 5, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();
};