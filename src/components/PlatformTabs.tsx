
import { useState } from "react";
import { PostPlan } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PostList from "./PostList";
import { MessageSquare, Share2, MessageCircle } from "lucide-react";

interface PlatformTabsProps {
  posts: PostPlan;
  onEditPost: (postId: string, newContent: string) => void;
  onExport: (platform: 'facebook' | 'twitter' | 'linkedin' | 'all') => void;
}

const PlatformTabs = ({ posts, onEditPost, onExport }: PlatformTabsProps) => {
  const [activeTab, setActiveTab] = useState<'all' | 'facebook' | 'twitter' | 'linkedin'>("all");

  // Validate posts data
  if (!Array.isArray(posts)) {
    console.error("PlatformTabs: posts is not an array", posts);
    return (
      <div className="p-6 bg-red-50 rounded-lg border border-red-200 text-center">
        <p className="text-red-600 mb-4">There was an error loading your content.</p>
        <p className="text-gray-600 text-sm">Please try refreshing the page or contact support if the issue persists.</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 text-center">
        <p className="text-gray-600 mb-4">No content found in this plan.</p>
        <p className="text-gray-500 text-sm">Try generating new content or contact support if you believe this is an error.</p>
      </div>
    );
  }

  // Filter posts by platform, with additional error handling
  const filteredPosts = activeTab === "all"
    ? posts
    : posts.filter(post => post && post.platform === activeTab);

  return (
    <Tabs defaultValue="all" className="w-full" onValueChange={(value) => setActiveTab(value as 'all' | 'facebook' | 'twitter' | 'linkedin')}>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mb-4">
        <div className="overflow-x-auto pb-2 -mx-2 px-2">
          <TabsList className="h-auto p-1 w-max sm:w-auto">
          <TabsTrigger value="all" className="flex items-center gap-1 text-xs sm:text-sm py-1.5 px-2 sm:px-3">
            All
          </TabsTrigger>
          <TabsTrigger value="facebook" className="flex items-center gap-1 text-xs sm:text-sm py-1.5 px-2 sm:px-3">
            <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">FB</span>
            <span className="hidden sm:inline">acebook</span>
          </TabsTrigger>
          <TabsTrigger value="twitter" className="flex items-center gap-1 text-xs sm:text-sm py-1.5 px-2 sm:px-3">
            <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Twitter</span>
          </TabsTrigger>
          <TabsTrigger value="linkedin" className="flex items-center gap-1 text-xs sm:text-sm py-1.5 px-2 sm:px-3">
            <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">LinkedIn</span>
          </TabsTrigger>
        </TabsList>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => onExport(activeTab)}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs sm:text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground shadow hover:bg-primary/90 h-7 sm:h-9 px-2 sm:px-4 py-1 sm:py-2"
          >
            Export {activeTab === "all" ? "All" : activeTab === "facebook" ? "FB" : activeTab === "twitter" ? "Twitter" : "LinkedIn"}
          </button>
        </div>
      </div>

      <TabsContent value="all">
        <PostList posts={filteredPosts} onEditPost={onEditPost} />
      </TabsContent>

      <TabsContent value="facebook">
        <PostList posts={filteredPosts} onEditPost={onEditPost} />
      </TabsContent>

      <TabsContent value="twitter">
        <PostList posts={filteredPosts} onEditPost={onEditPost} />
      </TabsContent>

      <TabsContent value="linkedin">
        <PostList posts={filteredPosts} onEditPost={onEditPost} />
      </TabsContent>
    </Tabs>
  );
};

export default PlatformTabs;
