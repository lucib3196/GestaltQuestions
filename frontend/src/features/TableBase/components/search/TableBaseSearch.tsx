import { SearchBar } from "../../../../components/SearchBar";
import { useTableBaseContext } from "../../state/context";

export function TableBaseSearch({ placeholder }: { placeholder?: string }) {
  const searchTitle = useTableBaseContext((s) => s.search);
  const setSearchTitle = useTableBaseContext((s) => s.setSearch);
  return (
    <div className="w-full">
      <SearchBar
        placeholder={placeholder}
        value={searchTitle}
        setValue={setSearchTitle}
        disabled={false}
      />
    </div>
  );
}

export { TableBaseSearch as QuestionSearch };
