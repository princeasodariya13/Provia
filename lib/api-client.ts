export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: unknown;
}

export const apiClient = {
  async fetch<T>(url: string, options?: RequestInit): Promise<APIResponse<T>> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || "An error occurred",
          details: data.details,
        };
      }

      return data as APIResponse<T>;
    } catch (error: unknown) {
      return {
        success: false,
        error: "Network error occurred",
        details: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
  
  get<T>(url: string, options?: RequestInit) {
    return this.fetch<T>(url, { ...options, method: "GET" });
  },
  
  post<T>(url: string, body: unknown, options?: RequestInit) {
    return this.fetch<T>(url, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    });
  },
};
