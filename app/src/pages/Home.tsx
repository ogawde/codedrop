import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";

export function Home() {
  const [prompt, setPrompt] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {

      navigate("/builder", { state: { prompt } });

    }
  };

  return (
    <BackgroundBeamsWithCollision className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900">
      <div className="relative z-10 flex items-center justify-center p-4 min-h-screen">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Wand2 className="w-12 h-12 text-indigo-400" />
            </div>
            <h1 className="text-4xl font-bold text-gray-100 mb-4">
              Code Drop AI
            </h1>
            <p className="text-lg text-gray-300">
              Drop your requirements & we will build it for you
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-gray-800/80 backdrop-blur-sm rounded-lg border border-gray-700/50 p-6 transition-shadow duration-300 hover:shadow-[0_20px_50px_rgba(8,_112,_184,_0.7)]">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="Describe the website you want to build..."
                className="w-full h-32 p-4 bg-gray-900/50 text-gray-100 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none placeholder-gray-500 backdrop-blur-sm overflow-scroll scrollbar-hide"
              />
              <Button
                type="submit"
                className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Generate Website Plan
              </Button>
            </div>
          </form>
        </div>
      </div>
    </BackgroundBeamsWithCollision>
  );
}
