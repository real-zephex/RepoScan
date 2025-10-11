"use client";

import { useRepoContext } from "@/components/context/RepositoryContext";
import { GithubRepoStructure } from "@/lib/actions/github";
import { useState, useMemo } from "react";
import {
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  FolderOpen,
  FileText,
  FileImage,
  Settings,
  Code,
  Database,
  FileJson,
  FileVideo,
  FileAudio,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import MonacoEditor from "./monacoEditor";

interface TreeNode {
  name: string;
  path: string;
  type: "file" | "folder";
  children: TreeNode[];
  sha?: string;
  isOpen?: boolean;
}

export const getFileIcon = (fileName: string) => {
  const extension = fileName.toLowerCase().split(".").pop();
  const iconProps = { size: 16, className: "flex-shrink-0" };

  switch (extension) {
    case "js":
    case "jsx":
    case "ts":
    case "tsx":
      return <Code {...iconProps} className="text-blue-500 flex-shrink-0" />;
    case "json":
      return (
        <FileJson {...iconProps} className="text-yellow-600 flex-shrink-0" />
      );
    case "md":
    case "txt":
      return (
        <FileText {...iconProps} className="text-gray-600 flex-shrink-0" />
      );
    case "png":
    case "jpg":
    case "jpeg":
    case "gif":
    case "svg":
    case "ico":
      return (
        <FileImage {...iconProps} className="text-green-500 flex-shrink-0" />
      );
    case "mp4":
    case "webm":
    case "mov":
      return (
        <FileVideo {...iconProps} className="text-purple-500 flex-shrink-0" />
      );
    case "mp3":
    case "wav":
    case "ogg":
      return (
        <FileAudio {...iconProps} className="text-pink-500 flex-shrink-0" />
      );
    case "sql":
    case "db":
      return (
        <Database {...iconProps} className="text-orange-500 flex-shrink-0" />
      );
    case "config":
    case "conf":
    case "env":
    case "ini":
      return (
        <Settings {...iconProps} className="text-gray-500 flex-shrink-0" />
      );
    case "lock":
      return <Package {...iconProps} className="text-red-500 flex-shrink-0" />;
    default:
      return <File {...iconProps} className="text-gray-400 flex-shrink-0" />;
  }
};

const getFolderIcon = (isOpen: boolean) => {
  const iconProps = { size: 16, className: "flex-shrink-0" };
  return isOpen ? (
    <FolderOpen {...iconProps} className="text-blue-400 flex-shrink-0" />
  ) : (
    <Folder {...iconProps} className="text-blue-500 flex-shrink-0" />
  );
};

const buildTree = (files: GithubRepoStructure[]): TreeNode[] => {
  const nodeMap = new Map<string, TreeNode>();
  const rootNodes: TreeNode[] = [];

  // Create nodes for all paths (including intermediate folders)
  files.forEach((file) => {
    const parts = file.path.split("/");
    let currentPath = "";
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      if (!nodeMap.has(currentPath)) {
        const isFile = i === parts.length - 1 && file.type === "blob";
        nodeMap.set(currentPath, {
          name: part,
          path: currentPath,
          type: isFile ? "file" : "folder",
          children: [],
          sha: isFile ? file.sha : undefined,
          isOpen: false,
        });
      } else if (i === parts.length - 1 && file.type === "blob") {
        // Ensure last part reflects file info if previously created as folder
        const node = nodeMap.get(currentPath)!;
        node.type = "file";
        node.sha = file.sha;
      }
    }
  });

  // Build parent-child relationships
  nodeMap.forEach((node, path) => {
    const parts = path.split("/");
    if (parts.length === 1) {
      rootNodes.push(node);
    } else {
      const parentPath = parts.slice(0, -1).join("/");
      const parent = nodeMap.get(parentPath);
      if (parent) parent.children.push(node);
    }
  });

  // Sort nodes: folders first, then files; both alphabetically
  const sortNodes = (nodes: TreeNode[]): TreeNode[] =>
    nodes
      .sort((a, b) =>
        a.type !== b.type
          ? a.type === "folder"
            ? -1
            : 1
          : a.name.localeCompare(b.name)
      )
      .map((n) => ({ ...n, children: sortNodes(n.children) }));

  return sortNodes(rootNodes);
};

interface FileTreeItemProps {
  node: TreeNode;
  level: number;
  onToggle: (path: string) => void;
  onFileClick: (path: string, sha: string) => void;
  openFolders: Set<string>;
  selectedFile: string | null;
}

const FileTreeItem = ({
  node,
  level,
  onToggle,
  onFileClick,
  openFolders,
  selectedFile,
}: FileTreeItemProps) => {
  const isOpen = openFolders.has(node.path);
  const hasChildren = node.children.length > 0;
  const isSelected = selectedFile === node.path;

  const handleClick = () => {
    if (node.type === "folder") {
      onToggle(node.path);
    } else if (node.sha) {
      onFileClick(node.path, node.sha);
    }
  };

  return (
    <div className="select-none">
      <div
        className={cn(
          "flex items-center gap-1 py-1 px-2 cursor-pointer text-sm transition-colors duration-150",
          isSelected
            ? "bg-blue-100 border-r-2 border-blue-500"
            : "hover:bg-gray-100 hover:bg-opacity-60"
        )}
        style={{ paddingLeft: `${8 + level * 16}px` }}
        onClick={handleClick}
      >
        {node.type === "folder" && hasChildren && (
          <button className="p-0 hover:bg-gray-200 rounded">
            {isOpen ? (
              <ChevronDown size={14} className="text-gray-600" />
            ) : (
              <ChevronRight size={14} className="text-gray-600" />
            )}
          </button>
        )}
        {node.type === "folder" && !hasChildren && <div className="w-[14px]" />}
        {node.type === "file" && <div className="w-[14px]" />}

        <div className="flex items-center gap-2 min-w-0 flex-1">
          {node.type === "folder"
            ? getFolderIcon(isOpen)
            : getFileIcon(node.name)}
          <span className="truncate text-gray-800 text-sm font-medium">
            {node.name}
          </span>
        </div>
      </div>

      {node.type === "folder" && isOpen && hasChildren && (
        <div>
          {node.children.map((child) => (
            <FileTreeItem
              key={child.path}
              node={child}
              level={level + 1}
              onToggle={onToggle}
              onFileClick={onFileClick}
              openFolders={openFolders}
              selectedFile={selectedFile}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const FileStructure = () => {
  const { repoStructure, isLoading, currentFile, loadFileContent } =
    useRepoContext();
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set());
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const treeData = useMemo(() => {
    if (!repoStructure) return [];
    return buildTree(repoStructure);
  }, [repoStructure]);

  const handleToggleFolder = (path: string) => {
    setOpenFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  const handleFileClick = async (path: string, sha: string) => {
    setSelectedFile(path);
    await loadFileContent(path, sha);
  };

  if (isLoading && !repoStructure) {
    return (
      <div className="flex items-center justify-center p-8 w-full">
        <div className="text-sm text-gray-600">
          Loading repository structure...
        </div>
      </div>
    );
  }

  if (!repoStructure || repoStructure.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center w-full">
        <Folder size={48} className="text-gray-400 mb-4" />
        <div className="text-sm text-gray-600 mb-2">No repository loaded</div>
        <div className="text-xs text-gray-500">
          Import a repository to view its structure
        </div>
      </div>
    );
  }

  return (
    <div className="w-full  border-gray-200 rounded-lg overflow-hidden shadow-sm">
      <ResizablePanelGroup direction="horizontal">
        {/* Explorer panel */}
        <ResizablePanel
          defaultSize={25}
          minSize={15}
          maxSize={50}
          className="bg-gray-50/50 h-dvh overflow-y-auto border-r border-gray-200"
        >
          <div className="h-full flex flex-col">
            <div className="sticky top-0 bg-gray-100 border-b border-gray-200 px-4 py-4 z-10">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Explorer
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto py-2">
              {treeData.map((node) => (
                <FileTreeItem
                  key={node.path}
                  node={node}
                  level={0}
                  onToggle={handleToggleFolder}
                  onFileClick={handleFileClick}
                  openFolders={openFolders}
                  selectedFile={selectedFile}
                />
              ))}
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Content panel */}
        <ResizablePanel className="h-dvh">
          {currentFile ? (
            <MonacoEditor file={currentFile} />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-white">
              <div className="text-center">
                <FileText size={48} className="text-gray-400 mb-4 mx-auto" />
                <div className="text-lg text-gray-600 mb-2">
                  No file selected
                </div>
                <div className="text-sm text-gray-500">
                  Click on a file in the explorer to view its content
                </div>
              </div>
            </div>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default FileStructure;
