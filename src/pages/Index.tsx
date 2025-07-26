import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-hero rounded-lg"></div>
              <span className="text-xl font-semibold text-foreground">Blank App</span>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                About
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </a>
            </nav>
            <Button variant="outline" size="sm">
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Your Blank Canvas
            <span className="bg-gradient-hero bg-clip-text text-transparent ml-3">
              Awaits
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            A clean, minimal starting point for your next great project. 
            Built with modern tools and beautiful design principles.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="shadow-elegant">
              Start Building
            </Button>
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mt-20">
          <Card className="p-6 shadow-subtle hover:shadow-elegant transition-all duration-300">
            <div className="h-12 w-12 bg-gradient-subtle rounded-lg mb-4 flex items-center justify-center">
              <div className="h-6 w-6 bg-gradient-hero rounded"></div>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Modern Stack</h3>
            <p className="text-muted-foreground">
              Built with React, TypeScript, and Tailwind CSS for modern development.
            </p>
          </Card>

          <Card className="p-6 shadow-subtle hover:shadow-elegant transition-all duration-300">
            <div className="h-12 w-12 bg-gradient-subtle rounded-lg mb-4 flex items-center justify-center">
              <div className="h-6 w-6 bg-gradient-hero rounded-full"></div>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Clean Design</h3>
            <p className="text-muted-foreground">
              Minimal and elegant design system ready for customization.
            </p>
          </Card>

          <Card className="p-6 shadow-subtle hover:shadow-elegant transition-all duration-300">
            <div className="h-12 w-12 bg-gradient-subtle rounded-lg mb-4 flex items-center justify-center">
              <div className="h-6 w-6 bg-gradient-hero rounded-sm rotate-45"></div>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Developer Ready</h3>
            <p className="text-muted-foreground">
              All the tools and components you need to build amazing applications.
            </p>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2024 Blank App. Ready for your ideas.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;