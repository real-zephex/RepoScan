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
  Copy,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TreeNode {
  name: string;
  path: string;
  type: "file" | "folder";
  children: TreeNode[];
  sha?: string;
  isOpen?: boolean;
}

const getFileIcon = (fileName: string) => {
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

  // First pass: create all nodes
  files.forEach((file) => {
    const node: TreeNode = {
      name: file.path.split("/").pop() || file.path,
      path: file.path,
      type: file.type === "blob" ? "file" : "folder",
      children: [],
      sha: file.type === "blob" ? file.sha : undefined,
      isOpen: false,
    };
    nodeMap.set(file.path, node);
  });

  // Second pass: build parent-child relationships
  const rootNodes: TreeNode[] = [];

  files.forEach((file) => {
    const node = nodeMap.get(file.path);
    if (!node) return;

    const pathParts = file.path.split("/");

    if (pathParts.length === 1) {
      // Root level item
      rootNodes.push(node);
    } else {
      // Find parent path
      const parentPath = pathParts.slice(0, -1).join("/");
      const parentNode = nodeMap.get(parentPath);

      if (parentNode) {
        parentNode.children.push(node);
      } else {
        // Create intermediate parent folders if they don't exist
        let currentPath = "";
        for (let i = 0; i < pathParts.length - 1; i++) {
          const part = pathParts[i];
          const newPath = currentPath ? `${currentPath}/${part}` : part;

          if (!nodeMap.has(newPath)) {
            const folderNode: TreeNode = {
              name: part,
              path: newPath,
              type: "folder",
              children: [],
              isOpen: false,
            };
            nodeMap.set(newPath, folderNode);

            if (i === 0) {
              rootNodes.push(folderNode);
            } else {
              const parentPath = pathParts.slice(0, i).join("/");
              const parent = nodeMap.get(parentPath);
              if (parent) {
                parent.children.push(folderNode);
              }
            }
          }
          currentPath = newPath;
        }

        // Now add the current node to its parent
        const finalParentPath = pathParts.slice(0, -1).join("/");
        const finalParent = nodeMap.get(finalParentPath);
        if (finalParent) {
          finalParent.children.push(node);
        }
      }
    }
  });

  // Sort function
  const sortNodes = (nodes: TreeNode[]): TreeNode[] => {
    return nodes
      .sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === "folder" ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      })
      .map((node) => ({
        ...node,
        children: sortNodes(node.children),
      }));
  };

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

// File content viewer component
const FileContentViewer = ({
  file,
}: {
  file: { path: string; content: string };
}) => {
  const getLanguageFromPath = (path: string): string => {
    const extension = path.toLowerCase().split(".").pop();
    switch (extension) {
      case "js":
        return "javascript";
      case "jsx":
        return "jsx";
      case "ts":
        return "typescript";
      case "tsx":
        return "tsx";
      case "json":
        return "json";
      case "md":
        return "markdown";
      case "css":
        return "css";
      case "html":
        return "html";
      case "py":
        return "python";
      case "java":
        return "java";
      case "cpp":
      case "c":
        return "cpp";
      case "xml":
        return "xml";
      case "yml":
      case "yaml":
        return "yaml";
      default:
        return "text";
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(file.content);
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

  return (
    <div className="flex-1 flex flex-col bg-white border-l border-gray-200">
      <div className="sticky top-0 bg-gray-50 border-b border-gray-200 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getFileIcon(file.path)}
          <span className="text-sm font-medium text-gray-800 truncate">
            {file.path}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={copyToClipboard}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
            title="Copy content"
          >
            <Copy size={16} className="text-gray-600" />
          </button>
          <button
            onClick={downloadFile}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
            title="Download file"
          >
            <Download size={16} className="text-gray-600" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <pre className="p-4 text-sm font-mono leading-relaxed whitespace-pre-wrap break-words">
          <code className={`language-${getLanguageFromPath(file.path)}`}>
            {file.content}
          </code>
        </pre>
      </div>
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
    <div className="flex w-full max-h-screen">
      {/* File Explorer */}
      <div className="w-80 border-r border-gray-200 bg-gray-50/50 flex-shrink-0">
        <div className="sticky top-0 bg-gray-100 border-b border-gray-200 px-4 py-3">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
            Explorer
          </h3>
        </div>

        <div className="py-2">
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

      {/* File Content Viewer */}
      {currentFile ? (
        <FileContentViewer file={currentFile} />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-white">
          <div className="text-center">
            <FileText size={48} className="text-gray-400 mb-4 mx-auto" />
            <div className="text-lg text-gray-600 mb-2">No file selected</div>
            <div className="text-sm text-gray-500">
              Click on a file in the explorer to view its content
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileStructure;
