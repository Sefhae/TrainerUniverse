import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="relative flex min-h-[78vh] items-center justify-center overflow-hidden bg-ink px-5 text-center text-bone">
      <div className="grain-layer" />
      <div className="relative">
        <p className="font-display text-[8rem] leading-none text-volt sm:text-[12rem]">404</p>
        <h1 className="font-display text-4xl tracking-wide sm:text-5xl">Page Not Found</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm text-bone/55">
          The page you are looking for has moved, or never existed in the first place.
        </p>
        <Link to="/" className="btn btn-volt mt-8">
          Back to Home
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
