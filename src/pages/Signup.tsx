import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { signupSchema, SignupFormData } from '@/schemas/validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export default function Signup() {
  const { signup, user } = useAuth();
  const navigate = useNavigate();
  const [verificationMethod, setVerificationMethod] = useState<'school_email' | 'id_card'>('school_email');

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      verificationMethod: 'school_email',
    },
  });

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const uploadIdCard = async (file: File, userId: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/id-card.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('id-cards')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('id-cards')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('ID card upload error:', error);
      return null;
    }
  };

  const onSubmit = async (data: SignupFormData) => {
    const { error } = await signup(data.email, data.password, data.fullName);
    
    if (error) {
      if (error.message.includes('already registered')) {
        toast.error('This email is already registered. Please login instead.');
      } else {
        toast.error(error.message);
      }
      return;
    }

    // If ID card verification, upload the file
    if (data.verificationMethod === 'id_card' && data.idCard) {
      const { data: { user: newUser } } = await supabase.auth.getUser();
      if (newUser) {
        const idCardUrl = await uploadIdCard(data.idCard, newUser.id);
        if (idCardUrl) {
          await supabase.from('profiles').update({ id_card_url: idCardUrl }).eq('id', newUser.id);
        }
      }
    }

    // If school email verification, store it
    if (data.verificationMethod === 'school_email' && data.schoolEmail) {
      const { data: { user: newUser } } = await supabase.auth.getUser();
      if (newUser) {
        await supabase.from('profiles').update({ school_email: data.schoolEmail }).eq('id', newUser.id);
      }
    }

    toast.success('Account created successfully! Please check your email to verify your account.');
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <CardDescription>
            Join the Student Book of World Records
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Create a strong password" {...field} />
                    </FormControl>
                    <FormDescription className="text-xs">
                      At least 8 characters with uppercase, lowercase, and numbers
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="verificationMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verification Method</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) => {
                          field.onChange(value);
                          setVerificationMethod(value as 'school_email' | 'id_card');
                        }}
                        defaultValue={field.value}
                        className="space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="school_email" id="school_email" />
                          <Label htmlFor="school_email" className="font-normal cursor-pointer">
                            School Email Verification
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="id_card" id="id_card" />
                          <Label htmlFor="id_card" className="font-normal cursor-pointer">
                            Student ID Card Upload
                          </Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {verificationMethod === 'school_email' && (
                <FormField
                  control={form.control}
                  name="schoolEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>School Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="student@university.edu" {...field} />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Must be from an educational institution (.edu, .ac.uk, etc.)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {verificationMethod === 'id_card' && (
                <FormField
                  control={form.control}
                  name="idCard"
                  render={({ field: { value, onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel>Student ID Card</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={(e) => onChange(e.target.files?.[0])}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Upload a clear photo of your student ID (max 10MB)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? 'Creating account...' : 'Create Account'}
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Login
                </Link>
              </p>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
