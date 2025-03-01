import React from 'react';

const GameInstructions: React.FC = () => {
  return (
    <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg max-w-md">
      <h2 className="text-xl font-bold mb-3">How to Play</h2>
      
      <div className="space-y-3 text-sm">
        <p>
          <span className="font-bold text-green-400">Bash Quest</span> is a typing game where you defend against enemies by typing bash commands.
        </p>
        
        <ul className="list-disc pl-5 space-y-1">
          <li>Type the command shown above each enemy to defeat it</li>
          <li>Bosses require multiple commands in sequence</li>
          <li>Commands get progressively harder as you advance through tiers</li>
          <li>If enemies reach you, you'll take damage</li>
          <li>Type <span className="font-mono bg-gray-700 px-1 rounded">turrets on</span> to enable auto-defense (if unlocked)</li>
          <li>Type <span className="font-mono bg-gray-700 px-1 rounded">turrets off</span> to disable auto-defense</li>
        </ul>
        
        <p className="font-bold text-yellow-300">Survive as long as possible and aim for a high score!</p>
      </div>
    </div>
  );
};

export default GameInstructions;
