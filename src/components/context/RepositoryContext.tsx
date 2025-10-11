"use client";

import {
  CodeContent,
  GithubRepoStructure,
  RepoStructure,
} from "@/lib/actions/github";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
} from "react";

interface getFileContentProps {
  status: boolean;
  content: string;
}

interface fetchRepoStructureProps {
  status: boolean;
  data: GithubRepoStructure[];
}

interface RepoContextType {
  repoStructure: GithubRepoStructure[] | null;
  isLoading: boolean;
  error: string | null;
  currentFile: { path: string; content: string } | null;
  repoInfo: { owner: string; repo: string; branch: string } | null;
  setRepoStructure: (structure: GithubRepoStructure[] | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCurrentFile: (file: { path: string; content: string } | null) => void;
  fetchRepoStructure: (
    url: string,
    branch: string
  ) => Promise<fetchRepoStructureProps>;

  loadFileContent: (path: string, sha: string) => Promise<void>;
}

const RepoContext = createContext<RepoContextType | undefined>(undefined);

export const RepoProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<{
    path: string;
    content: string;
  } | null>(null);
  const [repoInfo, setRepoInfo] = useState<{
    owner: string;
    repo: string;
    branch: string;
  } | null>(null);
  const [repoStructure, setRepoStructure] = useState<
    GithubRepoStructure[] | null
  >(null);

  const fetchRepoStructure = async (
    url: string,
    branch: string
  ): Promise<fetchRepoStructureProps> => {
    setLoading(true);
    setError(null);
    setCurrentFile(null);

    try {
      const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)(\.git)?$/);
      if (!match) {
        setError("Invalid GitHub repository URL");
        setLoading(false);
        return { status: false, data: [] };
      }

      const owner = match[1];
      const repo = match[2].replace(/\.git$/, "");
      setRepoInfo({ owner, repo, branch });

      const repoContent = await RepoStructure({ repoUrl: url, branch });
      if (!repoContent.status) {
        setError(repoContent.message || "Failed to fetch repository structure");
        setLoading(false);
        return { status: false, data: [] };
      }
      setRepoStructure(repoContent.data);
      setLoading(false);
      return { status: true, data: repoContent.data };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      setLoading(false);
      return { status: false, data: [] };
    }
  };

  const loadFileContent = async (path: string, sha: string): Promise<void> => {
    if (!repoInfo) {
      setError("No repository information available");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const content = await CodeContent({
        owner: repoInfo.owner,
        repo: repoInfo.repo,
        sha,
      });

      if (!content.status) {
        setError(content.message || "Failed to fetch file content");
        setLoading(false);
        return;
      }

      setCurrentFile({ path, content: content.data });
      setLoading(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      setLoading(false);
    }
  };

  const contextValue = useMemo(
    () => ({
      repoStructure,
      isLoading,
      error,
      currentFile,
      repoInfo,
      setRepoStructure,
      setLoading,
      setError,
      setCurrentFile,
      fetchRepoStructure,
      loadFileContent,
    }),
    [repoStructure, isLoading, error, currentFile, repoInfo]
  );

  return (
    <RepoContext.Provider value={contextValue}>{children}</RepoContext.Provider>
  );
};

export const useRepoContext = () => {
  const context = useContext(RepoContext);
  if (context === undefined) {
    throw new Error("useRepoContext must be used within a RepoProvider");
  }
  return context;
};
