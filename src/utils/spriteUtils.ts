// Sprite sheet constants
export const SPRITE_SHEET_COLS = 3;
export const SPRITE_SHEET_ROWS = 3;
export const TOTAL_SPRITES = SPRITE_SHEET_COLS * SPRITE_SHEET_ROWS;

// Sprite animation interface
export interface SpriteAnimation {
  spriteIndex: number;
  frameWidth: number;
  frameHeight: number;
  lastInputTime: number;
}

// Initialize sprite animation
export const initializeSpriteAnimation = (): SpriteAnimation => ({
  spriteIndex: 0,
  frameWidth: 0,  // Will be calculated when image loads
  frameHeight: 0, // Will be calculated when image loads
  lastInputTime: 0
});

// Update sprite index on input
export const updateSpriteOnInput = (animation: SpriteAnimation): SpriteAnimation => {
  return {
    ...animation,
    spriteIndex: (animation.spriteIndex + 1) % TOTAL_SPRITES,
    lastInputTime: Date.now()
  };
};

// Calculate sprite frame coordinates
export const getSpriteCoordinates = (spriteIndex: number, frameWidth: number, frameHeight: number) => {
  const col = spriteIndex % SPRITE_SHEET_COLS;
  const row = Math.floor(spriteIndex / SPRITE_SHEET_COLS);
  
  return {
    sourceX: col * frameWidth,
    sourceY: row * frameHeight
  };
};
