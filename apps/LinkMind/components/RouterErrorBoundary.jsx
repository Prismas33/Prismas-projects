"use client";
import { Component } from "react";

class RouterErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Check if it's a router-related error
    if (error.message?.includes('join') || error.message?.includes('router')) {
      return { hasError: true, error };
    }
    return null;
  }

  componentDidCatch(error, errorInfo) {
    console.error('Router Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] to-[#334155]">
          <div className="text-center text-white p-8">
            <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
            <p className="text-white/70 mb-6">We're experiencing a temporary issue. Please refresh the page.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-[#7B4BFF] to-[#6C2BFF] text-white rounded-full font-medium hover:from-[#8B5AFF] hover:to-[#7C3BFF] transition-all"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default RouterErrorBoundary;
