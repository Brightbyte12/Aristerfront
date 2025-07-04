
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import NextImage from "next/image";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <Card className="border-0 shadow-sm max-w-md w-full mx-4 sm:mx-6 lg:mx-8">
        <CardContent className="p-6 sm:p-8 text-center">
          <div className="mb-6">
            <NextImage
              src="/404 Error-rafiki.svg"
              alt="404 Not Found"
              width={200}
              height={200}
              className="mx-auto"
            />
          </div>
          <h1 className="text-3xl sm:text-4xl font-light text-darkGreen mb-4">Page Not Found</h1>
          <p className="text-responsive-base text-gray-600 mb-6">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              variant="rounded"
              className="border-none bg-darkGreen text-cream hover:bg-mocha hover:text-cream px-6 py-3 text-sm sm:text-base rounded-full shadow-md transition-all duration-300 ease-in-out"
            >
              <Link href="/">Return to Home</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-darkGreen text-darkGreen hover:bg-darkGreen hover:text-cream px-6 py-3 text-sm sm:text-base rounded-full transition-all duration-300 ease-in-out"
            >
              <Link href="/collections">Browse Collections</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="absolute top-0 w-full">
        <div className="bg-darkGreen text-cream text-center py-2 text-xs sm:text-sm">
          Page Not Found
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <nav className="text-xs sm:text-sm text-gray-600">
            <Link href="/" className="hover:text-darkGreen transition-colors">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-darkGreen">404</span>
          </nav>
        </div>
      </div>
    </div>
  );
}
