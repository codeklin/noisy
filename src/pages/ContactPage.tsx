import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { useState } from "react";

// Import Material UI icons
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const ContactPage = () => {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, you would send the form data to your backend
    console.log("Form submitted:", formData);
    
    // Simulate form submission
    setTimeout(() => {
      setFormSubmitted(true);
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: ""
      });
    }, 1000);
  };

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
                Contact Us
              </h1>
              <p className="text-xl text-[#333]">
                We'd love to hear from you! Reach out with any questions or feedback.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="overflow-hidden border-none shadow-lg h-full">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FF3B45] to-[#FF8E53]"></div>
                  <CardHeader className="bg-gradient-to-r from-[#fff5f5] to-[#fff8f0]">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-[#FF3B45]/10">
                        <EmailIcon className="h-6 w-6 text-[#FF3B45]" />
                      </div>
                      <CardTitle className="text-[#333]">Email</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p className="text-gray-600">
                      <a href="mailto:hello@noisy.com" className="hover:text-[#FF3B45] transition-colors">
                        hello@noisy.com
                      </a>
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                      We'll respond within 24 hours
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Card className="overflow-hidden border-none shadow-lg h-full">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0B2D93] to-[#4ECDC4]"></div>
                  <CardHeader className="bg-gradient-to-r from-[#f0f4ff] to-[#e6fffa]">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-[#0B2D93]/10">
                        <PhoneIcon className="h-6 w-6 text-[#0B2D93]" />
                      </div>
                      <CardTitle className="text-[#333]">Phone</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p className="text-gray-600">
                      <a href="tel:+1234567890" className="hover:text-[#0B2D93] transition-colors">
                         Send US a Message
                      </a>
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                      Monday-Friday, 9am-5pm EST
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Card className="overflow-hidden border-none shadow-lg h-full">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#4ECDC4] to-[#FF8E53]"></div>
                  <CardHeader className="bg-gradient-to-r from-[#e6fffa] to-[#fff8f0]">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-[#4ECDC4]/10">
                        <LocationOnIcon className="h-6 w-6 text-[#4ECDC4]" />
                      </div>
                      <CardTitle className="text-[#333]">Location</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p className="text-gray-600">
                      Tech City<br />
                      Nigeria                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                      Chat US
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Card className="overflow-hidden border-none shadow-lg">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FF3B45] to-[#0B2D93]"></div>
                <CardHeader className="bg-gradient-to-r from-[#fff5f5] to-[#f0f4ff]">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-[#FF3B45]/10">
                      <SendIcon className="h-6 w-6 text-[#FF3B45]" />
                    </div>
                    <div>
                      <CardTitle className="text-[#0B2D93]">Send Us a Message</CardTitle>
                      <CardDescription>We'd love to hear from you</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {formSubmitted ? (
                    <motion.div 
                      className="flex flex-col items-center justify-center py-8"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4 }}
                    >
                      <CheckCircleIcon className="h-16 w-16 text-green-500 mb-4" />
                      <h3 className="text-2xl font-bold text-[#333] mb-2">Message Sent!</h3>
                      <p className="text-gray-600 text-center max-w-md">
                        Thank you for reaching out. We'll get back to you as soon as possible.
                      </p>
                      <Button 
                        className="mt-6 bg-gradient-to-r from-[#FF3B45] to-[#0B2D93] hover:opacity-90"
                        onClick={() => setFormSubmitted(false)}
                      >
                        Send Another Message
                      </Button>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label htmlFor="name" className="text-sm font-medium text-gray-700">
                            Your Name
                          </label>
                          <Input 
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            required
                            className="border-gray-300 focus:border-[#0B2D93] focus:ring-[#0B2D93]"
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="email" className="text-sm font-medium text-gray-700">
                            Email Address
                          </label>
                          <Input 
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="john@example.com"
                            required
                            className="border-gray-300 focus:border-[#0B2D93] focus:ring-[#0B2D93]"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="subject" className="text-sm font-medium text-gray-700">
                          Subject
                        </label>
                        <Input 
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          placeholder="How can we help you?"
                          required
                          className="border-gray-300 focus:border-[#0B2D93] focus:ring-[#0B2D93]"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="message" className="text-sm font-medium text-gray-700">
                          Message
                        </label>
                        <Textarea 
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          placeholder="Tell us more about your inquiry..."
                          required
                          className="min-h-[150px] border-gray-300 focus:border-[#0B2D93] focus:ring-[#0B2D93]"
                        />
                      </div>
                      <div className="pt-2">
                        <Button 
                          type="submit"
                          className="w-full bg-gradient-to-r from-[#FF3B45] to-[#0B2D93] hover:opacity-90 text-white py-2 px-4 rounded-md flex items-center justify-center gap-2"
                        >
                          <SendIcon className="h-4 w-4" />
                          Send Message
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ContactPage;
