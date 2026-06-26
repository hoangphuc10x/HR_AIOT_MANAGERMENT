'use client';

interface SelectHeadProps {
  hname: string;
  setShowDialog: (v: boolean) => void;
}

export function SelectHead(props: SelectHeadProps) {
  const { hname, setShowDialog } = props;
  return (
    <div className="relative">
      <input
        type="text"
        placeholder="..."
        className="w-full pr-6 border bg-white rounded px-3 py-2 text-black focus:outline-none cursor-pointer"
        onClick={() => setShowDialog(true)}
        value={hname}
        readOnly
      />
      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-bold">
        &gt;
      </span>
    </div>
  );
}
