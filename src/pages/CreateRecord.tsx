import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { createRecordSchema, CreateRecordFormData } from '@/schemas/validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Category {
  id: string;
  name: string;
}

export default function CreateRecord() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const form = useForm<CreateRecordFormData>({
    resolver: zodResolver(createRecordSchema),
    defaultValues: {
      title: '',
      description: '',
      categoryId: '',
    },
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const uploadFiles = async (files: File[], bucket: string): Promise<string[]> => {
    if (!user) return [];

    const uploadPromises = files.map(async (file, index) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${index}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      return publicUrl;
    });

    const results = await Promise.all(uploadPromises);
    return results.filter((url): url is string => url !== null);
  };

  const onSubmit = async (data: CreateRecordFormData) => {
    if (!user) {
      toast.error('You must be logged in to create a record');
      return;
    }

    try {
      // Upload media files if any
      let mediaUrl = null;
      if (data.mediaFiles && data.mediaFiles.length > 0) {
        const urls = await uploadFiles(data.mediaFiles, 'record-media');
        mediaUrl = urls[0]; // Store first media URL
      }

      // Upload evidence files if any
      let evidenceUrl = null;
      if (data.evidenceFiles && data.evidenceFiles.length > 0) {
        const urls = await uploadFiles(data.evidenceFiles, 'evidence');
        evidenceUrl = urls[0]; // Store first evidence URL
      }

      // Create the record
      const { error } = await supabase
        .from('records')
        .insert({
          title: data.title,
          description: data.description,
          category_id: data.categoryId,
          user_id: user.id,
          media_url: mediaUrl,
          evidence_url: evidenceUrl,
          status: 'pending',
        });

      if (error) {
        // Handle rate limit errors gracefully
        if (error.message.includes('rate limit') || error.message.includes('limit reached')) {
          toast.error(error.message);
          return;
        }
        throw error;
      }

      toast.success('Record submitted successfully! It will be reviewed by our team.');
      navigate('/');
    } catch (error) {
      console.error('Record creation error:', error);
      toast.error('Failed to create record');
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
            <CardTitle className="text-3xl font-bold">Submit a New Record</CardTitle>
            <CardDescription>
              Share your achievement with the world
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Record Title</FormLabel>
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
                      <FormLabel>Category</FormLabel>
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
                      <FormLabel>Description</FormLabel>
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
                  name="mediaFiles"
                  render={({ field: { value, onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel>Media (Photos/Videos)</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
                          multiple
                          onChange={(e) => onChange(Array.from(e.target.files || []))}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Upload photos or videos of your record (max 50MB each)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="evidenceFiles"
                  render={({ field: { value, onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel>Evidence Documents</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,application/pdf"
                          multiple
                          onChange={(e) => onChange(Array.from(e.target.files || []))}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Upload supporting evidence like certificates, official documents (max 10MB each)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="w-full"
                >
                  {form.formState.isSubmitting ? 'Submitting...' : 'Submit Record'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
