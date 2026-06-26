interface BtnActionProps {
  name: string;
  action: () => void;
}

export function BtnAction(props: BtnActionProps) {
  const { name, action } = props;
  return (
    <button
      onClick={() => action()}
      className="px-3 py-0.5 text-sm rounded bg-red-500 text-white hover:bg-red-400"
    >
      {name}
    </button>
  );
}
