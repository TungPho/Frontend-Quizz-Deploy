import { useState } from "react";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const GenerateQuestionsAI = () => {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [numQuestions, setNumQuestions] = useState(5);

  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState([]);
  const userID = localStorage.getItem("userID");

  const navigate = useNavigate();

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    setIsGenerating(true);
    const reqGenAI = await fetch(
      `http://localhost:3000/api/v1/ai_generate_questions`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          subject: topic,
          numberOfQuestions: numQuestions,
          difficulty,
        }),
      }
    );
    const response = await reqGenAI.json();
    const genQuestions = response.metadata;
    if (genQuestions) {
      setIsGenerating(false);
    }

    // filtered questions
    let filteredQuestions = genQuestions.trim();
    if (filteredQuestions.startsWith("```json")) {
      filteredQuestions = filteredQuestions
        .substring("```json".length)
        .trimStart();
    }
    if (filteredQuestions.endsWith("```")) {
      filteredQuestions = filteredQuestions
        .substring(0, filteredQuestions.length - "```".length)
        .trimEnd();
    }

    console.log(JSON.parse(filteredQuestions));
    const parsedQuestions = JSON.parse(filteredQuestions);
    setQuestions(parsedQuestions);

    // Automatically create exam after questions are generated
    try {
      // add those questions to the test
      const reqCreateExamAI = await fetch(
        `http://localhost:3000/api/v1/generate_questions`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({
            questions: parsedQuestions,
            teacherId: userID,
            title: topic,
          }),
        }
      );
      const res = await reqCreateExamAI.json();
      console.log(res);
      const examID = res.metadata._id;
      if (examID) {
        navigate(`/tests/${examID}`);
      }
    } catch (error) {
      console.error("Error creating exam:", error);
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-400 p-6 relative">
      {/* Back Button */}
      <button
        onClick={() => {
          navigate("/question_type_choosing");
        }}
        className="absolute top-6 left-6 bg-white p-2 rounded-full shadow-md hover:bg-green-50 transition-colors"
      >
        <ArrowLeft size={24} className="text-green-700" />
      </button>

      <div className="max-w-2xl mx-auto mt-16">
        <div className="bg-white rounded-lg shadow-xl p-6">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Sparkles className="text-green-600" size={24} />
            <h1 className="text-2xl font-bold text-green-700">
              Generate Quiz Questions with AI
            </h1>
          </div>

          <div className="space-y-6">
            {/* Topic Input */}
            <div>
              <label
                htmlFor="topic"
                className="block mb-2 font-medium text-gray-700"
              >
                What topic would you like to create questions about?
              </label>
              <input
                id="topic"
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="E.g. World History, Mathematics, Biology..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Difficulty Selection */}
            <div>
              <label
                htmlFor="difficulty"
                className="block mb-2 font-medium text-gray-700"
              >
                Difficulty Level
              </label>
              <select
                id="difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            {/* Number of Questions */}
            <div>
              <label
                htmlFor="numQuestions"
                className="block mb-2 font-medium text-gray-700"
              >
                Number of Questions
              </label>
              <input
                id="numQuestions"
                type="number"
                min="1"
                max="10"
                value={numQuestions}
                onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Generate Button */}
            <div className="pt-4">
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !topic.trim()}
                className={`w-full py-3 rounded-md font-medium flex items-center justify-center gap-2 ${
                  isGenerating || !topic.trim()
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Generating and Creating Exam...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Generate Questions & Create Exam
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateQuestionsAI;
