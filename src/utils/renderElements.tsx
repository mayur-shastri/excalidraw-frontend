import { ArrowElement, DrawElement, FreedrawElement, LineElement, ResizeHandle, TextElement } from "../types";

export const renderElement = (
  ctx: CanvasRenderingContext2D, 
  element: DrawElement, 
  multiSelectionFlag: boolean ) => {
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

  if (isSelected) {
    drawSelectionOutline(ctx, element, multiSelectionFlag);
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
const getProportionalRadius = (width: number, height: number, base: number = 12) => {
  // Use the smaller dimension to scale the radius, clamp to avoid too large radius
  const minDim = Math.min(width, height);
  return Math.max(2, Math.min(base, minDim / 4));
};

const renderRectangle = (ctx: CanvasRenderingContext2D, element: DrawElement) => {
  const { x, y, width, height, style } = element;
  const radius = getProportionalRadius(width, height, style.cornerRadius ?? 12);

  ctx.beginPath();
  // Draw rounded rectangle
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();

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
  const radius = getProportionalRadius(width, height, style.cornerRadius ?? 12);

  // Calculate diamond points
  const top = { x: x + width / 2, y: y };
  const right = { x: x + width, y: y + height / 2 };
  const bottom = { x: x + width / 2, y: y + height };
  const left = { x: x, y: y + height / 2 };

  ctx.beginPath();
  // Move to top, then draw lines with quadratic curves for rounded corners
  ctx.moveTo(top.x - radius, top.y + radius);
  ctx.quadraticCurveTo(top.x, top.y, top.x + radius, top.y + radius);

  ctx.lineTo(right.x - radius, right.y - radius);
  ctx.quadraticCurveTo(right.x, right.y, right.x - radius, right.y + radius);

  ctx.lineTo(bottom.x + radius, bottom.y - radius);
  ctx.quadraticCurveTo(bottom.x, bottom.y, bottom.x - radius, bottom.y - radius);

  ctx.lineTo(left.x + radius, left.y + radius);
  ctx.quadraticCurveTo(left.x, left.y, left.x + radius, left.y - radius);

  ctx.closePath();

  if (style.fillStyle === 'solid') {
    ctx.fill();
  }

  ctx.stroke();
};

const renderRhombus = (ctx: CanvasRenderingContext2D, element: DrawElement) => {
  const { x, y, width, height, style } = element;
  const skew = width * 0.25;
  const radius = getProportionalRadius(width, height, style.cornerRadius ?? 12);

  // Rhombus points
  const topLeft = { x: x + skew, y: y };
  const topRight = { x: x + width, y: y };
  const bottomRight = { x: x + width - skew, y: y + height };
  const bottomLeft = { x: x, y: y + height };

  ctx.beginPath();
  ctx.moveTo(topLeft.x + radius, topLeft.y);
  ctx.lineTo(topRight.x - radius, topRight.y);
  ctx.quadraticCurveTo(topRight.x, topRight.y, topRight.x, topRight.y + radius);

  ctx.lineTo(bottomRight.x + radius, bottomRight.y - radius);
  ctx.quadraticCurveTo(bottomRight.x, bottomRight.y, bottomRight.x - radius, bottomRight.y);

  ctx.lineTo(bottomLeft.x + radius, bottomLeft.y);
  ctx.quadraticCurveTo(bottomLeft.x, bottomLeft.y, bottomLeft.x, bottomLeft.y - radius);

  ctx.lineTo(topLeft.x - radius, topLeft.y + radius);
  ctx.quadraticCurveTo(topLeft.x, topLeft.y, topLeft.x + radius, topLeft.y);

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

const drawSelectionOutline = (
  ctx: CanvasRenderingContext2D, 
  element: DrawElement, 
  multiSelectionFlag: boolean,) => {
  const { x, y, width, height } = element;
  const outlinePadding = 7;
  const outlineRadius = 12;

  // Draw continuous rounded rectangle outline outside the element
  ctx.save();
  ctx.strokeStyle = '#4285f4';
  ctx.lineWidth = 2;
  ctx.setLineDash([]); // continuous

  ctx.beginPath();
  ctx.moveTo(x - outlinePadding + outlineRadius, y - outlinePadding);
  ctx.lineTo(x + width + outlinePadding - outlineRadius, y - outlinePadding);
  ctx.quadraticCurveTo(x + width + outlinePadding, y - outlinePadding, x + width + outlinePadding, y - outlinePadding + outlineRadius);
  ctx.lineTo(x + width + outlinePadding, y + height + outlinePadding - outlineRadius);
  ctx.quadraticCurveTo(x + width + outlinePadding, y + height + outlinePadding, x + width + outlinePadding - outlineRadius, y + height + outlinePadding);
  ctx.lineTo(x - outlinePadding + outlineRadius, y + height + outlinePadding);
  ctx.quadraticCurveTo(x - outlinePadding, y + height + outlinePadding, x - outlinePadding, y + height + outlinePadding - outlineRadius);
  ctx.lineTo(x - outlinePadding, y - outlinePadding + outlineRadius);
  ctx.quadraticCurveTo(x - outlinePadding, y - outlinePadding, x - outlinePadding + outlineRadius, y - outlinePadding);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();

  // Draw resize handles (still at corners/edges, but outside the element)
  const handleSize = 8;
  const handleOffset = outlinePadding;
  const handles: { position: ResizeHandle; x: number; y: number }[] = [
    { position: 'top-left', x: x - handleOffset - handleSize / 2, y: y - handleOffset - handleSize / 2 },
    { position: 'top', x: x + width / 2 - handleSize / 2, y: y - handleOffset - handleSize / 2 },
    { position: 'top-right', x: x + width + handleOffset - handleSize / 2, y: y - handleOffset - handleSize / 2 },
    { position: 'left', x: x - handleOffset - handleSize / 2, y: y + height / 2 - handleSize / 2 },
    { position: 'right', x: x + width + handleOffset - handleSize / 2, y: y + height / 2 - handleSize / 2 },
    { position: 'bottom-left', x: x - handleOffset - handleSize / 2, y: y + height + handleOffset - handleSize / 2 },
    { position: 'bottom', x: x + width / 2 - handleSize / 2, y: y + height + handleOffset - handleSize / 2 },
    { position: 'bottom-right', x: x + width + handleOffset - handleSize / 2, y: y + height + handleOffset - handleSize / 2 },
  ];

  ctx.save();
  ctx.fillStyle = 'white';
  ctx.strokeStyle = '#4285f4';
  ctx.lineWidth = 0.5;

  handles.forEach(handle => {
    ctx.beginPath();
    ctx.rect(handle.x, handle.y, handleSize, handleSize);
    ctx.fill();
    ctx.stroke();
  });
  ctx.restore();

  // Draw rotation handle as a small circle above the top center
  if (!multiSelectionFlag) {
    const rotationHandleY = y - outlinePadding - 20;
    const rotationHandleX = x + width / 2;
    const rotationHandleRadius = 5;

    ctx.save();
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#4285f4';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(rotationHandleX, rotationHandleY, rotationHandleRadius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
};