import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Eye, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface PendingRecord {
  id: string;
  title: string;
  description: string;
  created_at: string;
  media_url: string | null;
  evidence_url: string | null;
  user_id: string;
  profile: {
    full_name: string | null;
    email: string;
  } | null;
  category: {
    name: string;
  } | null;
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const [pendingRecords, setPendingRecords] = useState<PendingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingRecords();
  }, []);

  const fetchPendingRecords = async () => {
    try {
      const { data, error } = await supabase
        .from("records")
        .select(`
          id,
          title,
          description,
          created_at,
          media_url,
          evidence_url,
          user_id,
          profile:profiles!records_user_id_fkey(full_name, email),
          category:categories(name)
        `)
        .eq("status", "pending")
        .order("created_at", { ascending: true });

      if (error) throw error;
      setPendingRecords((data as unknown as PendingRecord[]) || []);
    } catch (err) {
      console.error("Error fetching pending records:", err);
      toast.error("Failed to load pending records");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (recordId: string) => {
    if (!user) return;
    setActionLoading(recordId);

    try {
      const { error } = await supabase
        .from("records")
        .update({
          status: "verified",
          verified_at: new Date().toISOString(),
          verified_by: user.id,
        })
        .eq("id", recordId);

      if (error) throw error;

      toast.success("Record approved successfully");
      setPendingRecords((prev) => prev.filter((r) => r.id !== recordId));
    } catch (err) {
      console.error("Error approving record:", err);
      toast.error("Failed to approve record");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (recordId: string) => {
    if (!user) return;
    setActionLoading(recordId);

    try {
      const { error } = await supabase
        .from("records")
        .update({
          status: "rejected",
          verified_at: new Date().toISOString(),
          verified_by: user.id,
        })
        .eq("id", recordId);

      if (error) throw error;

      toast.success("Record rejected");
      setPendingRecords((prev) => prev.filter((r) => r.id !== recordId));
    } catch (err) {
      console.error("Error rejecting record:", err);
      toast.error("Failed to reject record");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Review and moderate pending record submissions
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-2xl font-bold text-gold">{pendingRecords.length}</div>
            <div className="text-sm text-muted-foreground">Pending Reviews</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-2xl font-bold text-green-500">—</div>
            <div className="text-sm text-muted-foreground">Approved Today</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-2xl font-bold text-destructive">—</div>
            <div className="text-sm text-muted-foreground">Rejected Today</div>
          </div>
        </div>

        {/* Pending Records Table */}
        <div className="bg-card border border-border rounded-lg">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-semibold">Pending Records</h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gold" />
            </div>
          ) : pendingRecords.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-muted-foreground">
                All caught up! No pending records to review.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Submitter</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Evidence</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div className="max-w-xs">
                        <div className="font-medium truncate">{record.title}</div>
                        <div className="text-sm text-muted-foreground truncate">
                          {record.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {record.profile?.full_name || "Unknown"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {record.profile?.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {record.category?.name || "Uncategorized"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(record.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      {(record.media_url || record.evidence_url) ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <a
                            href={record.evidence_url || record.media_url || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </a>
                        </Button>
                      ) : (
                        <span className="text-muted-foreground text-sm">None</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(record.id)}
                          disabled={actionLoading === record.id}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {actionLoading === record.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(record.id)}
                          disabled={actionLoading === record.id}
                        >
                          {actionLoading === record.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </>
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
