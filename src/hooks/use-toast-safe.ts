import { useToast as useToastOriginal } from "@/components/context/ToastContext";

// Safe wrapper for useToast that provides fallbacks if context is not available
export const useToastSafe = () => {
  try {
    return useToastOriginal();
  } catch (error) {
    // Fallback implementation when toast context is not available
    console.warn("Toast context not available, using fallback implementation");

    return {
      toasts: [],
      addToast: (toast: any) =>
        console.warn("Toast:", toast.title, toast.description),
      removeToast: (id: string) => console.warn("Remove toast:", id),
      clearAllToasts: () => console.warn("Clear all toasts"),
      showSuccess: (title: string, description?: string) =>
        console.log("✅ Success:", title, description),
      showError: (title: string, description?: string) =>
        console.error("❌ Error:", title, description),
      showWarning: (title: string, description?: string) =>
        console.warn("⚠️ Warning:", title, description),
      showInfo: (title: string, description?: string) =>
        console.info("ℹ️ Info:", title, description),
    };
  }
};
