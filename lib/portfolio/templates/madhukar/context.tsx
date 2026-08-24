// @ts-nocheck
"use client";
import React, { createContext, useContext } from 'react';

const TemplateContext = createContext<any>(null);

export function TemplateProvider({ children, data }: { children: React.ReactNode, data: any }) {
  return <TemplateContext.Provider value={data}>{children}</TemplateContext.Provider>;
}

export function useTemplateData() {
  return useContext(TemplateContext);
}