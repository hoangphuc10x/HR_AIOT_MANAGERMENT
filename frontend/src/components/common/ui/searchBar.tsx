import { useTranslation } from 'react-i18next';

interface SearchProps {
  onSearch: (value: string) => void;
  note: number;
}

export default function Search({ onSearch, note }: SearchProps) {
  const { t } = useTranslation();
  return (
    <div className="flex-1">
      <input
        type="text"
        onChange={(e) => onSearch(e.target.value)}
        placeholder={
          note == 1
            ? t('department.searchByNameOrEmail')
            : t('department.searchByDepartmentName')
        }
        className="border b border-gray-300 rounded-lg px-3 py-2 w-[30%]"
      />
    </div>
  );
}
