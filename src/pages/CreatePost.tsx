import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Image, X, Loader2 } from "lucide-react";
import { usePosts } from "@/hooks/usePosts";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const CreatePost = () => {
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { createPost } = usePosts();
  const { user, profile } = useAuth();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be under 5MB");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() && !imageFile) {
      toast.error("Add some content to your post");
      return;
    }

    setUploading(true);
    let imageUrl: string | undefined;

    try {
      if (imageFile) {
        const ext = imageFile.name.split(".").pop();
        const path = `${user!.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("media")
          .upload(path, imageFile);
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from("media").getPublicUrl(path);
        imageUrl = urlData.publicUrl;
      }

      await createPost.mutateAsync({
        content: content.trim(),
        imageUrl,
        postType: imageFile ? "photo" : "text",
      });

      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Failed to create post");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border safe-top">
        <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-base font-bold text-foreground">Create Post</h1>
          <button
            onClick={handleSubmit}
            disabled={uploading || (!content.trim() && !imageFile)}
            className="px-4 py-1.5 rounded-full knp-gradient-bg text-primary-foreground text-sm font-semibold disabled:opacity-50"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post"}
          </button>
        </div>
      </header>

      <main className="pt-14 pb-6 max-w-lg mx-auto px-4">
        <div className="flex gap-3 pt-4">
          <div className="w-10 h-10 rounded-full knp-gradient-bg flex items-center justify-center text-sm font-bold text-primary-foreground shrink-0">
            {profile?.full_name?.charAt(0) || "U"}
          </div>
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's happening at KNP? 🎓"
              className="w-full min-h-[120px] bg-transparent text-foreground placeholder:text-muted-foreground text-sm resize-none focus:outline-none"
              autoFocus
            />

            {imagePreview && (
              <div className="relative mt-2 rounded-xl overflow-hidden">
                <img src={imagePreview} alt="Preview" className="w-full max-h-64 object-cover rounded-xl" />
                <button
                  onClick={() => { setImageFile(null); setImagePreview(null); }}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-border mt-4 pt-4 flex gap-4">
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
          <button onClick={() => fileRef.current?.click()} className="flex items-center gap-2 text-primary text-sm font-medium">
            <Image className="w-5 h-5" />
            Photo
          </button>
        </div>
      </main>
    </div>
  );
};

export default CreatePost;
