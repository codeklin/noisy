
import { useState } from "react";
import { format } from "date-fns";
import { Post } from "@/types";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Facebook, Linkedin, Twitter, Edit, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PostListProps {
  posts: Post[];
  onEditPost: (postId: string, newContent: string) => void;
}

const PostList = ({ posts, onEditPost }: PostListProps) => {
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState<string>("");

  const handleEditClick = (post: Post) => {
    setEditingPostId(post.id);
    setEditedContent(post.content);
  };

  const handleSaveClick = (postId: string) => {
    onEditPost(postId, editedContent);
    setEditingPostId(null);
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "facebook":
        return <Facebook className="h-5 w-5 text-blue-600" />;
      case "twitter":
        return <Twitter className="h-5 w-5 text-sky-400" />;
      case "linkedin":
        return <Linkedin className="h-5 w-5 text-blue-800" />;
      default:
        return null;
    }
  };

  const getPlatformClass = (platform: string) => {
    switch (platform) {
      case "facebook":
        return "card-facebook";
      case "twitter":
        return "card-twitter";
      case "linkedin":
        return "card-linkedin";
      default:
        return "";
    }
  };

  if (posts.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">No posts found for this platform.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      {posts.map((post) => (
        <Card 
          key={post.id} 
          className={`post-card ${getPlatformClass(post.platform)}`}
        >
          <CardHeader className="p-4 pb-2 flex flex-row justify-between items-start">
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                {getPlatformIcon(post.platform)}
                <span className="font-medium capitalize">
                  {post.platform}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                {format(new Date(post.date), "MMMM d, yyyy")}
              </span>
            </div>
            
            {editingPostId === post.id ? (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleSaveClick(post.id)}
                className="h-8 px-2"
              >
                <Save className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleEditClick(post)}
                className="h-8 px-2"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </CardHeader>
          
          <CardContent className="p-4 pt-2">
            {editingPostId === post.id ? (
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="min-h-[100px]"
              />
            ) : (
              <div className="text-sm whitespace-pre-wrap">
                {post.content}
              </div>
            )}
          </CardContent>
          
          <CardFooter className="p-4 pt-0 flex flex-wrap gap-1">
            {post.hashtags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default PostList;
