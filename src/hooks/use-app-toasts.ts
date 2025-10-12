import { useToast } from "@/components/context/ToastContext";

export const useAppToasts = () => {
  const { showSuccess, showError, showWarning, showInfo } = useToast();

  const toasts = {
    // Repository operations
    repoLoading: () =>
      showInfo("Loading Repository", "Fetching repository structure..."),
    repoLoadSuccess: (owner: string, repo: string) =>
      showSuccess("Repository Loaded", `${owner}/${repo} loaded successfully`),
    repoLoadError: (message: string) =>
      showError("Repository Load Failed", message, true),

    // File operations
    fileLoading: (filename: string) =>
      showInfo("Loading File", `Loading ${filename}...`),
    fileLoadSuccess: (filename: string) =>
      showInfo("File Loaded", `${filename} loaded successfully`),
    fileLoadError: (filename: string, message: string) =>
      showError("File Load Failed", `Failed to load ${filename}: ${message}`),

    // Code fixing
    codeFixStart: () =>
      showInfo("Fixing Code", "Analyzing and fixing code issues..."),
    codeFixSuccess: (issueCount: number) =>
      showSuccess(
        "Code Fixed Successfully!",
        `Fixed ${issueCount} issue${issueCount !== 1 ? "s" : ""} using AI`
      ),
    codeFixError: (message?: string) =>
      showError("Code Fix Failed", message || "Failed to generate code fixes"),
    codeRevert: () => showInfo("Reverted to Original", "Showing original code"),

    // Vulnerability scanning
    scanStart: () =>
      showInfo("Scanning Code", "Analyzing code for vulnerabilities..."),
    scanComplete: (vulnerabilityCount: number) => {
      if (vulnerabilityCount === 0) {
        showSuccess("Scan Complete", "No vulnerabilities found");
      } else {
        showWarning(
          "Vulnerabilities Found",
          `Found ${vulnerabilityCount} potential issues`
        );
      }
    },
    scanError: (message: string) => showError("Scan Failed", message),

    // General operations
    operationStart: (operation: string) =>
      showInfo("Processing", `${operation} in progress...`),
    operationSuccess: (operation: string, details?: string) =>
      showSuccess(`${operation} Complete`, details),
    operationError: (operation: string, message: string) =>
      showError(`${operation} Failed`, message),
  };

  return toasts;
};
