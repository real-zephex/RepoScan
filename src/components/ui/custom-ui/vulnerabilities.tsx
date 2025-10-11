"use client";
import * as React from "react";
import { AlertTriangle, Shield, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCallback, useMemo, useRef, useState } from "react";
import GroqVulnerabilityScan, {
  Issues,
} from "@/lib/models/functions/vulnerabilityScan";

export default function CodeVulnerabilities({
  code,
  path,
}: {
  code: string;
  path: string;
}) {
  const [error, setError] = useState<string>("");
  const [vulnerabilities, setVulnerabilities] = useState<Issues[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Cache key based on current code and path
  const cacheKey = useMemo(() => `${path}::${code}`, [code, path]);
  const cacheRef = useRef<Map<string, Issues[]>>(new Map());

  const triggerVulnerabilityAnalysis = useCallback(
    async (e: React.MouseEvent) => {
      try {
        setError("");
        setIsLoading(true);

        const cached = cacheRef.current.get(cacheKey);
        if (cached) {
          setVulnerabilities(cached);
          return;
        }

        const results = await GroqVulnerabilityScan({ code, filePath: path });
        if (results.status && Array.isArray(results.issues)) {
          cacheRef.current.set(cacheKey, results.issues);
          setVulnerabilities(results.issues);
        } else {
          cacheRef.current.set(cacheKey, []);
          setVulnerabilities([]);
          if (results.error) setError(results.error);
        }
      } catch (error) {
        console.error("Error during vulnerability analysis:", error);
        setError("An error occurred during vulnerability analysis.");
      } finally {
        setIsLoading(false);
      }
    },
    [code, path, cacheKey]
  );

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-600 bg-red-50";
      case "high":
        return "text-orange-600 bg-orange-50";
      case "medium":
        return "text-yellow-600 bg-yellow-50";
      case "low":
        return "text-blue-600 bg-blue-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
      case "high":
        return <XCircle className="w-4 h-4" />;
      case "medium":
        return <AlertTriangle className="w-4 h-4" />;
      case "low":
        return <Shield className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          className="hover:cursor-pointer hover:shadow-xl"
          onClick={triggerVulnerabilityAnalysis}
          disabled={isLoading}
        >
          {isLoading ? "Analyzing..." : "Analyze"}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-dvh">
        <div className="w-full h-full flex flex-col">
          <SheetHeader>
            <SheetTitle>Code Vulnerabilities</SheetTitle>
            <SheetDescription>
              Following vulnerabilities were found in this code.
            </SheetDescription>
          </SheetHeader>

          <div className="p-4 pb-0">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {isLoading && (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <span className="ml-2">Scanning for vulnerabilities...</span>
              </div>
            )}

            {!isLoading && vulnerabilities.length === 0 && !error && (
              <div className="text-center py-8">
                <Shield className="w-16 h-16 mx-auto text-green-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Vulnerabilities Found
                </h3>
                <p className="text-gray-600">
                  Great! This code appears to be secure.
                </p>
              </div>
            )}

            {vulnerabilities.length > 0 && (
              <ScrollArea className="h-[calc(100vh-200px)] ">
                <Accordion type="single" collapsible className="">
                  {vulnerabilities.map((vuln, idx) => (
                    <AccordionItem
                      key={`${vuln.cwe_id ?? "vuln"}-${idx}`}
                      value={`item-${idx}`}
                      className={`rounded-lg border mb-2 `}
                    >
                      {/* Row 1: Severity Icon + Vulnerability Title */}
                      <AccordionTrigger className="px-3">
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            {getSeverityIcon(vuln.severity)}
                            <span className="font-medium">
                              {vuln.title || vuln.cwe_name || "Vulnerability"}
                            </span>
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getSeverityColor(
                              vuln.severity
                            )}`}
                          >
                            {vuln.severity}
                          </span>
                        </div>
                      </AccordionTrigger>

                      <AccordionContent className="px-3 pb-4">
                        <div className="space-y-3">
                          {/* Row 2: CWE ID (badge) */}
                          {(vuln.cwe_id || vuln.cwe_name) && (
                            <div>
                              <Badge variant="outline">
                                {vuln.cwe_id || "CWE"}
                              </Badge>
                            </div>
                          )}

                          {/* Row 3: CWE Description */}
                          <div>
                            <p className="text-gray-700 text-sm">
                              {vuln.cwe_name || "No CWE description provided."}
                            </p>
                          </div>

                          {/* Row 4: Suggestion */}
                          {vuln.suggestion && (
                            <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                              <p className="text-sm font-semibold text-blue-800 mb-1">
                                Suggestion
                              </p>
                              <p className="text-sm text-blue-700">
                                {vuln.suggestion}
                              </p>
                            </div>
                          )}

                          {/* Row 5: Code Snippet + line number */}
                          {(vuln.codeSnippet || vuln.line != null) && (
                            <div className="bg-muted/40 border rounded p-3">
                              {typeof vuln.line === "number" && (
                                <p className="text-xs text-muted-foreground mb-1">
                                  Line {vuln.line}
                                </p>
                              )}
                              {vuln.codeSnippet && (
                                <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                                  {vuln.codeSnippet}
                                </pre>
                              )}
                            </div>
                          )}

                          {/* Last Row: Category */}
                          {vuln.category && (
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Category:{" "}
                                <span className="font-medium text-foreground">
                                  {vuln.category}
                                </span>
                              </p>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </ScrollArea>
            )}
          </div>

          <SheetFooter>
            <SheetClose asChild>
              <Button
                variant="outline"
                className="border-b-red-600 border-b-2 hover:cursor-pointer shadow-xl"
              >
                Close
              </Button>
            </SheetClose>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}
