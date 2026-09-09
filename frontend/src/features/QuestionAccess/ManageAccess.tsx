import { Header } from "./components/Header";
import {
  useRetrieveAccess,
} from "../../services/Access/QuestionAccess";
import { QuestionInvitation } from "./components/Invitation";
import { AccessDetailContainer } from "./components/AccessDetail";

export function ManageAccess({ qid }: { qid: string }) {
 
  const { access } = useRetrieveAccess(qid);



  

  if (!access) {
    return (
      <section className="w-full max-w-3xl rounded-md border border-border bg-surface p-5 text-sm text-text-muted">
        Loading access...
      </section>
    );
  }

  return (
    <section className="w-full max-w-3xl rounded-md border border-border bg-surface p-5 text-text">
      <Header />

      <AccessDetailContainer
        qid={qid}
        variant="embedded"
      />
      <QuestionInvitation qid={qid} />
    </section>
  );
}
