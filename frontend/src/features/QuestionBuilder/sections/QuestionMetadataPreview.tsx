import { Container } from "../../../components/Container";
import { useQuestionMetadata } from "../hooks";

type Props = {
    qid: string | null;
};

type RowProps = {
    label: string;
    value: React.ReactNode;
};

function MetadataRow({ label, value }: RowProps) {
    return (
        <div className="grid grid-cols-[140px_1fr] gap-3 py-2 border-b border-border last:border-b-0">
            <div className="text-text-muted text-sm">{label}</div>
            <div className="text-text text-sm">{value}</div>
        </div>
    );
}

export default function QuestionMetaDataPreview({ qid }: Props) {
    const { questionMetadata, loading } = useQuestionMetadata(qid);

    if (!qid) {
        return (
            <Container header="Question Metadata">
                <div className="text-sm text-text-muted">Select a question to view metadata.</div>
            </Container>
        );
    }

    if (loading) {
        return (
            <Container header="Question Metadata">
                <div className="text-sm text-text-muted">Loading metadata...</div>
            </Container>
        );
    }

    if (!questionMetadata) {
        return (
            <Container header="Question Metadata">
                <div className="text-sm text-text-muted">No metadata available.</div>
            </Container>
        );
    }

    const topics = Array.isArray(questionMetadata.topics) ? questionMetadata.topics : [];
    const qTypes = Array.isArray(questionMetadata.qTypes) ? questionMetadata.qTypes : [];

    return (
        <Container header="Question Metadata">
            <div className="rounded-md border border-border bg-surface p-3">
                <MetadataRow label="Title" value={questionMetadata.title ?? "Untitled"} />
                <MetadataRow label="Status" value={questionMetadata.status} />
                <MetadataRow label="AI Generated" value={questionMetadata.ai_generated ? "Yes" : "No"} />
                <MetadataRow label="Adaptive" value={questionMetadata.isAdaptive ? "Yes" : "No"} />
                <MetadataRow
                    label="Topics"
                    value={topics.length ? topics.join(", ") : "—"}
                />
                <MetadataRow label="Question Types" value={qTypes.length ? qTypes.join(", ") : "—"} />
            </div>
        </Container>
    );
}
