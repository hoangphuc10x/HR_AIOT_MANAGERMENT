import { CardItemType } from '@/types/common/card.type';

export default function CardItem({ title, amount }: CardItemType) {
  return (
    <div className="flex px-6 py-3 flex-col shadow-md rounded-2xl min-w-[305]">
      <span className="text-xl">{title}</span>
      <span className="text-xl">{amount}</span>
    </div>
  );
}
