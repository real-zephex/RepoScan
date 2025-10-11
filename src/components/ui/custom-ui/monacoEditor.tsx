"use client";

import React, { useRef } from "react";
import Editor from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { Copy, Download } from "lucide-react";
import { getFileIcon } from "./fileStructure";
import CodeVulnerabilities from "./vulnerabilities";

interface MonacoEditorProps {
  file: { path: string; content: string };
}

const getMonacoLanguage = (path: string): string => {
  const extension = path.toLowerCase().split(".").pop();
  switch (extension) {
    case "js":
      return "javascript";
    case "jsx":
      return "javascript";
    case "ts":
      return "typescript";
    case "tsx":
      return "typescript";
    case "json":
      return "json";
    case "md":
      return "markdown";
    case "css":
      return "css";
    case "scss":
    case "sass":
      return "scss";
    case "less":
      return "less";
    case "html":
      return "html";
    case "xml":
      return "xml";
    case "py":
      return "python";
    case "java":
      return "java";
    case "cpp":
    case "cc":
    case "cxx":
      return "cpp";
    case "c":
      return "c";
    case "cs":
      return "csharp";
    case "php":
      return "php";
    case "rb":
      return "ruby";
    case "go":
      return "go";
    case "rs":
      return "rust";
    case "swift":
      return "swift";
    case "kt":
      return "kotlin";
    case "dart":
      return "dart";
    case "sh":
    case "bash":
      return "shell";
    case "ps1":
      return "powershell";
    case "sql":
      return "sql";
    case "yml":
    case "yaml":
      return "yaml";
    case "toml":
      return "toml";
    case "ini":
      return "ini";
    case "dockerfile":
      return "dockerfile";
    case "env":
      return "plaintext";
    case "gitignore":
      return "plaintext";
    case "lock":
      return "json";
    default:
      return "plaintext";
  }
};

const MonacoEditor: React.FC<MonacoEditorProps> = ({ file }) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const language = getMonacoLanguage(file.path);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(file.content);
      // You could add a toast notification here
    } catch (err) {
      console.error("Failed to copy content:", err);
    }
  };

  const downloadFile = () => {
    const blob = new Blob([file.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.path.split("/").pop() || "file.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleEditorDidMount = (
    editor: editor.IStandaloneCodeEditor,
    monaco: typeof import("monaco-editor")
  ) => {
    editorRef.current = editor;

    // Configure Monaco Editor
    monaco.editor.defineTheme("custom-theme", {
      base: "vs",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#ffffff",
        "editor.foreground": "#333333",
        "editor.lineHighlightBackground": "#f5f5f5",
        "editor.selectionBackground": "#e3f2fd",
        "editorLineNumber.foreground": "#999999",
        "editorLineNumber.activeForeground": "#333333",
      },
    });

    monaco.editor.setTheme("custom-theme");

    // Set editor options
    editor.updateOptions({
      readOnly: true,
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      wordWrap: "on",
      fontSize: 14,
      lineNumbers: "on",
      glyphMargin: false,
      folding: true,
      lineDecorationsWidth: 0,
      lineNumbersMinChars: 4,
      renderWhitespace: "selection",
      contextmenu: true,
      selectOnLineNumbers: true,
      roundedSelection: false,
      automaticLayout: true,
    });
  };

  return (
    <div
      className={`flex flex-col bg-white border-l border-gray-200 flex-1 max-h-screen h-full`}
    >
      {/* Header */}
      <div className="sticky top-0 bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          {getFileIcon(file.path)}
          <span className="text-sm font-medium text-gray-800 truncate">
            {file.path}
          </span>
          <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
            {language}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={copyToClipboard}
            className="p-1.5 hover:bg-gray-200 rounded transition-colors"
            title="Copy content"
          >
            <Copy size={16} className="text-gray-600" />
          </button>
          <button
            onClick={downloadFile}
            className="p-1.5 hover:bg-gray-200 rounded transition-colors"
            title="Download file"
          >
            <Download size={16} className="text-gray-600" />
          </button>
          <CodeVulnerabilities code={file.content} path={file.path} />
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={language}
          value={file.content}
          onMount={handleEditorDidMount}
          loading={
            <div className="flex items-center justify-center h-full">
              <div className="text-sm text-gray-600">Loading editor...</div>
            </div>
          }
          options={{
            readOnly: true,
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            wordWrap: "on",
            fontSize: 14,
            lineNumbers: "on",
            glyphMargin: false,
            folding: true,
            lineDecorationsWidth: 0,
            lineNumbersMinChars: 4,
            renderWhitespace: "selection",
            contextmenu: true,
            selectOnLineNumbers: true,
            roundedSelection: false,
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
};

export default MonacoEditor;
