"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api-client";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Exchanging token...");
  const [error, setError] = useState<string | null>(null);
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    
    const code = searchParams.get("code");
    const provider = searchParams.get("provider")?.toUpperCase();
    
    async function processImport() {
      const state = searchParams.get("state");
      const storedState = sessionStorage.getItem("oauth_state");
      
      if (!code || !provider || !state) {
        setError("Missing code, provider, or state");
        return;
      }

      if (state !== storedState) {
        setError("Invalid OAuth state (CSRF verification failed)");
        return;
      }

      setStatus(`Importing data from ${provider}...`);
      
      const res = await apiClient.post(`/api/v1/integrations/${provider}/import`, {
        code,
        state,
      });

      if (res.success) {
        setStatus("Import successful! Redirecting...");
        setTimeout(() => router.push("/integrations"), 1500);
      } else {
        setError(res.error || "Failed to import profile");
      }
    }

    processed.current = true;
    processImport();
  }, [searchParams, router]);

  return (
    <div className="p-8 max-w-md mx-auto text-center border border-border-strong mt-24 bg-surface">
      <h2 className="text-2xl font-bold mb-4">Integration Sync</h2>
      {error ? (
        <div className="text-error mb-4">{error}</div>
      ) : (
        <div className="text-text-primary mb-4 animate-pulse">{status}</div>
      )}
      {error && (
        <button onClick={() => router.push("/integrations")} className="underline font-bold text-sm">
          Return to integrations
        </button>
      )}
    </div>
  );
}

export default function IntegrationsCallbackPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CallbackHandler />
    </Suspense>
  );
}
