
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
                About Noisy
              </h1>
              <p className="text-xl text-muted-foreground">
                Your all-in-one solution for viral social media content planning and generation
              </p>
            </div>

            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Our Mission</CardTitle>
                  <CardDescription>Why we built Noisy</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-lg leading-relaxed">
                    In a digital world filled with constant chatter, we founded Noisy with a simple yet powerful belief: not all noise is created equal. Some noise gets lost in the void, while other noise—the right kind of noise—cuts through the clutter and resonates with people.
                  </p>
                  <p className="text-lg leading-relaxed mt-4">
                    Noisy was born from the frustration of watching brilliant businesses and creators struggle to be heard. We saw talented entrepreneurs spending countless hours crafting social media content that barely made a ripple, while their competitors with mediocre offerings but better content strategies were making waves.
                  </p>
                  <p className="text-lg leading-relaxed mt-4">
                    We asked ourselves: What if we could democratize viral content creation? What if we could give every business the power to make the kind of noise that turns heads, sparks conversations, and drives real business results?
                  </p>
                  <p className="text-lg leading-relaxed mt-4">
                    That's exactly what we've built. Noisy isn't just about creating content—it's about creating the right kind of noise that amplifies your brand's voice and message. It's about transforming the time-consuming process of content creation into a strategic advantage that helps you rise above the digital cacophony.
                  </p>
                  <p className="text-lg leading-relaxed mt-4">
                    Today, Noisy helps thousands of businesses and creators make noise that matters—noise that converts followers into customers and builds lasting brand resonance in an increasingly crowded marketplace.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>How It Works</CardTitle>
                  <CardDescription>The technology behind Noisy</CardDescription>
                </CardHeader>
                <CardContent>
                  <ol className="list-decimal list-inside space-y-4 text-lg">
                    <li className="pl-2"><span className="font-semibold">Input your brand information:</span> We collect essential details about your brand, target audience, content themes, and tone preferences.</li>
                    <li className="pl-2"><span className="font-semibold">Intelligent content generation:</span> Our system creates 30 days of tailored content for Facebook, Twitter, and LinkedIn, optimized for each platform's unique characteristics, including viral content strategies.</li>
                    <li className="pl-2"><span className="font-semibold">Review and customize:</span> Edit any post to add your personal touch or make specific adjustments.</li>
                    <li className="pl-2"><span className="font-semibold">Export and implement:</span> Download your complete content plan in PDF or DOCX format, ready to use in your favorite scheduling tool.</li>
                  </ol>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Key Features</CardTitle>
                  <CardDescription>What makes Noisy special</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Platform-Specific Content</h3>
                      <p>Each post is tailored to the specific platform it's designed for, following best practices for length, tone, and format.</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-2">Viral Content Strategies</h3>
                      <p>We generate a mix of educational, promotional, engagement, and viral content using proven strategies from top creators to maximize reach and impact.</p>
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
