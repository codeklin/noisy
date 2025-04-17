import { Loader2 } from 'lucide-react';

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
}

const Loading = ({ message = 'Loading...', fullScreen = false }: LoadingProps) => {
  const containerClasses = fullScreen 
    ? 'fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50' 
    : 'flex items-center justify-center min-h-[50vh]';

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center gap-2 p-4 rounded-lg">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-lg font-medium text-foreground">{message}</span>
      </div>
    </div>
  );
};

export default Loading;
