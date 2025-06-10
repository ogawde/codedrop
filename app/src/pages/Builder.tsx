import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { StepsList } from "../components/StepsList";
import { FileExplorer } from "../components/FileExplorer";
import { TabView } from "../components/TabView";
import { CodeEditor } from "../components/CodeEditor";
import { PreviewFrame } from "../components/PreviewFrame";
import { ChatSection } from "../components/ChatSection";
import { Step, FileItem, StepType } from "../types";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { parseXml } from "../steps";
import { useWebContainer } from "../hooks/useWebContainer";
import { Loader } from "../components/Loader";

export function Builder() {
  const location = useLocation();

  const { prompt } = location.state as { prompt: string };

  const [llmMessages, setLlmMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  
  const [uiMessages, setUiMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const webcontainer = useWebContainer();

  const [currentStep, setCurrentStep] = useState(1);
  const [activeTab, setActiveTab] = useState<"code" | "preview">("code");
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);

  const [files, setFiles] = useState<FileItem[]>([]);
  const [steps, setSteps] = useState<Step[]>([]);


  useEffect(() => {
    let originalFiles = [...files];
    let updateHappened = false;
    steps
      .filter(({ status }) => status === "pending")
      .map((step) => {
        updateHappened = true;

        if (step?.type === StepType.CreateFile) {
          let parsedPath = step.path?.split("/") ?? [];
          let currentFileStructure = [...originalFiles];
          let finalAnswerRef = currentFileStructure;

          let currentFolder = "";
          while (parsedPath.length) {
            currentFolder = `${currentFolder}/${parsedPath[0]}`;
            let currentFolderName = parsedPath[0];
            parsedPath = parsedPath.slice(1);

            if (!parsedPath.length) {
              let file = currentFileStructure.find(
                (x) => x.path === currentFolder
              );
              if (!file) {
                currentFileStructure.push({
                  name: currentFolderName,
                  type: "file",
                  path: currentFolder,
                  content: step.code,
                });
              } else {
                file.content = step.code;
              }
            } else {
              let folder = currentFileStructure.find(
                (x) => x.path === currentFolder
              );
              if (!folder) {
                currentFileStructure.push({
                  name: currentFolderName,
                  type: "folder",
                  path: currentFolder,
                  children: [],
                });
              }

              currentFileStructure = currentFileStructure.find(
                (x) => x.path === currentFolder
              )!.children!;
            }
          }
          originalFiles = finalAnswerRef;
        }
      });

    if (updateHappened) {
      setFiles(originalFiles);
      setSteps((steps) =>
        steps.map((s: Step) => {
          return {
            ...s,
            status: "completed",
          };
        })
      );
    }
  }, [steps, files]);

  useEffect(() => {
    const createMountStructure = (files: FileItem[]): Record<string, any> => {
      const mountStructure: Record<string, any> = {};

      const processFile = (file: FileItem, isRootFolder: boolean) => {
        if (file.type === "folder") {
          mountStructure[file.name] = {
            directory: file.children
              ? Object.fromEntries(
                  file.children.map((child) => [
                    child.name,
                    processFile(child, false),
                  ])
                )
              : {},
          };
        } else if (file.type === "file") {
          if (isRootFolder) {
            mountStructure[file.name] = {
              file: {
                contents: file.content || "",
              },
            };
          } else {
            return {
              file: {
                contents: file.content || "",
              },
            };
          }
        }

        return mountStructure[file.name];
      };

      files.forEach((file) => processFile(file, true));

      return mountStructure;
    };

    const mountStructure = createMountStructure(files);
    webcontainer?.mount(mountStructure);
  }, [files, webcontainer]);

  async function init() {
    try {
      const response = await axios.post(`${BACKEND_URL}/template`, {
        prompt: prompt.trim(),
      });

      const { prompts, uiPrompts } = response.data;

      setSteps(
        parseXml(uiPrompts[0]).map((x: Step) => ({
          ...x,
          status: "pending",
        }))
      );

      const stepsResponse = await axios.post(`${BACKEND_URL}/chat`, {
        messages: [...prompts, prompt].map((content) => ({
          role: "user",
          content,
        })),
      });

      setSteps((s) => [
        ...s,
        ...parseXml(stepsResponse.data.response).map((x) => ({
          ...x,
          status: "pending" as "pending",
        })),
      ]);

      setLlmMessages(
        [...prompts, prompt].map((content) => ({
          role: "user",
          content,
        }))
      );

      setLlmMessages((x) => [
        ...x,
        { role: "assistant", content: stepsResponse.data.response },
      ]);

      setInitialLoading(false);
    } catch (error) {
      console.error("Initialization error:", error);
      setInitialLoading(false);
    }
  }
  useEffect(() => {
    init();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col relative">
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-100">Code Drop AI</h1>
        <p className="text-sm text-gray-400 mt-1">Prompt: {prompt}</p>
      </header>

      <div className="flex-1 overflow-hidden">
        <div className="h-full grid grid-cols-6 gap-6 p-6">
          <div className="col-span-1 flex flex-col gap-6 h-[calc(100vh-8rem)]">
            <div className="h-1/2 overflow-hidden">
              <StepsList
                steps={steps}
                currentStep={currentStep}
                onStepClick={setCurrentStep}
              />
            </div>

            <div className="h-1/2 overflow-hidden">
              <ChatSection
                messages={uiMessages}
                loading={loading}
                onSendMessage={async (message) => {
                  const newMessage = {
                    role: "user" as "user",
                    content: message,
                  };

                  setLoading(true);
                  const stepsResponse = await axios.post(
                    `${BACKEND_URL}/chat`,
                    {
                      messages: [...llmMessages, newMessage],
                    }
                  );
                  setLoading(false);

                  const assistantMessage = {
                    role: "assistant" as "assistant",
                    content: stepsResponse.data.response,
                  };

                  setLlmMessages((x) => [...x, newMessage, assistantMessage]);

                  setUiMessages((x) => [...x, newMessage]);

                  setSteps((s) => [
                    ...s,
                    ...parseXml(stepsResponse.data.response).map(
                      (x) => ({
                        ...x,
                        status: "pending" as "pending",
                      })
                    ),
                  ]);
                }}
              />
            </div>
          </div>

          <div className="col-span-1">
            <FileExplorer files={files} onFileSelect={setSelectedFile} />
          </div>
         
          <div className="col-span-4 bg-gray-900 rounded-lg shadow-lg p-4 h-[calc(100vh-8rem)]">
            <TabView activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="h-[calc(100%-4rem)]">
              {activeTab === "code" ? (
                <CodeEditor file={selectedFile} />
              ) : webcontainer ? (
                <PreviewFrame webContainer={webcontainer} />
              ) : (
                <Loader />
              )}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {initialLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="text-center"
            >
              <Loader />
              <p className="mt-4 text-lg text-gray-300 font-medium">
                Building your project...
              </p>
              <p className="mt-2 text-sm text-gray-400">
                Setting up files and generating code
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
