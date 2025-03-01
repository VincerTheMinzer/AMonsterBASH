# Product Context: AMonsterBASH

## Problem Statement
Many users find learning command-line interfaces intimidating and struggle to remember bash commands. Traditional learning methods like documentation reading or tutorials can be dry and don't provide enough interactive practice. Users need an engaging way to build command-line proficiency that makes learning fun and reinforces knowledge through active recall.

## Target Users
1. **Beginners** - New to command line interfaces, need to learn basic commands
2. **Intermediate Users** - Familiar with basics but want to expand their command knowledge
3. **Advanced Users** - Looking to practice and maintain proficiency with more complex commands
4. **Educators** - Teaching command line skills to students

## User Experience Goals
1. **Engaging** - Make learning bash commands fun and addictive
2. **Progressive** - Gradually introduce more complex commands as skills improve
3. **Reinforcing** - Build muscle memory through repetitive typing of commands
4. **Rewarding** - Provide immediate feedback and satisfaction when correctly using commands
5. **Educational** - Teach the purpose and context of each command

## Game Mechanics

### Core Loop
1. Enemies appear on the right side of the screen and move toward the player
2. Each enemy displays a bash command that must be typed correctly to defeat it
3. Player types commands in the terminal input at the bottom of the screen
4. Correct commands eliminate enemies and increase score
5. Enemies that reach the player cause damage
6. Game continues until player health reaches zero

### Progression System
- Game starts with beginner-level commands (cd, ls, pwd, etc.)
- After 1 minute, intermediate commands are introduced (mkdir, rm, cp, etc.)
- After 2 minutes, advanced commands are introduced (chmod, find, sed, etc.)
- After 3 minutes, pro-level commands are introduced (piped commands, awk, etc.)
- Score increases based on command difficulty

### Special Features
- **Boss Enemies** - Require a sequence of multiple commands to defeat
- **Turret System** - Can be activated with "turrets on" command to automatically defeat basic enemies
- **Command Suggestions** - Show possible commands that match partial input

## Value Proposition
AMonsterBASH transforms the typically dry experience of learning bash commands into an engaging game that builds practical skills through active recall and repetition. By gamifying command-line learning, users can:

1. Learn commands more quickly and retain them better
2. Practice in a low-pressure environment with immediate feedback
3. Build confidence with terminal operations
4. Track progress through score and survival time
5. Have fun while developing valuable technical skills
