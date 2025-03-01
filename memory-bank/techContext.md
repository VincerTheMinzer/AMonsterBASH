# Technical Context: AMonsterBASH

## Technology Stack

### Frontend Framework
- **React 18.3.1** - Core UI library
- **TypeScript 5.5.3** - Type-safe JavaScript
- **Vite 5.4.2** - Build tool and development server

### UI and Styling
- **Tailwind CSS 3.4.1** - Utility-first CSS framework
- **HTML Canvas** - For game rendering
- **Lucide React 0.344.0** - Icon library

### State Management
- **React Hooks** - For component state and side effects
- Custom game loop implementation

### Development Tools
- **ESLint 9.9.1** - Code linting
- **PostCSS 8.4.35** - CSS processing
- **Autoprefixer 10.4.18** - CSS vendor prefixing

### Dependencies
- **uuid 11.1.0** - For generating unique IDs

## Development Environment

### Build and Run
- **Development**: `npm run dev` - Starts Vite development server
- **Build**: `npm run build` - Creates production build
- **Preview**: `npm run preview` - Previews production build
- **Lint**: `npm run lint` - Runs ESLint

### Project Structure
```
/
├── public/              # Static assets
├── src/                 # Source code
│   ├── components/      # React components
│   ├── data/            # Game data (commands)
│   ├── hooks/           # Custom React hooks
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   ├── App.tsx          # Main application component
│   ├── index.css        # Global styles
│   └── main.tsx         # Application entry point
├── index.html           # HTML entry point
├── package.json         # Project dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite configuration
└── tailwind.config.js   # Tailwind CSS configuration
```

## Key Technical Implementations

### Game Rendering
The game uses HTML Canvas for rendering through the GameCanvas component. The canvas is updated on each frame of the game loop to display:
- Player character
- Enemies with their associated commands
- Health bars
- Game status information
- Terminal input and feedback

### Game Loop
The game loop is implemented using `requestAnimationFrame` in the useGameLoop hook:
1. Calculates delta time between frames
2. Updates game state based on elapsed time
3. Spawns new enemies at defined intervals
4. Updates enemy positions
5. Checks for collisions and game over conditions
6. Renders the updated state

### Command Processing
Commands are processed through the following flow:
1. User types in the Terminal component
2. Input is compared against enemy commands
3. On match, the enemy is defeated
4. For boss enemies, a sequence of commands must be matched in order
5. Command suggestions are generated based on partial input

### Game State Management
The game state is managed through a custom hook (useGameLoop) that maintains:
- Player state (health, position)
- Enemy collection
- Game status (started, paused, game over)
- Score and timer
- Current command tier
- Terminal input and feedback

## Technical Constraints

### Browser Compatibility
- Designed for modern browsers with Canvas support
- Requires JavaScript enabled
- Best experienced on desktop browsers with keyboard input

### Performance Considerations
- Canvas rendering is optimized for smooth animation
- Game loop uses delta time to ensure consistent speed across devices
- Enemy count is managed to prevent performance issues

### Accessibility
- Game relies heavily on keyboard input
- Visual feedback is provided for commands
- Color contrast is maintained for readability

## Deployment

The application can be deployed as a static site to any web hosting service:
1. Run `npm run build` to generate production files
2. Deploy the contents of the `dist` directory to a web server
3. No backend services required as the game runs entirely in the browser

## Future Technical Considerations

1. **Mobile Support** - Add touch controls for mobile devices
2. **Offline Support** - Implement service workers for offline play
3. **Persistent Storage** - Add local storage for saving high scores
4. **Sound Effects** - Add audio feedback for game events
5. **Multiplayer** - Consider WebSocket integration for multiplayer modes
