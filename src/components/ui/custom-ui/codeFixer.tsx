"use client";

import { Sparkles } from "lucide-react";
import { Button } from "../button";
import { useState, useRef, useMemo, useCallback } from "react";
import { useRepoContext } from "@/components/context/RepositoryContext";
import CodeFixer from "@/lib/models/functions/code-rewrite";

const AICodeFix = ({
  changeCodeContent,
}: {
  changeCodeContent: (status: "new" | "old", newCode: string) => void;
}) => {
  const [currentStatus, setCurrentStatus] = useState<"corrected" | "default">(
    "default"
  );
  const [loading, setLoading] = useState<boolean>(false);
  const { currentFile, currentIssues } = useRepoContext();

  const cacheKey = useMemo(
    () =>
      `${currentFile?.path || ""}::${currentFile?.content || ""}::${
        currentIssues?.join("||") || ""
      }`,
    [currentFile?.content, currentFile?.path, currentIssues]
  );
  const correctedCodeCacheRef = useRef<Map<string, string>>(new Map());

  const getCodeRewrite = useCallback(async () => {
    if (!currentFile || !currentIssues) return;
    if (loading) return;

    setLoading(true);

    if (currentStatus === "corrected") {
      setCurrentStatus("default");
      changeCodeContent("old", "");
      setLoading(false);
      return;
    }

    try {
      // Check cache first
      const cachedCode = correctedCodeCacheRef.current.get(cacheKey);
      if (cachedCode) {
        console.log("Using cached corrected code");
        setCurrentStatus("corrected");
        changeCodeContent("new", cachedCode);
        setLoading(false);
        return;
      }

      const response = await CodeFixer({
        code: currentFile.content,
        issues: currentIssues,
      });
      if (response.status) {
        console.log(response.fixedCode);
        // Cache the corrected code
        correctedCodeCacheRef.current.set(cacheKey, response.fixedCode);
        setCurrentStatus("corrected");
        changeCodeContent("new", response.fixedCode);
      }
    } catch (error) {
      console.error("Error getting code rewrite:", error);
    } finally {
      setLoading(false);
    }
  }, [
    currentFile,
    currentIssues,
    loading,
    currentStatus,
    cacheKey,
    changeCodeContent,
  ]);

  return (
    <div className="flex flex-row items-center gap-2">
      <Button
        className={`${
          currentStatus === "corrected"
            ? "bg-lime-300 hover:bg-lime-200"
            : "bg-cyan-300 hover:bg-cyan-200"
        } shadow-2xl drop-shadow-2xl cursor-pointer active:scale-95 transition-all disabled:cursor-pointer ${
          loading ? "animate-pulse" : ""
        }`}
        disabled={currentIssues.length === 0}
        title={
          currentIssues.length === 0 ? "Analyze the code first" : "Fix Code"
        }
        onClick={getCodeRewrite}
      >
        <Sparkles color="black" />
      </Button>
    </div>
  );
};

export default AICodeFix;
