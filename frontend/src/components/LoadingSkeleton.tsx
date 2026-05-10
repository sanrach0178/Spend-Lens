import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function LoadingSkeleton() {
  return (
    <main className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">

        {/* Back button + title skeleton */}
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 rounded-md bg-muted animate-pulse" />
          <div className="space-y-2">
            <div className="h-8 w-72 bg-muted rounded-md animate-pulse" />
            <div className="h-4 w-48 bg-muted/60 rounded-md animate-pulse" />
          </div>
        </div>

        {/* Hero stat cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[0, 1].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-8">
                <div className="h-4 w-32 bg-muted rounded animate-pulse mb-4" />
                <div className="h-14 w-48 bg-muted rounded-lg animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* AI Summary skeleton */}
        <Card>
          <CardHeader>
            <div className="h-6 w-56 bg-muted rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="h-4 w-full bg-muted/70 rounded animate-pulse" />
              <div className="h-4 w-full bg-muted/70 rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-muted/70 rounded animate-pulse" />
            </div>
            <div className="mt-4 h-5 w-36 bg-muted/50 rounded-full animate-pulse" />
          </CardContent>
        </Card>

        {/* Tool breakdown skeleton */}
        <div className="space-y-4">
          <div className="h-6 w-40 bg-muted rounded animate-pulse" />
          {[0, 1, 2].map((i) => (
            <Card key={i} className="overflow-hidden border-l-4 border-l-muted">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6 justify-between md:items-center">
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-xl bg-muted animate-pulse hidden sm:block" />
                    <div className="space-y-2">
                      <div className="h-6 w-36 bg-muted rounded animate-pulse" />
                      <div className="h-4 w-64 bg-muted/60 rounded animate-pulse" />
                      <div className="h-3 w-48 bg-muted/40 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-2 md:text-right">
                    <div className="h-3 w-20 bg-muted/60 rounded animate-pulse md:ml-auto" />
                    <div className="h-7 w-28 bg-muted rounded animate-pulse md:ml-auto" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Lead capture skeleton */}
        <Card>
          <CardContent className="p-8">
            <div className="h-6 w-72 bg-muted rounded animate-pulse mb-2 mx-auto" />
            <div className="h-4 w-96 bg-muted/60 rounded animate-pulse mx-auto mb-6" />
            <div className="max-w-md mx-auto space-y-4">
              <div className="h-10 w-full bg-muted rounded-md animate-pulse" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-10 w-full bg-muted rounded-md animate-pulse" />
                <div className="h-10 w-full bg-muted rounded-md animate-pulse" />
              </div>
              <div className="h-10 w-full bg-muted/80 rounded-full animate-pulse" />
            </div>
          </CardContent>
        </Card>

      </div>
    </main>
  );
}
