import { Guest } from '@/types/guest';
import CardTemplate1 from './CardTemplate1';
import CardTemplate2 from './CardTemplate2';

interface GuestCardProps {
  guest: Guest;
}

export default function GuestCard({ guest }: GuestCardProps) {
  // 根據樣板 ID 選擇對應的樣板
  const renderCard = () => {
    switch (guest.customization.templateId) {
      case 'template-1':
        return <CardTemplate1 guest={guest} />;
      case 'template-2':
        return <CardTemplate2 guest={guest} />;
      default:
        return <CardTemplate1 guest={guest} />;
    }
  };

  return <div className="animate-fadeInUp">{renderCard()}</div>;
}
