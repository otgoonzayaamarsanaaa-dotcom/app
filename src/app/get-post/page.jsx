"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { supabaseClient } from "@/lib/supabase-client";

export default function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [editingPostId, setEditingPostId] = useState(null);
  const [editDescription, setEditDescription] = useState("");
  const [editImage, setEditImage] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const getPostsAndUser = async () => {
    setLoading(true);
    const supabase = supabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
    }
    const response = await supabase
      .from("pets-app")
      .select("*")
      .order("created_at", { ascending: false });

    if (response.data) {
      setPosts(response.data);
    }

    setLoading(false);
  };

  useEffect(() => {
    getPostsAndUser();
  }, []);

  const handleStartEdit = (post) => {
    setEditingPostId(post.id);
    setEditDescription(post.description || "");
    setEditImage(post.imageURL || "");
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setEditImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveEdit = async (postId) => {
    if (saving) return;
    setSaving(true);

    const { error } = await supabase
      .from("pets-app")
      .update({
        description: editDescription,
        imageURL: editImage,
      })
      .eq("id", postId);

    setSaving(false);

    if (!error) {
      setEditingPostId(null);
      getPostsAndUser();
    } else {
      alert("Засахад алдаа гарлаа: " + error.message);
    }
  };

  const handleDelete = async (postId) => {
    const confirmed = window.confirm("Энэ постыг устгахдаа итгэлтэй байна уу?");
    if (!confirmed) return;

    setDeletingId(postId);
    const { error } = await supabase
      .from("pets-app")
      .delete()
      .eq("id", postId);

    setDeletingId(null);

    if (!error) {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } else {
      alert("Устгахад алдаа гарлаа: " + error.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <h1 className="text-2xl font-bold">Pet Feed</h1>
        <Button onClick={() => router.push("/create-post")} className="gap-2">
          <Plus className="w-4 h-4" /> Create Post
        </Button>
      </div>

      {loading ? (
        <p className="text-center text-sm text-gray-500">Уншиж байна...</p>
      ) : (
        <div className="grid gap-6">
          {posts.map((post) => {
            // ЭЗЭН МӨН ЭСЭХИЙГ ЧАТАЙ БААТАЛГААЖУУЛАХ
            const isOwner =
              Boolean(currentUserId) &&
              Boolean(post.userId) &&
              String(currentUserId).trim() === String(post.userId).trim();

            const isEditing = editingPostId === post.id;

            return (
              <Card key={post.id} className="overflow-hidden hover:shadow-md transition relative">
                {/* Зөвхөн Пост үүсгэсэн эзэнд харагдах товчлуур */}
                {isOwner && !isEditing && (
                  <div className="absolute top-3 right-3 z-10 flex gap-1 bg-white/95 backdrop-blur border p-1 rounded-md shadow-md">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-gray-600 hover:text-blue-600"
                      onClick={() => handleStartEdit(post)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-gray-600 hover:text-red-600"
                      onClick={() => handleDelete(post.id)}
                      disabled={deletingId === post.id}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                {isEditing ? (
                  <div className="p-4 space-y-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Editing Post</p>

                    <Input
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Update description..."
                    />

                    <Input type="file" accept="image/*" onChange={handleImageChange} />

                    {editImage && (
                      <img
                        src={editImage}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-md border"
                      />
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button onClick={() => handleSaveEdit(post.id)} disabled={saving} size="sm" className="gap-1">
                        <Check className="w-4 h-4" /> {saving ? "Saving..." : "Save"}
                      </Button>
                      <Button variant="outline" onClick={() => setEditingPostId(null)} size="sm" className="gap-1">
                        <X className="w-4 h-4" /> Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <CardHeader className="p-4 pb-2 pr-24">
                      <p className="text-sm text-gray-800">{post.description}</p>
                    </CardHeader>

                    {post.imageURL && (
                      <CardContent className="p-0 cursor-pointer" onClick={() => router.push(`/get-post/${post.id}`)}>
                        <img
                          src={post.imageURL}
                          alt="Pet Post"
                          className="w-full h-80 object-cover hover:opacity-95 transition"
                        />
                      </CardContent>
                    )}

                    <div className="p-4 pt-2">
                      <Link href={`/get-post/${post.id}`} className="text-xs text-blue-600 hover:underline font-medium">
                        View details & comments →
                      </Link>
                    </div>
                  </>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
