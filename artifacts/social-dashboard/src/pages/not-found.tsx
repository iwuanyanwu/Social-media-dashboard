import { Skeleton } from "@/components/ui/skeleton"

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
      <h1 className="text-6xl font-bold tracking-tighter text-muted">404</h1>
      <h2 className="text-2xl font-semibold mt-4 mb-2">Page Not Found</h2>
      <p className="text-muted-foreground mb-8">The page you're looking for doesn't exist or has been moved.</p>
      <a href="/" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
        Return to Dashboard
      </a>
    </div>
  )
}
