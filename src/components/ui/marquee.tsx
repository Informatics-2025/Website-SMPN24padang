import { Badge } from "@/components/ui/badge";

export interface MarqueeItem {
  type: 'Berita' | 'Prestasi' | 'Pengumuman';
  text: string;
}

interface MarqueeProps {
  items: MarqueeItem[];
}

export function Marquee({ items }: MarqueeProps) {
  const marqueeContent = items.map((item, index) => (
    <span
      key={index}
      className="mx-4 inline-flex items-center text-sm text-foreground md:mx-8 md:text-lg"
    >
      <Badge 
        variant={item.type === 'Prestasi' ? 'default' : 'secondary'} 
        className={item.type === 'Prestasi' ? 'bg-primary text-primary-foreground' : ''}
      >
        {item.type}
      </Badge>
      <span className="ml-2 max-w-[72vw] truncate md:max-w-none">
        {item.text}
      </span>
    </span>
  ));

  return (
    <div className="relative flex w-full overflow-x-hidden border-y border-accent/20 bg-accent/10 py-2.5 md:py-4">
      <div className="animate-marquee whitespace-nowrap flex items-center">
        {marqueeContent}
      </div>
      <div className="absolute top-0 animate-marquee2 whitespace-nowrap flex items-center py-2.5 md:py-4">
        {marqueeContent}
      </div>
    </div>
  );
}
