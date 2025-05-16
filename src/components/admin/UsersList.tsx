import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Search, UserCheck, UserX, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AuthData {
  id: string;
  last_sign_in_at: string | null;
}

// We're using 'any' type for profiles, so we don't need this interface anymore

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  is_subscribed: boolean;
  has_used_generator_demo: boolean;
  has_used_viral_generator_demo: boolean;
  is_admin: boolean;
}

const UsersList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Fetch user profiles from the profiles table
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, is_subscribed, has_used_generator_demo, has_used_viral_generator_demo, is_admin, created_at");

      if (profilesError) {
        throw profilesError;
      }

      // Since the RPC functions don't exist, we'll create empty auth data
      // In a real implementation, we would fetch this data from the auth service
      let authData: AuthData[] = [];

      console.log("RPC functions for auth data are not available, using profile data only");

      // Create a map of user IDs to auth data for quick lookup
      const authDataMap = (authData || []).reduce((map: Record<string, AuthData>, user: AuthData) => {
        map[user.id] = user;
        return map;
      }, {} as Record<string, AuthData>);

      // Format the user data
      const combinedUsers = (profiles || []).map((profile: any) => {
        const authUser = authDataMap[profile.id];
        return {
          id: profile.id,
          email: profile.email || "No email",
          created_at: profile.created_at
            ? new Date(profile.created_at).toLocaleString()
            : new Date().toLocaleString(),
          // Get last_sign_in_at from auth data
          last_sign_in_at: authUser?.last_sign_in_at
            ? new Date(authUser.last_sign_in_at).toLocaleString()
            : null,
          is_subscribed: profile.is_subscribed || false,
          has_used_generator_demo: profile.has_used_generator_demo || false,
          has_used_viral_generator_demo: profile.has_used_viral_generator_demo || false,
          is_admin: profile.is_admin || false,
        };
      });

      setUsers(combinedUsers);
      setFilteredUsers(combinedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = users.filter(
        (user) => user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const toggleUserSubscription = async (userId: string, isCurrentlySubscribed: boolean) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_subscribed: !isCurrentlySubscribed })
        .eq("id", userId);

      if (error) {
        throw error;
      }

      // Update local state
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId
            ? { ...user, is_subscribed: !isCurrentlySubscribed }
            : user
        )
      );

      toast.success(`User subscription ${isCurrentlySubscribed ? "removed" : "added"}`);
    } catch (error) {
      console.error("Error updating user subscription:", error);
      toast.error("Failed to update user subscription");
    }
  };

  const toggleAdminStatus = async (userId: string, isCurrentlyAdmin: boolean) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_admin: !isCurrentlyAdmin })
        .eq("id", userId);

      if (error) {
        throw error;
      }

      // Update local state
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId
            ? { ...user, is_admin: !isCurrentlyAdmin }
            : user
        )
      );

      toast.success(`Admin status ${isCurrentlyAdmin ? "removed" : "granted"}`);
    } catch (error) {
      console.error("Error updating admin status:", error);
      toast.error("Failed to update admin status");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users</CardTitle>
        <CardDescription>
          Manage user accounts and subscription status
        </CardDescription>
        <div className="flex items-center gap-2 mt-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by email..."
              className="pl-8"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={fetchUsers}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Sign In</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Demo Usage</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center">
                      <RefreshCw className="h-8 w-8 animate-spin text-primary mb-2" />
                      <p>Loading users...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{user.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>{user.created_at}</TableCell>
                    <TableCell>
                      {user.last_sign_in_at ? (
                        <span className="text-green-600">{user.last_sign_in_at}</span>
                      ) : (
                        <span className="text-gray-500">Never signed in</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {user.is_subscribed ? (
                          <Badge variant="default" className="bg-green-500">Paid</Badge>
                        ) : (
                          <Badge variant="outline">Free</Badge>
                        )}
                        {user.is_admin && (
                          <Badge variant="default" className="bg-blue-500">Admin</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-xs">
                        <span>
                          Generator: {user.has_used_generator_demo ? "Used" : "Not Used"}
                        </span>
                        <span>
                          Viral: {user.has_used_viral_generator_demo ? "Used" : "Not Used"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant={user.is_subscribed ? "destructive" : "default"}
                          size="sm"
                          onClick={() => toggleUserSubscription(user.id, user.is_subscribed)}
                          className="h-8 px-2"
                        >
                          {user.is_subscribed ? (
                            <>
                              <UserX className="h-4 w-4 mr-1" />
                              <span className="hidden sm:inline">Remove Sub</span>
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-4 w-4 mr-1" />
                              <span className="hidden sm:inline">Add Sub</span>
                            </>
                          )}
                        </Button>
                        <Button
                          variant={user.is_admin ? "destructive" : "outline"}
                          size="sm"
                          onClick={() => toggleAdminStatus(user.id, user.is_admin)}
                          className="h-8 px-2"
                        >
                          {user.is_admin ? "Remove Admin" : "Make Admin"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default UsersList;
