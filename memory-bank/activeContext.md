# Active Context: AMonsterBASH

## Current Focus
The project is currently in active development with a functional game loop and core mechanics implemented. The focus is on refining the gameplay experience, improving visual feedback, and enhancing the educational aspects of the game.

## Recent Changes
- Implemented the core game loop with enemy spawning and movement
- Created the command processing system for defeating enemies
- Added tiered progression system for command difficulty
- Implemented boss enemies requiring command sequences
- Added turret system as a special gameplay mechanic
- Implemented pause, resume, and restart functionality
- Added command suggestions for learning assistance
- Added command description display at the bottom of the console
- Improved enemy spawning to prevent enemies from appearing too high on screen
- Enhanced command text readability with larger font size and background
- Added visual juice features:
  - Particle explosion effects when enemies are defeated
  - Animated text highlighting for commands being typed
  - Text scaling animation for targeted enemies
  - Color highlighting for matched portions of commands
- Added filename-based features:
  - Random filenames displayed under enemies
  - Commands can target enemies using filenames (e.g., "cd filename.txt")
  - Tab completion for commands and filenames
  - Double-tap tab to add filename to command

## Active Decisions

### Game Balance
- Enemy spawn rates are set to provide a challenging but manageable experience
- Command progression timing (1 minute per tier) balances learning curve and challenge
- Boss enemies appear every 30 seconds to test more advanced skills
- Turret cooldown (5 seconds) provides strategic assistance without making the game too easy

### Visual Design
- Using a dark theme with high contrast colors for terminal-like aesthetics
- Command text is displayed above enemies for clear targeting
- Health bars provide visual feedback on player and boss status
- Game canvas handles both game rendering and terminal display for unified experience

### Educational Approach
- Commands are grouped into tiers of increasing difficulty
- Command descriptions are provided to explain their purpose
- Command suggestions help users learn new commands
- Error messages provide feedback on incorrect command usage

## Next Steps

### High Priority
1. **Score Persistence** - Implement local storage for high scores
2. **Sound Effects** - Add audio feedback for game events
3. **Command Tutorials** - Add brief explanations of each command's real-world usage
4. **Difficulty Settings** - Allow users to adjust spawn rates and progression timing

### Medium Priority
1. **Visual Polish** - Enhance graphics for player, enemies, and effects
2. **Mobile Support** - Add touch controls and responsive design
3. **Command Categories** - Group commands by function (file operations, text processing, etc.)
4. **Achievement System** - Add badges for mastering command categories

### Low Priority
1. **Multiplayer Mode** - Allow users to compete for high scores
2. **Custom Command Sets** - Let users focus on specific command groups
3. **Advanced Game Modes** - Add timed challenges or survival modes
4. **Command Chaining** - Add more complex command combinations

## Current Challenges

1. **Input Focus** - Ensuring the terminal input maintains focus during gameplay
2. **Performance Optimization** - Maintaining smooth animation with many enemies
3. **Command Validation** - Balancing exact matching with user-friendly input handling
4. **Learning Curve** - Making the game accessible to beginners while challenging for experts
5. **Visual Clarity** - Ensuring commands and game elements are clearly visible

## User Feedback Priorities

1. **Game Difficulty** - Is the progression challenging but fair?
2. **Educational Value** - Are users learning and retaining command knowledge?
3. **Engagement** - Is the game fun and addictive enough to encourage practice?
4. **Visual Clarity** - Is the interface intuitive and information clearly presented?
5. **Command Selection** - Are the included commands relevant and useful?
