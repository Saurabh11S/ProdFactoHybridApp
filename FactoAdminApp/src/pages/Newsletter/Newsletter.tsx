import { useEffect, useState } from "react";
import HeaderBar from "@/components/common/HeaderBar";
import { Button } from "@/components/ui/button";
import { NEWSLETTER } from "@/api/newsletter";
import { showError } from "@/utils/toast";
import { ThreeDots } from "react-loader-spinner";
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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NewsletterSubscription {
  _id: string;
  email: string;
  isActive: boolean;
  subscribedAt: string;
  unsubscribedAt?: string;
  createdAt: string;
}

interface NewsletterStats {
  total: number;
  active: number;
  inactive: number;
}

function Newsletter() {
  const [subscriptions, setSubscriptions] = useState<NewsletterSubscription[]>([]);
  const [stats, setStats] = useState<NewsletterStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(undefined);
  const [searchEmail, setSearchEmail] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 1,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await NEWSLETTER.GetAllSubscriptions(page, limit, isActiveFilter);
      if (response.success) {
        setSubscriptions(response.data.subscriptions || []);
        setPagination(response.data.pagination || {
          page: 1,
          limit: 50,
          total: 0,
          pages: 1,
        });
      }
    } catch (error) {
      console.error(error);
      showError("There's an error in fetching newsletter subscriptions");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await NEWSLETTER.GetStats();
      if (response.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchStats();
  }, [page, isActiveFilter]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredSubscriptions = subscriptions.filter((sub) =>
    sub.email.toLowerCase().includes(searchEmail.toLowerCase())
  );

  return (
    <div className="w-11/12 m-auto">
      <HeaderBar pageTitle="Newsletter Subscriptions" />
      
      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total Subscriptions</CardTitle>
              <CardDescription>All time subscriptions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Active Subscriptions</CardTitle>
              <CardDescription>Currently receiving emails</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.active}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Inactive Subscriptions</CardTitle>
              <CardDescription>Unsubscribed users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-600">{stats.inactive}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 my-6">
        <Input
          placeholder="Search by email..."
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
          className="max-w-sm"
        />
        <Select
          value={isActiveFilter === undefined ? "all" : isActiveFilter ? "active" : "inactive"}
          onValueChange={(value) => {
            if (value === "all") {
              setIsActiveFilter(undefined);
            } else {
              setIsActiveFilter(value === "active");
            }
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subscriptions</SelectItem>
            <SelectItem value="active">Active Only</SelectItem>
            <SelectItem value="inactive">Inactive Only</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={fetchData} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Subscriptions Table */}
      {loading ? (
        <div
          style={{
            width: "100px",
            margin: "auto",
          }}
        >
          <ThreeDots color="#253483" />
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Subscribed At</TableHead>
                  <TableHead>Unsubscribed At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscriptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                      No subscriptions found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSubscriptions.map((subscription) => (
                    <TableRow key={subscription._id}>
                      <TableCell className="font-medium">{subscription.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant={subscription.isActive ? "default" : "secondary"}
                          className={subscription.isActive ? "bg-green-500" : "bg-gray-500"}
                        >
                          {subscription.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(subscription.subscribedAt)}</TableCell>
                      <TableCell>
                        {subscription.unsubscribedAt
                          ? formatDate(subscription.unsubscribedAt)
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, pagination.total)} of{" "}
                {pagination.total} subscriptions
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Newsletter;

