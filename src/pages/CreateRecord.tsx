import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Upload, Loader2 } from "lucide-react";

// Validation schema for the form
const createRecordSchema = z.object({
  studentName: z.string().min(2, "Student name must be at least 2 characters").max(100),
  recordTitle: z.string().min(10, "Title must be at least 10 characters").max(200),
  description: z.string().min(50, "Description must be at least 50 characters").max(5000),
  categoryId: z.string().min(1, "Please select a category"),
  schoolName: z.string().min(2, "School name must be at least 2 characters").max(200),
  proofFile: z.instanceof(File, { message: "Please upload a proof image" }),
});

type CreateRecordFormData = z.infer<typeof createRecordSchema>;

interface Category {
  id: string;
  name: string;
}

export default function CreateRecord() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<CreateRecordFormData>({
    resolver: zodResolver(createRecordSchema),
    defaultValues: {
      studentName: profile?.full_name || "",
      recordTitle: "",
      description: "",
      categoryId: "",
      schoolName: profile?.school || "",
    },
  });

  useEffect(() => {
    loadCategories();
  }, []);

  // Pre-fill form when profile loads
  useEffect(() => {
    if (profile?.full_name) {
      form.setValue("studentName", profile.full_name);
    }
    if (profile?.school) {
      form.setValue("schoolName", profile.school);
    }
  }, [profile, form]);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .order("name");

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error loading categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const uploadProofFile = async (file: File): Promise<string | null> => {
    if (!user) return null;

    // Step A: Rename file with timestamp to prevent duplicates
    const fileExt = file.name.split(".").pop();
    const timestamp = Date.now();
    const fileName = `${user.id}/${timestamp}_${file.name}`;

    setUploading(true);
    try {
      // Upload to record-proofs bucket
      const { error: uploadError } = await supabase.storage
        .from("record-proofs")
        .upload(fileName, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from("record-proofs")
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error("File upload failed:", error);
      toast.error("Failed to upload proof file");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: CreateRecordFormData) => {
    if (!user) {
      toast.error("You must be logged in to submit a record");
      return;
    }

    try {
      // Step A: Upload file and get public URL
      const proofImageUrl = await uploadProofFile(data.proofFile);
      
      if (!proofImageUrl) {
        toast.error("Failed to upload proof image. Please try again.");
        return;
      }

      // Step B: Insert into records table
      const { error } = await supabase.from("records").insert({
        student_name: data.studentName,
        title: data.recordTitle,
        description: data.description,
        category_id: data.categoryId,
        school_name: data.schoolName,
        media_url: proofImageUrl, // Store proof URL in media_url
        user_id: user.id, // Automatically set to logged-in user's ID
        status: "pending",
      });

      if (error) {
        if (error.message.includes("rate limit") || error.message.includes("limit reached")) {
          toast.error(error.message);
          return;
        }
        throw error;
      }

      // Step C: Show success message and clear form
      toast.success("Record submitted for approval!");
      form.reset();
      setSelectedFile(null);
      navigate("/");
    } catch (error) {
      console.error("Record creation error:", error);
      toast.error("Failed to submit record. Please try again.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      form.setValue("proofFile", file);
      form.clearErrors("proofFile");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container max-w-2xl mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold">
              Submit a New Record
            </CardTitle>
            <CardDescription>
              Share your achievement with the world. All submissions are reviewed before approval.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="studentName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Student Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="recordTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Record Title *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Fastest 100m sprint in university history"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Be specific and descriptive (10-200 characters)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your record achievement in detail..."
                          className="min-h-[150px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Provide detailed information about how you achieved this record (50-5000 characters)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="schoolName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>School Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Your school or university name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="proofFile"
                  render={({ field: { value, onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel>Proof Image *</FormLabel>
                      <FormControl>
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-4">
                            <Input
                              type="file"
                              accept="image/jpeg,image/png,image/webp,image/gif"
                              onChange={handleFileChange}
                              className="flex-1"
                              {...field}
                            />
                          </div>
                          {selectedFile && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Upload className="h-4 w-4" />
                              <span>{selectedFile.name}</span>
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormDescription>
                        Upload an image as proof of your achievement (JPEG, PNG, WebP, or GIF)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting || uploading}
                  className="w-full"
                >
                  {form.formState.isSubmitting || uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {uploading ? "Uploading..." : "Submitting..."}
                    </>
                  ) : (
                    "Submit Record"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}