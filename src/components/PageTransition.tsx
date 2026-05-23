import {type ReactNode } from 'react';

export const PageTransition = ({ children }: { children: ReactNode }) => (
  <div className="animate-fade-in-up">{children}</div>
);