import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function SmokeTestPage() {
  return (
    <main className="min-h-screen bg-background p-8">
      <h1 className="text-3xl font-bold text-foreground mb-2">
        Tailwind + shadcn/ui Smoke Test
      </h1>
      <p className="text-muted-foreground mb-8">
        Verifies that Tailwind CSS v4 and shadcn/ui components render correctly.
      </p>

      <Separator className="mb-8" />

      <div className="grid gap-8 max-w-2xl">
        {/* Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Button</CardTitle>
            <CardDescription>All button variants</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
            <Button disabled>Disabled</Button>
          </CardContent>
        </Card>

        {/* Input */}
        <Card>
          <CardHeader>
            <CardTitle>Input</CardTitle>
            <CardDescription>Text input field</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Input placeholder="Search peaks..." />
            <Input placeholder="Disabled" disabled />
          </CardContent>
        </Card>

        {/* Badge */}
        <Card>
          <CardHeader>
            <CardTitle>Badge</CardTitle>
            <CardDescription>All badge variants</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
          </CardContent>
        </Card>

        {/* Tailwind utilities */}
        <Card>
          <CardHeader>
            <CardTitle>Tailwind CSS v4</CardTitle>
            <CardDescription>Utility classes working correctly</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-3">
            <div className="w-12 h-12 rounded-md bg-primary" />
            <div className="w-12 h-12 rounded-md bg-secondary" />
            <div className="w-12 h-12 rounded-md bg-accent" />
            <div className="w-12 h-12 rounded-md bg-destructive" />
            <div className="w-12 h-12 rounded-md bg-muted" />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
