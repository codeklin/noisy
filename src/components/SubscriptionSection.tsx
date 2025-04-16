import { useState } from "react";
import { usePaystackPayment } from "react-paystack";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Zap, Star, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import TryFreeDemo from "./TryFreeDemo";

// Define the Paystack config type
type PaystackConfig = {
  reference: string;
  email: string;
  amount: number;
  publicKey: string;
};

const SubscriptionSection = () => {
  const { user, updateUserPaymentStatus } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  // Generate a unique reference for this transaction
  const reference = `noisy_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;

  // Paystack configuration
  const config: PaystackConfig = {
    reference,
    email: user?.email || "customer@example.com",
    amount: 100000, // Amount in kobo (N1000)
    publicKey: "pk_test_your_public_key_here", // Replace with your actual Paystack public key
  };

  const initializePayment = usePaystackPayment(config);

  // Handle successful payment
  const onSuccess = () => {
    setIsProcessing(false);

    // Update user payment status
    if (updateUserPaymentStatus) {
      updateUserPaymentStatus(true);
    }

    toast({
      title: "Payment Successful!",
      description: "Thank you for your purchase. You now have full access to Noisy!",
    });
  };

  // Handle payment cancellation
  const onClose = () => {
    setIsProcessing(false);
    toast({
      title: "Payment Cancelled",
      description: "Your payment was cancelled. Please try again when you're ready.",
      variant: "destructive",
    });
  };

  const handleSubscribe = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login or create an account to subscribe.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    // @ts-ignore - The type definitions for usePaystackPayment are not perfect
    initializePayment(onSuccess, onClose);
  };

  const features = [
    "Full access to AI-powered content generator",
    "Proven viral content strategies from top creators",
    "Unlimited content plans for all platforms",
    "Export to PDF and DOCX formats",
    "No monthly fees or hidden charges",
    "Lifetime updates and new features",
    "Save and organize your content plans",
    "24/7 access from any device"
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Marketing Manager",
      avatar: "/testimonial1.png",
      content: "Noisy has completely transformed our social media strategy. We're seeing 3x more engagement with half the effort!",
      rating: 5
    },
    {
      name: "David Olalade",
      role: "Small Business Owner",
      avatar: "/testimonial2.png",
      content: "The one-time payment model is perfect for small businesses like mine. No more subscription fatigue!",
      rating: 5
    },
    {
      name: "Amara Okafor",
      role: "Content Creator",
      avatar: "/testimonial3.png",
      content: "I've tried many content tools, but Noisy's viral strategies are on another level. Worth every naira!",
      rating: 5
    }
  ];

  const faqs = [
    {
      question: "Is it really a one-time payment?",
      answer: "Yes! Pay once and get lifetime access to Noisy. No hidden fees, no monthly charges, and no surprise bills. All future updates are included."
    },
    {
      question: "How does the content generator work?",
      answer: "Our AI-powered generator creates platform-specific content based on your brand information. It uses proven viral strategies to craft engaging posts that resonate with your audience."
    },
    {
      question: "Can I edit the generated content?",
      answer: "Absolutely! All generated content can be edited to add your personal touch or specific details about your offerings."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit/debit cards, bank transfers, and mobile money through our secure Paystack integration."
    },
    {
      question: "What if I'm not satisfied with the tool?",
      answer: "We offer a 7-day money-back guarantee. If you're not completely satisfied with Noisy, simply contact us for a full refund."
    }
  ];

  return (
    <section className="py-16 relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(#FF3B45_1px,transparent_1px)] [background-size:20px_20px]"></div>
      </div>
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(#0B2D93_1.5px,transparent_1.5px)] [background-size:30px_30px]"></div>
      </div>

      <div className="container max-w-7xl mx-auto px-4">
        <motion.div
          className="text-center mb-12 relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#FF3B45] to-[#0B2D93] bg-clip-text text-transparent mb-4">
            Make Noise That Converts
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Join thousands of businesses creating viral content that drives real results
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-16">
          {/* Pricing Card */}
          <motion.div
            className="lg:col-span-2 relative z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-white/50 h-full">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FF3B45] to-[#0B2D93]"></div>

              <div className="p-8">
                <div className="flex justify-center mb-6">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-[#FF3B45] to-[#0B2D93] flex items-center justify-center">
                    <Zap className="h-10 w-10 text-white" />
                  </div>
                </div>

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Lifetime Access</h3>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-4xl font-bold text-[#FF3B45]">₦1,000</span>
                    <span className="text-gray-500 line-through">₦5,000</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">One-time payment, lifetime access</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="space-y-4">
                  <Button
                    className="w-full bg-gradient-to-r from-[#FF3B45] to-[#0B2D93] hover:opacity-90 text-white py-6 rounded-md flex items-center justify-center gap-2"
                    onClick={handleSubscribe}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      "Processing..."
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5" />
                        Subscribe Now
                      </>
                    )}
                  </Button>

                  <TryFreeDemo type="both" className="text-sm w-full" />
                </div>

                <div className="mt-6 flex items-center justify-center gap-2">
                  <div className="p-1 rounded-full bg-green-100">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <p className="text-sm text-gray-600">7-day money-back guarantee</p>
                </div>

                <p className="text-xs text-center text-gray-500 mt-4">
                  Secure payment powered by Paystack
                </p>
              </div>
            </div>
          </motion.div>

          {/* Benefits */}
          <motion.div
            className="lg:col-span-3 relative z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-white/50 h-full p-8">
              <h3 className="text-xl font-bold text-[#0B2D93] mb-6">Why Choose Noisy?</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-[#FF3B45]/10">
                      <Sparkles className="h-5 w-5 text-[#FF3B45]" />
                    </div>
                    <h4 className="font-semibold text-gray-800">Viral Content Strategies</h4>
                  </div>
                  <p className="text-gray-600 text-sm pl-10">Our AI is trained on proven viral content strategies from top creators across all major platforms.</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-[#0B2D93]/10">
                      <Zap className="h-5 w-5 text-[#0B2D93]" />
                    </div>
                    <h4 className="font-semibold text-gray-800">One-Time Payment</h4>
                  </div>
                  <p className="text-gray-600 text-sm pl-10">No monthly subscriptions or hidden fees. Pay once and get lifetime access to all features.</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-[#FF3B45]/10">
                      <Star className="h-5 w-5 text-[#FF3B45]" />
                    </div>
                    <h4 className="font-semibold text-gray-800">Premium Quality</h4>
                  </div>
                  <p className="text-gray-600 text-sm pl-10">Generate high-converting content that's tailored to your brand voice and audience preferences.</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-[#0B2D93]/10">
                      <MessageCircle className="h-5 w-5 text-[#0B2D93]" />
                    </div>
                    <h4 className="font-semibold text-gray-800">Customer Support</h4>
                  </div>
                  <p className="text-gray-600 text-sm pl-10">Get help when you need it with our responsive customer support team.</p>
                </div>
              </div>

              <div className="mt-8 p-4 bg-[#f8f9fa] rounded-lg border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-1.5 rounded-full bg-green-100">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <p className="font-medium text-gray-800">Join 5,000+ businesses making noise that matters</p>
                </div>
                <p className="text-gray-600 text-sm pl-9">From small businesses to enterprise brands, Noisy helps create content that converts followers into customers.</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Testimonials */}
        <motion.div
          className="mb-16 relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h3 className="text-2xl font-bold text-center mb-8 bg-gradient-to-r from-[#0B2D93] to-[#FF3B45] bg-clip-text text-transparent">
            What Our Customers Say
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md overflow-hidden border border-white/50 p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 + (index * 0.1) }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <Avatar>
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback>{testimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-gray-800">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>

                <p className="text-gray-600 mb-4">"{testimonial.content}"</p>

                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill={i < testimonial.rating ? 'currentColor' : 'none'} />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          className="max-w-3xl mx-auto relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <h3 className="text-2xl font-bold text-center mb-8 bg-gradient-to-r from-[#FF3B45] to-[#0B2D93] bg-clip-text text-transparent">
            Frequently Asked Questions
          </h3>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-white/50">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="px-6 py-4 text-left font-medium text-gray-800 hover:text-[#FF3B45]">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 text-gray-600">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <div className="mt-8 text-center">
            <div className="space-y-4 flex flex-col items-center">
              <Button
                className="bg-gradient-to-r from-[#FF3B45] to-[#0B2D93] hover:opacity-90 text-white py-6 px-8 rounded-md flex items-center justify-center gap-2 mx-auto"
                onClick={handleSubscribe}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  "Processing..."
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Get Started Now
                  </>
                )}
              </Button>

              <TryFreeDemo type="both" className="text-sm" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SubscriptionSection;
