"use client";

import { useRepoContext } from "@/components/context/RepositoryContext";
import { useToast } from "@/components/context/ToastContext";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ImportRepo = () => {
  const { fetchRepoStructure, isLoading } = useRepoContext();
  const { showInfo } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [repoUrl, setRepoUrl] = useState("");
  const [branch, setBranch] = useState("main");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!repoUrl.trim()) {
      return;
    }

    showInfo("Loading Repository", "Fetching repository structure...");
    const result = await fetchRepoStructure(repoUrl, branch);
    if (result.status) {
      setIsModalOpen(false);
      setRepoUrl("");
      setBranch("main");
    }
  };

  return (
    <div>
      {isModalOpen && (
        <section className="fixed w-full h-full bg-black/50 top-0 left-0 flex flex-col justify-center items-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Import Repository</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="repoUrl">Repository URL</Label>
                  <Input
                    id="repoUrl"
                    type="url"
                    placeholder="https://github.com/owner/repo"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branch">Branch Name</Label>
                  <Input
                    id="branch"
                    type="text"
                    placeholder="main"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Loading..." : "Import"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </section>
      )}

      <button
        onClick={() => setIsModalOpen(true)}
        className="flex flex-row items-center gap-2 border border-gray-300 px-3 py-1 rounded bg-lime-300 hover:shadow-xl active:scale-95 transition-all hover:cursor-pointer"
      >
        <span>+ Import Repo</span>
      </button>
    </div>
  );
};

export default ImportRepo;
