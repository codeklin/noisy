
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

// Import Material UI icons
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SpeedIcon from '@mui/icons-material/Speed';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import DevicesIcon from '@mui/icons-material/Devices';
import EditIcon from '@mui/icons-material/Edit';

const AboutPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 relative overflow-hidden bg-gradient-to-br from-[#f8e1eb] via-[#f0f4ff] to-[#e6f7ff]">
        {/* Background dots pattern */}
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(#FF3B45_1px,transparent_1px)] [background-size:20px_20px]"></div>
        </div>
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(#0B2D93_1.5px,transparent_1.5px)] [background-size:30px_30px]"></div>
        </div>

        <section className="py-10 px-4 md:py-16 relative z-10">
          <div className="container max-w-4xl">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#FF3B45] to-[#0B2D93] bg-clip-text text-transparent">
                About Noisy
              </h1>
              <p className="text-xl text-[#333]">
                Your all-in-one solution for viral social media content planning and generation
              </p>
            </motion.div>

            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="overflow-hidden border-none shadow-lg">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FF3B45] to-[#0B2D93]"></div>
                  <CardHeader className="bg-gradient-to-r from-[#fff5f5] to-[#f0f4ff]">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-[#FF3B45]/10">
                        <VolumeUpIcon className="h-6 w-6 text-[#FF3B45]" />
                      </div>
                      <div>
                        <CardTitle className="text-[#0B2D93]">Our Mission</CardTitle>
                        <CardDescription>Why we built Noisy</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
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
            </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Card className="overflow-hidden border-none shadow-lg">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0B2D93] to-[#4ECDC4]"></div>
                  <CardHeader className="bg-gradient-to-r from-[#f0f4ff] to-[#e6fffa]">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-[#0B2D93]/10">
                        <SpeedIcon className="h-6 w-6 text-[#0B2D93]" />
                      </div>
                      <div>
                        <CardTitle className="text-[#0B2D93]">How It Works</CardTitle>
                        <CardDescription>The technology behind Noisy</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-full bg-[#FF3B45]/10 mt-1">
                          <EditIcon className="h-5 w-5 text-[#FF3B45]" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-[#333]">Input your brand information</h3>
                          <p className="text-gray-600">We collect essential details about your brand, target audience, content themes, and tone preferences.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-full bg-[#0B2D93]/10 mt-1">
                          <AutoAwesomeIcon className="h-5 w-5 text-[#0B2D93]" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-[#333]">Intelligent content generation</h3>
                          <p className="text-gray-600">Our system creates 30 days of tailored content for Facebook, Twitter, and LinkedIn, optimized for each platform's unique characteristics, including viral content strategies.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-full bg-[#4ECDC4]/10 mt-1">
                          <DevicesIcon className="h-5 w-5 text-[#4ECDC4]" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-[#333]">Review and customize</h3>
                          <p className="text-gray-600">Edit any post to add your personal touch or make specific adjustments to better align with your brand voice.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-full bg-[#FF8E53]/10 mt-1">
                          <TrendingUpIcon className="h-5 w-5 text-[#FF8E53]" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-[#333]">Export and implement</h3>
                          <p className="text-gray-600">Download your complete content plan in PDF or DOCX format, ready to use in your favorite scheduling tool.</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <Card className="overflow-hidden border-none shadow-lg">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FF3B45] to-[#FF8E53]"></div>
                  <CardHeader className="bg-gradient-to-r from-[#fff5f5] to-[#fff8f0]">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-[#FF8E53]/10">
                        <AutoAwesomeIcon className="h-6 w-6 text-[#FF8E53]" />
                      </div>
                      <div>
                        <CardTitle className="text-[#FF3B45]">Key Features</CardTitle>
                        <CardDescription>What makes Noisy special</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white p-4 rounded-lg shadow-sm border border-[#f0f4ff] hover:shadow-md transition-all duration-300 hover:border-[#FF3B45]/20">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-1.5 rounded-full bg-[#FF3B45]/10">
                            <DevicesIcon className="h-5 w-5 text-[#FF3B45]" />
                          </div>
                          <h3 className="text-lg font-medium text-[#333]">Platform-Specific Content</h3>
                        </div>
                        <p className="text-gray-600">Each post is tailored to the specific platform it's designed for, following best practices for length, tone, and format.</p>
                      </div>

                      <div className="bg-white p-4 rounded-lg shadow-sm border border-[#f0f4ff] hover:shadow-md transition-all duration-300 hover:border-[#0B2D93]/20">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-1.5 rounded-full bg-[#0B2D93]/10">
                            <TrendingUpIcon className="h-5 w-5 text-[#0B2D93]" />
                          </div>
                          <h3 className="text-lg font-medium text-[#333]">Viral Content Strategies</h3>
                        </div>
                        <p className="text-gray-600">We generate a mix of educational, promotional, engagement, and viral content using proven strategies from top creators to maximize reach and impact.</p>
                      </div>

                      <div className="bg-white p-4 rounded-lg shadow-sm border border-[#f0f4ff] hover:shadow-md transition-all duration-300 hover:border-[#4ECDC4]/20">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-1.5 rounded-full bg-[#4ECDC4]/10">
                            <EditIcon className="h-5 w-5 text-[#4ECDC4]" />
                          </div>
                          <h3 className="text-lg font-medium text-[#333]">Fully Customizable</h3>
                        </div>
                        <p className="text-gray-600">Edit any generated post to add your personal touch or specific details about your offerings.</p>
                      </div>

                      <div className="bg-white p-4 rounded-lg shadow-sm border border-[#f0f4ff] hover:shadow-md transition-all duration-300 hover:border-[#FF8E53]/20">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-1.5 rounded-full bg-[#FF8E53]/10">
                            <SpeedIcon className="h-5 w-5 text-[#FF8E53]" />
                          </div>
                          <h3 className="text-lg font-medium text-[#333]">Export Flexibility</h3>
                        </div>
                        <p className="text-gray-600">Download your content plan in multiple formats, ready to import into your favorite scheduling tools.</p>
                      </div>

                      <div className="bg-white p-4 rounded-lg shadow-sm border border-[#f0f4ff] hover:shadow-md transition-all duration-300 hover:border-[#FF3B45]/20">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-1.5 rounded-full bg-[#FF3B45]/10">
                            <VolumeUpIcon className="h-5 w-5 text-[#FF3B45]" />
                          </div>
                          <h3 className="text-lg font-medium text-[#333]">Local Storage</h3>
                        </div>
                        <p className="text-gray-600">Your content plan is saved locally, allowing you to return and make changes without starting over.</p>
                      </div>

                      <div className="bg-white p-4 rounded-lg shadow-sm border border-[#f0f4ff] hover:shadow-md transition-all duration-300 hover:border-[#0B2D93]/20">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-1.5 rounded-full bg-[#0B2D93]/10">
                            <AutoAwesomeIcon className="h-5 w-5 text-[#0B2D93]" />
                          </div>
                          <h3 className="text-lg font-medium text-[#333]">No Account Required</h3>
                        </div>
                        <p className="text-gray-600">Get started immediately without creating an account or providing personal information.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AboutPage;
