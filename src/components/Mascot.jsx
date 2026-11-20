
import { getPack } from '../store';

export default function Mascot({
  mood = 'normal',
  pack = 'skunk',
  color,
  custom = {},
  className = '',
  style
}) {
 
  if (pack === 'custom') {
    const src = custom[mood] || custom.normal;

    if (src) {
      return (
        <img
          src={src}
          alt="Mascote personalizado"
          draggable={false}
          className={`w-full h-full object-contain ${className}`}
          style={style}
        />
      );
    }
  }

  const set = getPack(pack === 'custom' ? 'skunk' : pack, color);
  const content = set?.[mood] || set?.normal;

  if (!content) return null;

  const isImage = typeof content === 'string' &&
    (
      content.startsWith('/') ||
      content.startsWith('http://') ||
      content.startsWith('https://') ||
      content.startsWith('data:image/')
    );

  if (isImage) {
    return (
      <img
        src={content}
        alt="Mascote"
        draggable={false}
        className={`w-full h-full object-contain ${className}`}
        style={style}
      />
    );
  }


  return (
    <div
      className={`w-full h-full ${className}`}
      style={style}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
