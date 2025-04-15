
import { useState } from "react";
import { Post } from "@/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Facebook, Linkedin, Pencil, Twitter } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ShareContent } from "./ShareContent";
import { useAuth } from "@/context/AuthContext";

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
  facebook: <Facebook className="h-4 w-4" />,
  twitter: <Twitter className="h-4 w-4" />,
  linkedin: <Linkedin className="h-4 w-4" />
};

const PostList = ({ posts, onEditPost }: PostListProps) => {
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState("");
  const { user } = useAuth();

  const handleEditClick = (post: Post) => {
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
      {posts.map((post) => (
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
            
            <div className="flex items-center gap-2">
              {user && <ShareContent post={post} />}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleEditClick(post)}
                className="flex items-center gap-1"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            </div>
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
      ))}
    </div>
  );
};

export default PostList;
