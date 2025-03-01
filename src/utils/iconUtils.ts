// Icon drawing utilities for the game

// Draw a move icon (for cd command)
export const drawMoveIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, color: string) => {
  // Draw a directional arrow
  ctx.fillStyle = color;
  
  // Arrow body
  ctx.fillRect(x + width * 0.3, y + height * 0.4, width * 0.4, height * 0.2);
  
  // Arrow head
  ctx.beginPath();
  ctx.moveTo(x + width * 0.7, y + height * 0.2);
  ctx.lineTo(x + width * 0.9, y + height * 0.5);
  ctx.lineTo(x + width * 0.7, y + height * 0.8);
  ctx.fill();
};

// Draw a list icon (for ls command)
export const drawListIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, color: string) => {
  // Draw a list with bullet points
  ctx.fillStyle = color;
  
  // Draw bullet points
  const bulletRadius = width * 0.06;
  const lineHeight = height * 0.2;
  
  for (let i = 0; i < 3; i++) {
    const bulletY = y + height * 0.3 + i * lineHeight;
    
    // Bullet
    ctx.beginPath();
    ctx.arc(x + width * 0.2, bulletY, bulletRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Line
    ctx.fillRect(x + width * 0.3, bulletY - bulletRadius / 2, width * 0.5, bulletRadius);
  }
};

// Draw a print icon (for pwd, echo, cat commands)
export const drawPrintIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, color: string) => {
  // Draw a document with text lines
  ctx.fillStyle = color;
  
  // Document outline
  ctx.fillRect(x + width * 0.2, y + height * 0.2, width * 0.6, height * 0.6);
  
  // Text lines (white)
  ctx.fillStyle = '#1e1e2e'; // Background color for contrast
  const lineHeight = height * 0.1;
  const lineWidth = width * 0.4;
  
  for (let i = 0; i < 3; i++) {
    ctx.fillRect(x + width * 0.3, y + height * 0.3 + i * lineHeight * 1.5, lineWidth, lineHeight);
  }
};

// Draw a create icon (for mkdir, touch commands)
export const drawCreateIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, color: string) => {
  // Draw a plus symbol
  ctx.fillStyle = color;
  
  // Horizontal line
  ctx.fillRect(x + width * 0.2, y + height * 0.45, width * 0.6, height * 0.1);
  
  // Vertical line
  ctx.fillRect(x + width * 0.45, y + height * 0.2, width * 0.1, height * 0.6);
};

// Draw a delete icon (for rm command)
export const drawDeleteIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, color: string) => {
  // Draw a trash can
  ctx.fillStyle = color;
  
  // Trash can body
  ctx.fillRect(x + width * 0.25, y + height * 0.3, width * 0.5, height * 0.5);
  
  // Trash can lid
  ctx.fillRect(x + width * 0.2, y + height * 0.25, width * 0.6, height * 0.05);
  
  // Handle
  ctx.fillRect(x + width * 0.4, y + height * 0.2, width * 0.2, height * 0.05);
  
  // Lines on the trash can
  ctx.fillStyle = '#1e1e2e'; // Background color for contrast
  
  for (let i = 0; i < 3; i++) {
    const lineX = x + width * (0.35 + i * 0.15);
    ctx.fillRect(lineX, y + height * 0.35, width * 0.03, height * 0.4);
  }
};

// Draw a copy icon (for cp command)
export const drawCopyIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, color: string) => {
  // Draw two overlapping documents
  ctx.fillStyle = color;
  
  // Back document
  ctx.fillRect(x + width * 0.3, y + height * 0.2, width * 0.5, height * 0.5);
  
  // Front document
  ctx.fillRect(x + width * 0.2, y + height * 0.3, width * 0.5, height * 0.5);
  
  // Lines on front document
  ctx.fillStyle = '#1e1e2e'; // Background color for contrast
  const lineHeight = height * 0.08;
  
  for (let i = 0; i < 2; i++) {
    ctx.fillRect(x + width * 0.3, y + height * (0.4 + i * 0.15), width * 0.3, lineHeight);
  }
};

// Draw a rename/move icon (for mv command)
export const drawRenameIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, color: string) => {
  // Draw a document with an arrow
  ctx.fillStyle = color;
  
  // Document
  ctx.fillRect(x + width * 0.2, y + height * 0.3, width * 0.3, height * 0.4);
  
  // Arrow
  ctx.beginPath();
  ctx.moveTo(x + width * 0.55, y + height * 0.5);
  ctx.lineTo(x + width * 0.75, y + height * 0.5);
  ctx.lineTo(x + width * 0.7, y + height * 0.4);
  ctx.lineTo(x + width * 0.75, y + height * 0.5);
  ctx.lineTo(x + width * 0.7, y + height * 0.6);
  ctx.fill();
};

// Draw a search icon (for grep, find commands)
export const drawSearchIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, color: string) => {
  // Draw a magnifying glass
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = width * 0.06;
  
  // Glass circle
  ctx.beginPath();
  ctx.arc(x + width * 0.4, y + height * 0.4, width * 0.2, 0, Math.PI * 2);
  ctx.stroke();
  
  // Handle
  ctx.beginPath();
  ctx.moveTo(x + width * 0.55, y + height * 0.55);
  ctx.lineTo(x + width * 0.75, y + height * 0.75);
  ctx.stroke();
};

// Draw a permission icon (for chmod, chown commands)
export const drawPermissionIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, color: string) => {
  // Draw a lock
  ctx.fillStyle = color;
  
  // Lock body
  ctx.fillRect(x + width * 0.3, y + height * 0.45, width * 0.4, height * 0.35);
  
  // Lock arc
  ctx.beginPath();
  ctx.arc(x + width * 0.5, y + height * 0.45, width * 0.2, Math.PI, Math.PI * 2);
  ctx.fill();
  
  // Keyhole
  ctx.fillStyle = '#1e1e2e'; // Background color for contrast
  ctx.beginPath();
  ctx.arc(x + width * 0.5, y + height * 0.55, width * 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(x + width * 0.48, y + height * 0.55, width * 0.04, height * 0.1);
};

// Draw a view icon (for tail, head commands)
export const drawViewIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, color: string) => {
  // Draw an eye
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = width * 0.05;
  
  // Eye outline
  ctx.beginPath();
  ctx.ellipse(x + width * 0.5, y + height * 0.5, width * 0.3, height * 0.2, 0, 0, Math.PI * 2);
  ctx.stroke();
  
  // Pupil
  ctx.beginPath();
  ctx.arc(x + width * 0.5, y + height * 0.5, width * 0.1, 0, Math.PI * 2);
  ctx.fill();
};

// Draw a transform icon (for sed, awk commands)
export const drawTransformIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, color: string) => {
  // Draw a gear
  ctx.fillStyle = color;
  
  // Gear body
  ctx.beginPath();
  ctx.arc(x + width * 0.5, y + height * 0.5, width * 0.25, 0, Math.PI * 2);
  ctx.fill();
  
  // Gear teeth
  const teethCount = 8;
  const innerRadius = width * 0.25;
  const outerRadius = width * 0.35;
  
  ctx.beginPath();
  for (let i = 0; i < teethCount; i++) {
    const angle = (i / teethCount) * Math.PI * 2;
    const nextAngle = ((i + 0.5) / teethCount) * Math.PI * 2;
    
    ctx.lineTo(
      x + width * 0.5 + Math.cos(angle) * innerRadius,
      y + height * 0.5 + Math.sin(angle) * innerRadius
    );
    
    ctx.lineTo(
      x + width * 0.5 + Math.cos(nextAngle - 0.2) * outerRadius,
      y + height * 0.5 + Math.sin(nextAngle - 0.2) * outerRadius
    );
    
    ctx.lineTo(
      x + width * 0.5 + Math.cos(nextAngle + 0.2) * outerRadius,
      y + height * 0.5 + Math.sin(nextAngle + 0.2) * outerRadius
    );
  }
  ctx.fill();
  
  // Center hole
  ctx.fillStyle = '#1e1e2e'; // Background color for contrast
  ctx.beginPath();
  ctx.arc(x + width * 0.5, y + height * 0.5, width * 0.1, 0, Math.PI * 2);
  ctx.fill();
};

// Draw an archive icon (for tar command)
export const drawArchiveIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, color: string) => {
  // Draw a box with a zipper
  ctx.fillStyle = color;
  
  // Box
  ctx.fillRect(x + width * 0.2, y + height * 0.2, width * 0.6, height * 0.6);
  
  // Zipper
  ctx.fillStyle = '#1e1e2e'; // Background color for contrast
  
  for (let i = 0; i < 5; i++) {
    const yPos = y + height * (0.3 + i * 0.1);
    ctx.fillRect(x + width * 0.4, yPos, width * 0.2, height * 0.05);
  }
};

// Draw a pipe icon (for piped commands)
export const drawPipeIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, color: string) => {
  // Draw a pipe symbol
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = width * 0.08;
  
  // Horizontal line
  ctx.beginPath();
  ctx.moveTo(x + width * 0.2, y + height * 0.5);
  ctx.lineTo(x + width * 0.8, y + height * 0.5);
  ctx.stroke();
  
  // Vertical line
  ctx.fillRect(x + width * 0.45, y + height * 0.3, width * 0.1, height * 0.4);
};

// Draw an advanced icon (for complex commands)
export const drawAdvancedIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, color: string) => {
  // Draw a code symbol
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = width * 0.05;
  
  // Left bracket
  ctx.beginPath();
  ctx.moveTo(x + width * 0.3, y + height * 0.2);
  ctx.lineTo(x + width * 0.2, y + height * 0.5);
  ctx.lineTo(x + width * 0.3, y + height * 0.8);
  ctx.stroke();
  
  // Right bracket
  ctx.beginPath();
  ctx.moveTo(x + width * 0.7, y + height * 0.2);
  ctx.lineTo(x + width * 0.8, y + height * 0.5);
  ctx.lineTo(x + width * 0.7, y + height * 0.8);
  ctx.stroke();
  
  // Slash
  ctx.beginPath();
  ctx.moveTo(x + width * 0.6, y + height * 0.2);
  ctx.lineTo(x + width * 0.4, y + height * 0.8);
  ctx.stroke();
};

// Draw the appropriate icon based on the command type
export const drawCommandIcon = (
  ctx: CanvasRenderingContext2D, 
  x: number, 
  y: number, 
  width: number, 
  height: number, 
  iconType: string,
  color: string
) => {
  switch (iconType) {
    case 'move':
      drawMoveIcon(ctx, x, y, width, height, color);
      break;
    case 'list':
      drawListIcon(ctx, x, y, width, height, color);
      break;
    case 'print':
      drawPrintIcon(ctx, x, y, width, height, color);
      break;
    case 'create':
      drawCreateIcon(ctx, x, y, width, height, color);
      break;
    case 'delete':
      drawDeleteIcon(ctx, x, y, width, height, color);
      break;
    case 'copy':
      drawCopyIcon(ctx, x, y, width, height, color);
      break;
    case 'rename':
      drawRenameIcon(ctx, x, y, width, height, color);
      break;
    case 'search':
      drawSearchIcon(ctx, x, y, width, height, color);
      break;
    case 'permission':
      drawPermissionIcon(ctx, x, y, width, height, color);
      break;
    case 'view':
      drawViewIcon(ctx, x, y, width, height, color);
      break;
    case 'transform':
      drawTransformIcon(ctx, x, y, width, height, color);
      break;
    case 'archive':
      drawArchiveIcon(ctx, x, y, width, height, color);
      break;
    case 'pipe':
      drawPipeIcon(ctx, x, y, width, height, color);
      break;
    case 'advanced':
    default:
      drawAdvancedIcon(ctx, x, y, width, height, color);
      break;
  }
};
