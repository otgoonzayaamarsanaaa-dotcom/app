"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabaseClient } from "@/lib/supabase-client";

export default function CreatePostPage() {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const addPost = async () => {
    const DB = supabaseClient();
    if (!description && !image) return;
    const { data: { user } } = await DB.auth.getUser();

    await DB.from("pets-app").insert([
      {
        description,
        imageURL: image,
        isFound: false,
        userId: user?.id || null
      }
    ]);

    router.push("/get-post");
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Create New Post</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="What's happening with your pet?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Input type="file" accept="image/*" onChange={handleImage} />
          {image && (
            <img src={image} alt="Preview" className="w-full h-48 object-cover rounded-md" />
          )}
          <Button onClick={addPost} className="w-full">
            Publish Post
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 
