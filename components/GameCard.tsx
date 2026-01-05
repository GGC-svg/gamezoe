import React from 'react';
import { Play, Lock, Sparkles } from 'lucide-react';
import { Game } from '../types';

interface GameCardProps {
  game: Game;
  onClick: (game: Game) => void;
}

const GameCard: React.FC<GameCardProps> = ({ game, onClick }) => {
  return (
    <div
      className="group relative bg-slate-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-nexus-accent/20 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer ring-1 ring-slate-700/50 hover:ring-nexus-accent/50"
      onClick={() => onClick(game)}
    >
      {/* Thumbnail */}
      <div className="aspect-[3/4] w-full relative overflow-hidden">
        <img
          src={game.thumbnailUrl}
          alt={game.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-nexus-900 via-transparent to-transparent opacity-80" />

        {/* Price Tag */}
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 rounded-md text-xs font-bold shadow-sm ${game.isFree
            ? 'bg-green-500/90 text-white'
            : game.price >= 990000
              ? 'bg-blue-600/90 text-white' // Rental Color
              : 'bg-nexus-accent/90 text-white'
            }`}>
            {game.isFree ? 'FREE' : game.price >= 990000 ? '計時' : (
              <div className="flex items-center gap-0.5">
                <span>{game.price}</span>
                <span className="text-yellow-300">G</span>
              </div>
            )}
          </span>
        </div>

        {/* Play Icon Overlay on Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-[2px]">
          <div className="bg-white/20 p-3 rounded-full backdrop-blur-md border border-white/30">
            {game.isFree ? <Play className="fill-white text-white h-8 w-8 ml-1" /> : <Lock className="text-white h-8 w-8" />}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 relative">
        <h3 className="text-lg font-bold text-white leading-tight mb-1 group-hover:text-nexus-accent transition-colors">
          {game.title}
        </h3>
        <p className="text-xs text-slate-400 mb-2">{game.category}</p>
        <p className="text-sm text-slate-300 line-clamp-2">
          {game.description}
        </p>
      </div>
    </div>
  );
};

export default GameCard;
