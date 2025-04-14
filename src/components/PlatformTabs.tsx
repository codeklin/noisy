
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
  const [activeTab, setActiveTab] = useState<string>("all");

  const filteredPosts = activeTab === "all" 
    ? posts 
    : posts.filter(post => post.platform === activeTab);

  return (
    <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
        <TabsList>
          <TabsTrigger value="all" className="flex items-center gap-1">
            All
          </TabsTrigger>
          <TabsTrigger value="facebook" className="flex items-center gap-1">
            <Facebook className="h-4 w-4" />
            <span className="hidden sm:inline">Facebook</span>
          </TabsTrigger>
          <TabsTrigger value="twitter" className="flex items-center gap-1">
            <Twitter className="h-4 w-4" />
            <span className="hidden sm:inline">Twitter</span>
          </TabsTrigger>
          <TabsTrigger value="linkedin" className="flex items-center gap-1">
            <Linkedin className="h-4 w-4" />
            <span className="hidden sm:inline">LinkedIn</span>
          </TabsTrigger>
        </TabsList>
        
        <div className="flex space-x-2">
          <button
            onClick={() => onExport(activeTab as any)}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
          >
            Export {activeTab === "all" ? "All" : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
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
