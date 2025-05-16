
import { useState } from "react";
import { Post } from "@/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Share2, MessageCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PostActions } from "./PostActions";
import { toast } from "sonner";

interface PostListProps {
  posts: Post[];
  onEditPost: (postId: string, newContent: string) => void;
}

const platformColors = {
  facebook: "bg-blue-100 text-blue-800 border-blue-200",
  twitter: "bg-blue-50 text-blue-500 border-blue-100",
  linkedin: "bg-blue-200 text-blue-900 border-blue-300"
};

const platformIcons = {
  facebook: <MessageSquare className="h-4 w-4" />,
  twitter: <Share2 className="h-4 w-4" />,
  linkedin: <MessageCircle className="h-4 w-4" />
};

const PostList = ({ posts, onEditPost }: PostListProps) => {
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState("");

  // Validate posts data
  if (!Array.isArray(posts)) {
    console.error("PostList: posts is not an array", posts);
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
        <p className="text-gray-600 mb-4">No content found for this platform.</p>
      </div>
    );
  }

  const handleEditClick = (post: Post) => {
    if (!post || !post.id || !post.content) {
      console.error("Cannot edit post: Invalid post data", post);
      toast.error("Cannot edit this post due to invalid data");
      return;
    }
    setEditingPostId(post.id);
    setEditedContent(post.content);
  };

  const handleSaveEdit = (postId: string) => {
    onEditPost(postId, editedContent);
    setEditingPostId(null);
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setEditedContent("");
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      {posts.map((post) => {
        // Skip rendering invalid posts
        if (!post || !post.id || !post.platform) {
          console.error("Invalid post data:", post);
          return null;
        }

        return (
        <Card key={post.id} className="overflow-hidden">
          <CardHeader className="bg-gray-50 py-3 px-4 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge
                className={`flex items-center gap-1 ${platformColors[post.platform]}`}
                variant="outline"
              >
                {platformIcons[post.platform]}
                <span className="capitalize">{post.platform}</span>
              </Badge>
              <Badge variant="outline" className="text-gray-500">
                {post.date}
              </Badge>
            </div>

            <PostActions
              post={post}
              onEdit={() => handleEditClick(post)}
              onSave={(name) => {
                toast.success(`Content saved as "${name}"`, {
                  closeButton: true,
                  duration: 5000
                });
                // In a real app, this would save to a database
              }}
            />
          </CardHeader>

          <CardContent className="p-4">
            {editingPostId === post.id ? (
              <div className="space-y-4">
                <Textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  rows={5}
                  className="w-full"
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={() => handleSaveEdit(post.id)}>
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <p className="whitespace-pre-wrap">{post.content}</p>
                {post.hashtags && post.hashtags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {post.hashtags.map((tag, i) => (
                      <Badge key={i} variant="secondary">#{tag}</Badge>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        );
      })}
    </div>
  );
};

export default PostList;
