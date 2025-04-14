
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const AboutPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <section className="py-10 px-4 md:py-16">
          <div className="container max-w-4xl">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-brand-purple to-brand-blue bg-clip-text text-transparent">
                About ContentCrafter
              </h1>
              <p className="text-xl text-muted-foreground">
                Your all-in-one solution for social media content planning and generation
              </p>
            </div>
            
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Our Mission</CardTitle>
                  <CardDescription>Why we built ContentCrafter</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-lg leading-relaxed">
                    ContentCrafter was created to solve a common challenge faced by businesses, marketers, and content creators: maintaining a consistent, engaging presence across multiple social media platforms. We believe that strategic content planning shouldn't be limited to those with large budgets or specialized teams.
                  </p>
                  <p className="text-lg leading-relaxed mt-4">
                    Our mission is to democratize content planning by providing a tool that generates tailored, platform-specific content based on your brand's unique characteristics, allowing you to execute a professional social media strategy without the usual time investment or expertise barriers.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>How It Works</CardTitle>
                  <CardDescription>The technology behind ContentCrafter</CardDescription>
                </CardHeader>
                <CardContent>
                  <ol className="list-decimal list-inside space-y-4 text-lg">
                    <li className="pl-2"><span className="font-semibold">Input your brand information:</span> We collect essential details about your brand, target audience, content themes, and tone preferences.</li>
                    <li className="pl-2"><span className="font-semibold">Intelligent content generation:</span> Our system creates 30 days of tailored content for Facebook, Twitter, and LinkedIn, optimized for each platform's unique characteristics.</li>
                    <li className="pl-2"><span className="font-semibold">Review and customize:</span> Edit any post to add your personal touch or make specific adjustments.</li>
                    <li className="pl-2"><span className="font-semibold">Export and implement:</span> Download your complete content plan in PDF or DOCX format, ready to use in your favorite scheduling tool.</li>
                  </ol>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Key Features</CardTitle>
                  <CardDescription>What makes ContentCrafter special</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Platform-Specific Content</h3>
                      <p>Each post is tailored to the specific platform it's designed for, following best practices for length, tone, and format.</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-2">Content Variety</h3>
                      <p>We generate a mix of educational, promotional, engagement, and inspirational content to keep your audience interested.</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-2">Fully Customizable</h3>
                      <p>Edit any generated post to add your personal touch or specific details about your offerings.</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-2">Export Flexibility</h3>
                      <p>Download your content plan in multiple formats, ready to import into your favorite scheduling tools.</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-2">Local Storage</h3>
                      <p>Your content plan is saved locally, allowing you to return and make changes without starting over.</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-2">No Account Required</h3>
                      <p>Get started immediately without creating an account or providing personal information.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default AboutPage;
