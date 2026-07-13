import { Button } from "../../../components/Button"
import { useQuestionInstance } from "../instance"
export default function QuestionActions() {

    const resetAnswers = useQuestionInstance((s) => s.resetAnswers)
    const setRefreshKey = useQuestionInstance((s) => s.setRefreshKey)
    const setShowSolution = useQuestionInstance((s) => s.setShowSolution)
    const showSolution = useQuestionInstance((s) => s.showSolution)
    const submitAnswers = useQuestionInstance((s) => s.submitAnswers)
    const resetSubmission = useQuestionInstance((s) => s.resetSubmissions)
    const hasSubmitted = useQuestionInstance((s) => s.hasSubmitted)

    const handleGenerateVariant = () => {
        resetSubmission()
        resetAnswers()
        setRefreshKey()

    }
    const handleSubmit = () => {
        submitAnswers()
    }
    return <div className="flex flex-wrap gap-2">
        <Button type="button" name="Submit" color="submitQuestion" onClick={handleSubmit} disabled={hasSubmitted} />
        <Button
            type="button"
            onClick={handleGenerateVariant}
            name="Generate Variant"
            color="generateVariant"
        />
        <Button
            type="button"
            onClick={() => setShowSolution()}
            name={showSolution ? "Show Solution" : "Hide Solution"}
            color="showSolution"
        />
    </div>
}