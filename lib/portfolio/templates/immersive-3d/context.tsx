"use client";
import React, { createContext, useContext } from "react";
const TemplateContext = createContext<any>(null);
export function TemplateProvider({ data, children }: { data: any, children: React.ReactNode }) {
  return <TemplateContext.Provider value={data}>{children}</TemplateContext.Provider>;
}
export function useTemplateData() {
  return useContext(TemplateContext);
}