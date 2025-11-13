import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { BackButton } from "@/components/BackButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Trophy, Upload } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

export default function CreateBreakRecord() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("create");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create New Record Form State
  const [createForm, setCreateForm] = useState({
    title: "",
    category: "",
    description: "",
    achievement: "",
    proofUrl: "",
  });

  // Break Existing Record Form State
  const [breakForm, setBreakForm] = useState({
    recordSearch: "",
    selectedRecord: "",
    achievement: "",
    proofUrl: "",
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // TODO: Implement actual submission logic
      toast({
        title: "Record Created!",
        description: "Your record has been submitted for verification.",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create record. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBreakSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // TODO: Implement actual submission logic
      toast({
        title: "Challenge Submitted!",
        description: "Your break attempt has been submitted for verification.",
      });
      navigate("/pending-challenges");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit challenge. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container py-8 max-w-4xl">
        <BackButton />
        <BackButton />
        <BackButton to="/" />
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Create or Break a Record</h1>
          <p className="text-muted-foreground">
            Set a new record or challenge an existing one
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create" className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Create New Record
            </TabsTrigger>
            <TabsTrigger value="break" className="gap-2">
              <Trophy className="h-4 w-4" />
              Break Existing Record
            </TabsTrigger>
          </TabsList>

          {/* Create New Record Tab */}
          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle>Create a New World Record</CardTitle>
                <CardDescription>
                  Submit your achievement and be the first to set this record
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="create-title">Record Title *</Label>
                    <Input
                      id="create-title"
                      placeholder="e.g., Most Push-ups in 1 Minute"
                      value={createForm.title}
                      onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                      maxLength={200}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      {createForm.title.length}/200 characters
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="create-category">Category *</Label>
                    <Select
                      value={createForm.category}
                      onValueChange={(value) => setCreateForm({ ...createForm, category: value })}
                    >
                      <SelectTrigger id="create-category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sports">Sports & Athletics</SelectItem>
                        <SelectItem value="academic">Academic Excellence</SelectItem>
                        <SelectItem value="creative">Creative Arts</SelectItem>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="create-achievement">Your Achievement *</Label>
                    <Input
                      id="create-achievement"
                      placeholder="e.g., 75 push-ups"
                      value={createForm.achievement}
                      onChange={(e) => setCreateForm({ ...createForm, achievement: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="create-description">Description *</Label>
                    <Textarea
                      id="create-description"
                      placeholder="Describe your achievement, the conditions, and any relevant details..."
                      value={createForm.description}
                      onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                      maxLength={5000}
                      rows={5}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      {createForm.description.length}/5000 characters
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="create-proof">Google Drive Proof URL *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="create-proof"
                        placeholder="https://drive.google.com/..."
                        value={createForm.proofUrl}
                        onChange={(e) => setCreateForm({ ...createForm, proofUrl: e.target.value })}
                        required
                      />
                      <Button type="button" variant="outline" size="icon">
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Upload video/photo proof to Google Drive and paste the shareable link
                    </p>
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit New Record"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Break Existing Record Tab */}
          <TabsContent value="break">
            <Card>
              <CardHeader>
                <CardTitle>Break an Existing Record</CardTitle>
                <CardDescription>
                  Challenge a current record holder with your achievement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBreakSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="break-search">Search for Record *</Label>
                    <Input
                      id="break-search"
                      placeholder="Search by title or category..."
                      value={breakForm.recordSearch}
                      onChange={(e) => setBreakForm({ ...breakForm, recordSearch: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="break-select">Select Record *</Label>
                    <Select
                      value={breakForm.selectedRecord}
                      onValueChange={(value) => setBreakForm({ ...breakForm, selectedRecord: value })}
                    >
                      <SelectTrigger id="break-select">
                        <SelectValue placeholder="Choose a record to break" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="record1">Most Push-ups in 1 Minute (75)</SelectItem>
                        <SelectItem value="record2">Longest Plank Hold (10 min)</SelectItem>
                        <SelectItem value="record3">Most Books Read in a Month (25)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {breakForm.selectedRecord && (
                    <Card className="bg-secondary border-primary">
                      <CardContent className="pt-6">
                        <p className="font-semibold mb-2">Current Record</p>
                        <p className="text-sm text-muted-foreground mb-1">
                          Most Push-ups in 1 Minute
                        </p>
                        <p className="text-2xl font-bold text-primary">75 push-ups</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Held by John Doe • Verified on Jan 15, 2025
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="break-achievement">Your Achievement *</Label>
                    <Input
                      id="break-achievement"
                      placeholder="e.g., 82 push-ups"
                      value={breakForm.achievement}
                      onChange={(e) => setBreakForm({ ...breakForm, achievement: e.target.value })}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Must exceed the current record to qualify
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="break-proof">Google Drive Proof URL *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="break-proof"
                        placeholder="https://drive.google.com/..."
                        value={breakForm.proofUrl}
                        onChange={(e) => setBreakForm({ ...breakForm, proofUrl: e.target.value })}
                        required
                      />
                      <Button type="button" variant="outline" size="icon">
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Upload video/photo proof to Google Drive and paste the shareable link
                    </p>
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Break Attempt"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
