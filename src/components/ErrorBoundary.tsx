import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCcw, AlertTriangle } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="h-10 w-10 text-destructive" />
          </div>
          <h1 className="text-3xl font-bold mb-3">Ups! Xəta baş verdi.</h1>
          <p className="text-muted-foreground mb-8 max-w-md text-lg">
            Səhifəni yükləyərkən gözlənilməz bir xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.
          </p>
          
          {this.state.error && (
            <div className="bg-muted/50 p-4 rounded-lg mb-8 max-w-lg w-full overflow-auto text-left border border-border">
              <p className="font-mono text-xs text-destructive">
                {this.state.error.toString()}
              </p>
            </div>
          )}

          <Button size="lg" onClick={() => window.location.reload()} className="gap-2">
            <RefreshCcw className="h-4 w-4" />
            Səhifəni Yenilə
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}