import { useEffect, useRef } from 'react';

export default function useFollowCursor(enabled) {
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (!enabled || !ref.current) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 15;
      const y = (e.clientY / window.innerHeight - 0.5) * 15;
      // Mantém o translate(-50%, -50%) E adiciona o movimento do mouse
      ref.current.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
    };
    document.addEventListener('mousemove', handler);
    
    // Se desativar o followCursor, volta ao centro exato
    if (!enabled && ref.current) {
      ref.current.style.transform = 'translate(-50%, -50%)';
    }

    return () => document.removeEventListener('mousemove', handler);
  }, [enabled]);

  return ref;
}