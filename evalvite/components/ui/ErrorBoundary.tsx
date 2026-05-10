'use client';

import { Component, type ReactNode } from 'react';

interface Props { children: ReactNode }
interface State { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="rounded-xl border border-error/20 bg-error/5 p-4 text-sm text-error">
          <p className="font-semibold">Erreur d'affichage</p>
          <p className="mt-1 text-xs opacity-70">{this.state.error.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}
