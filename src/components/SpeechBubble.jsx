import { speechBubbles } from '../store';

export default function SpeechBubble({ state }) {
  return (
    <div className="bg-black text-white px-5 py-4 rounded-[20px] rounded-bl-sm text-[15px] font-medium leading-relaxed text-center shadow-lg">
      {speechBubbles[state]}
    </div>
  );
}