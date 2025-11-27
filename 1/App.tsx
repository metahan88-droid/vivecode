import React, { useState } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { Button } from './components/Button';
import { generateCleanDiagram } from './services/geminiService';
import { AppState } from './types';
import { Wand2, Download, RotateCcw, AlertCircle, BookOpen } from 'lucide-react';

// Default prompt from user request
const DEFAULT_PROMPT = `이 수학문제에 대한 기하 일러스트를 깨끗한 교과서 스타일로 만들어줘. 
[스타일 가이드 준수]: 
- 배경은 완전 흰색
- 모든 도형 선은 검은색 실선
- 길이 표시는 점선
- 폰트는 명조체 계열
- 손으로 그린 평행 표시(화살표)는 깔끔하고 표준적인 모양의 검은색 화살표촉으로 변환
가이드에 따라서 일러스트 만들어줘`;

const App: React.FC = () => {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [prompt] = useState<string>(DEFAULT_PROMPT);
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleProcess = async () => {
    if (!sourceImage) return;

    setAppState(AppState.PROCESSING);
    setErrorMessage(null);
    setResultImage(null);

    try {
      const generated = await generateCleanDiagram(sourceImage, prompt);
      setResultImage(generated);
      setAppState(AppState.COMPLETE);
    } catch (error: any) {
      console.error(error);
      setAppState(AppState.ERROR);
      setErrorMessage(error.message || "Something went wrong while processing the image.");
    }
  };

  const handleReset = () => {
    setSourceImage(null);
    setResultImage(null);
    setAppState(AppState.IDLE);
    setErrorMessage(null);
  };

  const handleDownload = () => {
    if (!resultImage) return;
    const link = document.createElement('a');
    link.href = resultImage;
    link.download = `math-diagram-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">수학 문제 일러스트 변환기</h1>
          </div>
          <div className="text-sm text-slate-500 font-medium">
             Gemini 2.5 Flash Image Powered
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
          
          {/* Left Column: Input */}
          <div className="flex flex-col space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full">
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-bold mr-2">1</span>
                Input Sketch
              </h2>
              
              <ImageUploader 
                onImageSelected={setSourceImage} 
                selectedImage={sourceImage}
                onClear={handleReset}
              />

              {/* Prompt section hidden as per request */}
              
              <div className="mt-6 pt-6 border-t border-slate-100">
                <Button 
                  onClick={handleProcess} 
                  disabled={!sourceImage || appState === AppState.PROCESSING}
                  isLoading={appState === AppState.PROCESSING}
                  className="w-full py-3 text-lg"
                  icon={<Wand2 size={20} />}
                >
                  Generate Clean Diagram
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column: Output */}
          <div className="flex flex-col space-y-6">
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full min-h-[500px]">
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-bold mr-2">2</span>
                Clean Result
              </h2>

              <div className="flex-1 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center overflow-hidden relative group">
                {resultImage ? (
                  <img 
                    src={resultImage} 
                    alt="Generated Diagram" 
                    className="max-w-full max-h-full object-contain p-4 transition-transform duration-300"
                  />
                ) : (
                   <div className="text-center p-8">
                     {appState === AppState.PROCESSING ? (
                       <div className="flex flex-col items-center space-y-4 animate-pulse">
                         <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                         <div className="h-4 bg-slate-200 rounded w-32"></div>
                         <div className="h-3 bg-slate-200 rounded w-48"></div>
                       </div>
                     ) : appState === AppState.ERROR ? (
                       <div className="flex flex-col items-center text-red-500 max-w-xs mx-auto">
                         <AlertCircle size={48} className="mb-4" />
                         <p className="text-center font-medium">{errorMessage}</p>
                       </div>
                     ) : (
                       <div className="flex flex-col items-center text-slate-400">
                         <Wand2 size={48} className="mb-4 opacity-50" />
                         <p>Generated image will appear here</p>
                       </div>
                     )}
                   </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="mt-6 flex items-center space-x-3">
                 <Button 
                    variant="secondary" 
                    onClick={handleReset}
                    disabled={appState === AppState.PROCESSING || !resultImage}
                    className="flex-1"
                    icon={<RotateCcw size={18} />}
                 >
                   Start Over
                 </Button>
                 <Button 
                    variant="primary" 
                    onClick={handleDownload}
                    disabled={!resultImage}
                    className="flex-[2]"
                    icon={<Download size={18} />}
                 >
                   Download Image
                 </Button>
              </div>

            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
};

export default App;