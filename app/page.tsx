import { AetheriaCanvas } from '@/components/AetheriaCanvas';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function HomePage() {
  return (
    <ErrorBoundary>
      <AetheriaCanvas />
    </ErrorBoundary>
  );
}
