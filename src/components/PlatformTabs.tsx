
import { useState } from "react";
import { PostPlan } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PostList from "./PostList";
import { Facebook, Linkedin, Twitter } from "lucide-react";

interface PlatformTabsProps {
  posts: PostPlan;
  onEditPost: (postId: string, newContent: string) => void;
  onExport: (platform: 'facebook' | 'twitter' | 'linkedin' | 'all') => void;
}

const PlatformTabs = ({ posts, onEditPost, onExport }: PlatformTabsProps) => {
  const [activeTab, setActiveTab] = useState<'all' | 'facebook' | 'twitter' | 'linkedin'>("all");

  const filteredPosts = activeTab === "all"
    ? posts
    : posts.filter(post => post.platform === activeTab);

  return (
    <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mb-4">
        <div className="overflow-x-auto pb-2 -mx-2 px-2">
          <TabsList className="h-auto p-1 w-max sm:w-auto">
          <TabsTrigger value="all" className="flex items-center gap-1 text-xs sm:text-sm py-1.5 px-2 sm:px-3">
            All
          </TabsTrigger>
          <TabsTrigger value="facebook" className="flex items-center gap-1 text-xs sm:text-sm py-1.5 px-2 sm:px-3">
            <Facebook className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">FB</span>
            <span className="hidden sm:inline">acebook</span>
          </TabsTrigger>
          <TabsTrigger value="twitter" className="flex items-center gap-1 text-xs sm:text-sm py-1.5 px-2 sm:px-3">
            <Twitter className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Twitter</span>
          </TabsTrigger>
          <TabsTrigger value="linkedin" className="flex items-center gap-1 text-xs sm:text-sm py-1.5 px-2 sm:px-3">
            <Linkedin className="h-3 w-3 sm:h-4 sm:w-4" />
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
