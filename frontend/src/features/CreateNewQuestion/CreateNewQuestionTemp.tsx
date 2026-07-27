
import { ModeCardContainer } from "./components/ModeCard";
import { useQuestionCreate } from "./instance";
import { Blank } from "./views/Blank";
import TemplateView from "./views/TemplateView";

function Header() {
    return (
        <header className="flex flex-col gap-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-accent">
                Question setup
            </p>
            <h1 className="text-3xl font-bold text-text">Create a new question</h1>
            <p className="max-w-2xl text-sm text-text-muted">
                Start by choosing how the question should be created, then define the
                metadata and files that will shape the question package.
            </p>
        </header>
    );
}

export default function CreateQuestion() {
    const mode = useQuestionCreate((s) => s.mode);

    return (
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 md:p-6">
            <Header />

            <section className="rounded-2xl border border-border bg-surface p-4 shadow-sm md:p-5">
                <ModeCardContainer />
            </section>

            <section className="">
                {mode === "blank" && <Blank />}
                {mode === "template" && <TemplateView />}

            </section>
        </div>
    );
}
