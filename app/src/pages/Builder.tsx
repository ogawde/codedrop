import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { StepsList } from "../components/StepsList";
import { Step, FileItem, StepType } from "../types";
import { BACKEND_URL } from "../config";
import axios from "axios";
import { parseXml } from "../steps";

const MOCK_FILE_CONTENT = `// This is a sample file content
import React from 'react';

function Component() {
  return <div>Hello World</div>;
}

export default Component;
`;

export function Builder() {
  const location = useLocation();

  const { prompt } = location.state as { prompt: string }; // this brings data from user

  const [userPrompt, setPrompt] = useState("");

  const [loading, setLoading] = useState(false);

  const [llmMessages, setLlmMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);

  const [files, setFiles] = useState<FileItem[]>([]); //empty file driectory
  const [steps, setSteps] = useState<Step[]>([]); // empty steps

  async function init() {
    // we hit the backend with this function
    const response = await axios.post(`${BACKEND_URL}/template`, {
      prompt: prompt.trim(),
    });

    // setTemplateSet(true);

    // we get this in response from the backend url is /template
    // prompt is the user generated one & uiprompts

    const { prompts, uiPrompts } = response.data;

    // "steps" we will get from uiPrompts (template)

    setSteps(
      parseXml(uiPrompts[0]).map((x: Step) => ({
        ...x,
        status: "pending",
      }))
    );

    // converting xml files by xml parser to steps
    // setLoading(true);

    const stepsResponse = await axios.post(`${BACKEND_URL}/chat`, {
      messages: [...prompts, prompt].map((content) => ({
        role: "user",
        content,
      })),
    });

    setLoading(false);

    setSteps((s) => [
      ...s,
      ...parseXml(stepsResponse.data.response).map((x) => ({
        ...x,
        status: "pending" as "pending",
      })),
    ]);

    // okay after thsi all data is converted from xmls to steps

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
  }
  useEffect(() => {
    init();
  }, []);
}
