import { NODE_HEIGHT, NODE_WIDTH } from "./layout";
import type { PositionedAchievement } from "./layout";
import type { AchievementStatus } from "./types";

interface ImageProps {
  image: string;
  title: string;
  size?: number;
}

/** Пока в данных emoji, но если появится URL — картинка отрендерится как <img>. */
export function AchievementImage({ image, title, size = 56 }: ImageProps) {
  const isPicture = /^(https?:\/\/|data:image\/|\/|\.\/)/.test(image);
  const boxStyle = {
    width: size,
    height: size,
    minWidth: size,
    fontSize: Math.round(size * 0.52),
  };

  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full border border-[#d9c9a8] bg-[#efe4cc] text-center leading-none"
      style={boxStyle}
      role="img"
      aria-label={title}
    >
      {isPicture ? (
        <img
          src={image}
          alt={title}
          className="h-full w-full rounded-full object-cover"
        />
      ) : (
        image
      )}
    </span>
  );
}

interface NodeProps {
  achievement: PositionedAchievement;
  status?: AchievementStatus;
  onSelect: (id: string) => void;
}

const statusClasses: Record<AchievementStatus, string> = {
  neutral:
    "border-[#d9d9d9] bg-[#fcf5e4] hover:border-[#c99635] hover:shadow-md",
  locked:
    "border-[#d9d9d9] bg-[#f4f0e6] opacity-55 saturate-50 hover:opacity-80 hover:shadow-md",
  unlocked: "border-[#c99635] bg-[#fff7e6] hover:shadow-md",
};

/** Предпросмотр в графе: только изображение и заголовок, детали — в модалке. */
export default function AchievementNode({
  achievement,
  status = "neutral",
  onSelect,
}: NodeProps) {
  return (
    <button
      type="button"
      title={achievement.title}
      onClick={() => onSelect(achievement.id)}
      style={{
        left: achievement.x,
        top: achievement.y,
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
      }}
      className={`absolute flex items-center gap-3 rounded border px-4 text-left transition-shadow duration-150 ${statusClasses[status]}`}
    >
      <AchievementImage image={achievement.image} title={achievement.title} />
      <span className="line-clamp-2 min-w-0 font-bold leading-tight text-[#2e2e2e]">
        {achievement.title}
      </span>
    </button>
  );
}
