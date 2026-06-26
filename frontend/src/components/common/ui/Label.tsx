interface LabelProps {
  name: string;
  className?: string;
}

export function Label({
  name,
  className = 'text-sm block mb-1 text-white',
}: LabelProps) {
  return <label className={className}>{name}</label>;
}
