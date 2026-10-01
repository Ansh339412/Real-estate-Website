import { ErrorView } from '../components/errors/ErrorView';

export default function NotFoundPage() {
  return <ErrorView code={404} />;
}
