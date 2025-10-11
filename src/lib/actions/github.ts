"use server";

import { Octokit } from "@octokit/rest";

interface RepoStructureResponseProps {
  status: boolean;
  data: GithubRepoStructure[];
  message?: string;
}

interface CodeContentResponseProps {
  status: boolean;
  data: string;
  message?: string;
}

export interface GithubRepoStructure {
  path: string;
  mode: string;
  type: "blob" | "tree";
  sha: string;
  size: number;
  url: string;
}

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const RepoStructure = async ({
  repoUrl,
  branch = "main",
}: {
  repoUrl: string;
  branch: string;
}) => {
  try {
    if (!repoUrl) {
      return {
        status: false,
        data: [],
        message: "Repository URL is required",
      } as RepoStructureResponseProps;
    }

    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)(\.git)?$/);
    if (!match) {
      return {
        status: false,
        data: [],
        message: "Invalid GitHub repository URL",
      } as RepoStructureResponseProps;
    }

    const owner = match[1];
    const repo = match[2].replace(/\.git$/, "");

    const branchInfo = await octokit.repos.getBranch({
      owner,
      repo,
      branch,
    });
    const branchSha = branchInfo.data.commit.sha;

    const treeData = await octokit.git.getTree({
      owner,
      repo,
      tree_sha: branchSha,
      recursive: "true",
    });

    return {
      status: true,
      data: treeData.data.tree,
    } as RepoStructureResponseProps;
  } catch (error) {
    console.error("Error fetching repository structure:", error);
    return {
      status: false,
      data: [],
      message: (error as Error).message || "An error occurred",
    };
  }
};

const CodeContent = async ({
  owner,
  repo,
  sha,
}: {
  owner: string;
  repo: string;
  sha: string;
}) => {
  try {
    if (!owner || !repo || !sha) {
      return {
        status: false,
        data: "",
        message: "Owner, repository, and SHA are required",
      } as CodeContentResponseProps;
    }

    const response = await octokit.request(
      "GET /repos/{owner}/{repo}/git/blobs/{file_sha}",
      {
        owner,
        repo,
        file_sha: sha,
      }
    );

    const base64data = response.data.content;
    if (!base64data) {
      return {
        status: false,
        data: "",
        message: "File content not found",
      } as CodeContentResponseProps;
    }

    const cleanBase64 = base64data.replace(/\n/g, "");
    const buffer = Buffer.from(cleanBase64, "base64");
    const fileText = buffer.toString("utf-8");

    if (fileText && fileText.length > 0) {
      return {
        status: true,
        data: fileText,
      } as CodeContentResponseProps;
    }

    return {
      status: false,
      data: "",
      message: "File is empty",
    } as CodeContentResponseProps;
  } catch (error) {
    console.error("Error fetching file content:", error);
    return {
      status: false,
      data: "",
      message: (error as Error).message || "An error occurred",
    };
  }
};

export { RepoStructure, CodeContent };
