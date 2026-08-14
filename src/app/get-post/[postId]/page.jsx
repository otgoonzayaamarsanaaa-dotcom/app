"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Pencil, Trash2, X, Check } from "lucide-react";
import { supabaseClient } from "@/lib/supabase-client";
export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = supabaseClient();
  const [post, setPost] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [posting, setPosting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editDescription, setEditDescription] = useState("");
  const [editImage, setEditImage] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [savingComment, setSavingComment] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const fetchPost = async () => {
    const response = await supabase
      .from("pets-app")
      .select("id, imageURL, description, isFound, userId, created_at, petComments(id, created_at, body, userId)")
      .eq("id", params.postId)
      .single();
    if (response.data) {
      setPost(response.data);
      setEditDescription(response.data.description || "");
      setEditImage(response.data.imageURL || "");
    }
  };
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
      if (params.postId) fetchPost();
    };
    init();
  }, [params.postId]);
  const isOwner = post && currentUserId && post.userId === currentUserId;
  const handleAddComment = async () => {
    if (!commentText.trim() || posting) return;
    setPosting(true);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("petComments").insert([
      {
        body: commentText,
        postId: params.postId,
        userId: user?.id || null
      }
    ]);
    setCommentText("");
    setPosting(false);
    fetchPost();
  };
  const handleStartEditComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditCommentText(comment.body);
  };
  const handleSaveEditComment = async (commentId) => {
    if (!editCommentText.trim() || savingComment) return;
    setSavingComment(true);
    const { error } = await supabase
      .from("petComments")
      .update({ body: editCommentText })
      .eq("id", commentId);
    setSavingComment(false);
    if (!error) {
      setEditingCommentId(null);
      setEditCommentText("");
      fetchPost();
    }
  };
  const handleDeleteComment = async (commentId) => {
    const confirmed = window.confirm("Delete this comment?");
    if (!confirmed) return;
    setDeletingCommentId(commentId);
    await supabase.from("petComments").delete().eq("id", commentId);
    setDeletingCommentId(null);
    fetchPost();
  };

  const handleEditImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setEditImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveEdit = async () => {
    if (saving) return;
    setSaving(true);

    const { error } = await supabase
      .from("pets-app")
      .update({ 
        description: editDescription, 
        imageURL: editImage 
      })
      .eq("id", post.id);

    setSaving(false);

    if (!error) {
      setIsEditing(false);
      fetchPost();
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm("Delete this post? This can't be undone.");
    if (!confirmed) return;

    setDeleting(true);
    await supabase.from("pets-app").delete().eq("id", post.id);
    router.push("/get-post");
  };

  if (!post) {
    return (
      <div className="board-bg font-body min-h-screen flex items-center justify-center">
        <p className="font-mono text-xs tracking-widest uppercase" style={{ color: "var(--ink)" }}>
          Loading post…
        </p>
      </div>
    );
  }

  return (
    <div className="board-bg font-body min-h-screen p-4">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push("/get-post")}
            className="flex items-center gap-1 font-mono text-xs uppercase tracking-wide"
            style={{ color: "var(--pine)" }}
          >
            <ArrowLeft className="w-3 h-3" /> Back to board
          </button>

          {isOwner && !isEditing && (
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1 font-mono text-xs uppercase tracking-wide hover:underline"
                style={{ color: "var(--pine)" }}
              >
                <Pencil className="w-3 h-3" /> Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-1 font-mono text-xs uppercase tracking-wide hover:underline"
                style={{ color: "var(--pushpin)" }}
              >
                <Trash2 className="w-3 h-3" /> {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          )}
        </div>

        <Card className="flyer-card border-0 rounded-sm overflow-hidden" style={{ transform: "rotate(-0.3deg)" }}>
          <div className="pushpin" />
          {!isEditing && (
            <span
              className="badge-tag absolute top-3 right-3 z-10"
              style={{
                backgroundColor: post.isFound ? "var(--pine)" : "var(--pushpin)",
                color: "#fff"
              }}
            >
              {post.isFound ? "Found" : "Missing"}
            </span>
          )}

          {isEditing ? (
            <CardContent className="p-4 space-y-3 pt-8">
              <span className="font-mono text-[10px] tracking-[0.3em] uppercase" style={{ color: "var(--pine)" }}>
                Editing flyer
              </span>
              
              <Input
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSaveEdit();
                  }
                }}
                placeholder="Describe your pet or sighting…"
                className="rounded-sm border-[var(--line)] font-body"
              />

              <Input
                type="file"
                accept="image/*"
                onChange={handleEditImage}
                className="rounded-sm border-[var(--line)] font-body"
              />

              {editImage && (
                <img
                  src={editImage}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-sm border"
                  style={{ borderColor: "var(--line)" }}
                />
              )}

              <div className="flex gap-2 pt-1">
                <Button
                  onClick={handleSaveEdit}
                  disabled={saving}
                  className="gap-1 rounded-sm font-body font-medium"
                  style={{ backgroundColor: "var(--pine)" }}
                >
                  <Check className="w-4 h-4" /> {saving ? "Saving…" : "Save changes"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setEditDescription(post.description || "");
                    setEditImage(post.imageURL || "");
                  }}
                  className="gap-1 rounded-sm font-body"
                  style={{ borderColor: "var(--line)" }}
                >
                  <X className="w-4 h-4" /> Cancel
                </Button>
              </div>
            </CardContent>
          ) : (
            <>
              {post.imageURL && <img src={post.imageURL} alt="Pet" className="w-full h-96 object-cover" />}
              <CardContent className="p-4 space-y-2">
                <p className="font-display text-lg" style={{ color: "var(--ink)" }}>
                  {post.description}
                </p>
                <p className="font-mono text-[10px] uppercase tracking-wide" style={{ color: "var(--pine)" }}>
                  Posted {new Date(post.created_at).toLocaleDateString()}
                </p>
              </CardContent>
            </>
          )}
        </Card>
        <div className="space-y-4">
          <h3 className="font-display text-xl" style={{ color: "var(--ink)" }}>
            Comments
          </h3>

          <div className="flex gap-2">
            <Input
              placeholder="Write a comment…"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddComment();
                }
              }}
              className="rounded-sm border-[var(--line)] font-body"
            />
            <Button
              onClick={handleAddComment}
              disabled={posting}
              className="rounded-sm font-body"
              style={{ backgroundColor: "var(--pine)" }}
            >
              {posting ? "Posting…" : "Post"}
            </Button>
          </div>

          <div className="space-y-2">
            {post.petComments?.length ? (
              post.petComments.map((comment) => {
                const isCommentOwner = currentUserId && comment.userId === currentUserId;
                const isEditingThis = editingCommentId === comment.id;

                return (
                  <div
                    key={comment.id}
                    className="p-3 rounded-sm text-sm border space-y-2"
                    style={{ backgroundColor: "#fff", borderColor: "var(--line)" }}
                  >
                    {isEditingThis ? (
                      <div className="space-y-2">
                        <Input
                          value={editCommentText}
                          onChange={(e) => setEditCommentText(e.target.value)}
                          className="rounded-sm border-[var(--line)] font-body text-sm"
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleSaveEditComment(comment.id)}
                            disabled={savingComment}
                            size="sm"
                            className="rounded-sm h-7 text-xs font-body"
                            style={{ backgroundColor: "var(--pine)" }}
                          >
                            {savingComment ? "Saving…" : "Save"}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setEditingCommentId(null)}
                            size="sm"
                            className="rounded-sm h-7 text-xs font-body"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-body" style={{ color: "var(--ink)" }}>
                            {comment.body}
                          </p>
                          {isCommentOwner && (
                            <div className="flex gap-2 shrink-0">
                              <button
                                onClick={() => handleStartEditComment(comment)}
                                className="hover:underline font-mono text-[10px] uppercase"
                                style={{ color: "var(--pine)" }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                disabled={deletingCommentId === comment.id}
                                className="hover:underline font-mono text-[10px] uppercase"
                                style={{ color: "var(--pushpin)" }}
                              >
                                {deletingCommentId === comment.id ? "…" : "Delete"}
                              </button>
                            </div>
                          )}
                        </div>

                        <span className="font-mono text-[10px]" style={{ color: "var(--pine)" }}>
                          {new Date(comment.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="font-mono text-xs uppercase tracking-wide" style={{ color: "var(--pine)" }}>
                No comments yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}