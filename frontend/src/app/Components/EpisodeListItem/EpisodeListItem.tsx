"use client";

import { useRouter } from 'next/navigation';
import { useModal } from '@/app/Components/Modal/ModalContext'

interface ELIProps {
  name: string;
  type: string;
  series: string;
  season: number;
  episode: number;
  isActive?: boolean;
  onClick?: () => void; //optional override
}

const EpisodeListItem: React.FC<ELIProps> = ({ name, type, series, season, episode, isActive = false, onClick }) => {
  const router = useRouter();
  const { closeModal } = useModal();

  const handleClick = () => {
    sessionStorage.setItem("manualSeason", String(season));
    sessionStorage.setItem("manualEpisode", String(episode));
    router.push(`/Dashboard/${encodeURIComponent(type)}/${encodeURIComponent(series)}/Watch`);
    closeModal();
  };


  return (
    <div 
      className={`flex items-center p-4 border rounded-lg cursor-pointer 
        ${isActive 
          ? "border-[var(--site-highlighted-color)]" 
          : "border-[var(--site-outline-color)] hover:border-[var(--site-hover-color)]"
        }`
      }
      onClick={onClick ?? handleClick}
    >
      {/* Image Section */}
      <div className="w-16 h-16 flex-shrink-0">
        <img 
          src="/Icons/pokeball.svg" 
          alt="Episode Image" 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Info Section */}
      <div className="ml-4">
        <p className="text-lg font-semibold">{name}</p>
        <p className="text-sm text-gray-500">Click to watch</p>
      </div>
    </div>
  );
};

export default EpisodeListItem;
