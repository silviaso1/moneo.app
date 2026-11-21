import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Tela quebrou:', error, info?.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="bg-white rounded-[28px] p-5 shadow-sm text-sm">
          <p className="font-bold text-rose-600 mb-1">Essa tela quebrou</p>
          <p className="text-gray-500 break-words">{String(this.state.error.message)}</p>
        </div>
      );
    }
    return this.props.children;
  }
}