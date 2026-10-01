import { ErrorView } from '../components/errors/ErrorView';

export const UnauthorizedPage = () => <ErrorView code={401} />;
export const ForbiddenPage = () => <ErrorView code={403} />;
export const TooManyRequestsPage = () => <ErrorView code={429} />;
export const ServerErrorPage = () => <ErrorView code={500} />;
