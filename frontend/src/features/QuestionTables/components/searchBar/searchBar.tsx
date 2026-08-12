import { SearchBar } from "../../../../components/SearchBar";
import { useQuestionTableContext } from "../../instance/context";

export function QuestionSearch({ placeholder }: { placeholder?: string }) {
  const searchTitle = useQuestionTableContext((s) => s.search);
  const setSearchTitle = useQuestionTableContext((s) => s.setSearch);
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
