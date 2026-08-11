import { useQuestionTableContext } from "../../instance/context";
import { SearchBar } from "../../../../components/SearchBar";

export function QuestionSearch() {
  const searchTitle = useQuestionTableContext((s) => s.search);
  const setSearchTitle = useQuestionTableContext((s) => s.setSearch);
  return (
    <div className="w-full">
      <SearchBar
        value={searchTitle}
        setValue={setSearchTitle}
        disabled={false}
      />
    </div>
  );
}
