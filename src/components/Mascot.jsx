import { mascots } from '../store';
import useFollowCursor from '../hooks/useFollowCursor';

export default function Mascot({ state, followCursor }) {
  const ref = useFollowCursor(followCursor);
  return (
    <div 
      ref={ref} 
      style={{ transform: 'translate(-50%, -50%)' }}
      className="absolute top-1/2 left-1/2 w-[100px] h-[100px] flex justify-center items-center pointer-events-none transition-transform duration-75"
    >
      <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: mascots[state] }} />
    </div>
  );
}