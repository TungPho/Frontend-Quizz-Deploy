import { ArrowRight, Edit, Sparkles, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const QuestionTypeChoosing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-green-400 flex items-center justify-center p-4 relative">
      {/* Back Button - positioned at the left edge of screen */}
      <button
        onClick={() => {
          navigate("/home/library");
        }}
        className="absolute top-6 left-6 bg-white p-2 rounded-full shadow-md hover:bg-green-50 transition-colors"
      >
        <ArrowLeft size={24} className="text-green-700" />
      </button>

      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
        <h1 className="text-3xl font-bold text-green-700 text-center mb-8">
          How would you like to create your quiz question?
        </h1>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Manual Creation Option */}
          <div className="bg-green-50 rounded-lg p-6 hover:shadow-md transition-all cursor-pointer border-2 border-green-200 hover:border-green-500">
            <div className="flex justify-center mb-4">
              <div className="bg-green-200 p-3 rounded-full">
                <Edit size={32} className="text-green-700" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-green-800 text-center mb-3">
              Create from Scratch
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Manually create your question, answers, and set the correct
              response.
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => {
                  navigate("/create-question");
                }}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition-colors"
              >
                Get Started
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* AI Generation Option */}
          <div className="bg-green-50 rounded-lg p-6 hover:shadow-md transition-all cursor-pointer border-2 border-green-200 hover:border-green-500">
            <div className="flex justify-center mb-4">
              <div className="bg-green-200 p-3 rounded-full">
                <Sparkles size={32} className="text-green-700" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-green-800 text-center mb-3">
              Generate with AI
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Let AI create questions based on your topic or learning
              objectives.
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => {
                  navigate("/generate-question");
                }}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition-colors"
              >
                Generate Questions
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-green-600">
          <p>Choose an option to continue creating your quiz</p>
        </div>
      </div>
    </div>
  );
};

export default QuestionTypeChoosing;
