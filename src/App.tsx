import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { MainLayout } from "@/components/layout/MainLayout";

// Pages
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import AttendancePage from "./pages/sales-team/AttendancePage";
import BeatPlansPage from "./pages/sales-team/BeatPlansPage";
import DSRSubmissionPage from "./pages/sales-team/DSRSubmissionPage";
import LeaveManagementPage from "./pages/sales-team/LeaveManagementPage";
import LeadsPage from "./pages/sales-team/LeadsPage";
import LiveTrackingPage from "./pages/sales-team/LiveTrackingPage";
import DistributorsPage from "./pages/outlets/DistributorsPage";
import RetailersPage from "./pages/outlets/RetailersPage";
import NewDistributorPage from "./pages/outlets/NewDistributorPage";
import NewRetailerPage from "./pages/outlets/NewRetailerPage";
import OrdersListPage from "./pages/orders/OrdersListPage";
import CreateOrderPage from "./pages/orders/CreateOrderPage";
import SchemesPage from "./pages/SchemesPage";
import AdvancedSchemesPage from "./pages/AdvancedSchemesPage";
import ReportsPage from "./pages/ReportsPage";
import ProductsPage from "./pages/master/ProductsPage";
import ApprovalWorkflowPage from "./pages/ApprovalWorkflowPage";
import ExpenseManagementPage from "./pages/ExpenseManagementPage";
import SampleGiftManagementPage from "./pages/SampleGiftManagementPage";
import InventoryManagementPage from "./pages/InventoryManagementPage";
import PreOrderBookingPage from "./pages/PreOrderBookingPage";
import ProductTrainingPage from "./pages/ProductTrainingPage";
import CreditManagementPage from "./pages/CreditManagementPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <MainLayout>{children}</MainLayout>;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} />
      <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
      
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      
      {/* Sales Team */}
      <Route path="/sales-team/attendance" element={<ProtectedRoute><AttendancePage /></ProtectedRoute>} />
      <Route path="/sales-team/beat-plans" element={<ProtectedRoute><BeatPlansPage /></ProtectedRoute>} />
      <Route path="/sales-team/dsr" element={<ProtectedRoute><DSRSubmissionPage /></ProtectedRoute>} />
      <Route path="/sales-team/leads" element={<ProtectedRoute><LeadsPage /></ProtectedRoute>} />
      <Route path="/sales-team/leaves" element={<ProtectedRoute><LeaveManagementPage /></ProtectedRoute>} />
      <Route path="/sales-team/tracking" element={<ProtectedRoute><LiveTrackingPage /></ProtectedRoute>} />
      
      {/* My Work (Sales Executive) */}
      <Route path="/my-work/attendance" element={<ProtectedRoute><AttendancePage /></ProtectedRoute>} />
      <Route path="/my-work/beat-plan" element={<ProtectedRoute><BeatPlansPage /></ProtectedRoute>} />
      <Route path="/my-work/dsr" element={<ProtectedRoute><DSRSubmissionPage /></ProtectedRoute>} />
      <Route path="/my-work/leads" element={<ProtectedRoute><LeadsPage /></ProtectedRoute>} />
      
      {/* Outlets */}
      <Route path="/outlets/distributors" element={<ProtectedRoute><DistributorsPage /></ProtectedRoute>} />
      <Route path="/outlets/retailers" element={<ProtectedRoute><RetailersPage /></ProtectedRoute>} />
      <Route path="/outlets/new-distributor" element={<ProtectedRoute><NewDistributorPage /></ProtectedRoute>} />
      <Route path="/outlets/new-retailer" element={<ProtectedRoute><NewRetailerPage /></ProtectedRoute>} />
      
      {/* Orders */}
      <Route path="/orders/list" element={<ProtectedRoute><OrdersListPage /></ProtectedRoute>} />
      <Route path="/orders/pending" element={<ProtectedRoute><OrdersListPage /></ProtectedRoute>} />
      <Route path="/orders/new" element={<ProtectedRoute><CreateOrderPage /></ProtectedRoute>} />
      
      {/* Schemes */}
      <Route path="/schemes" element={<ProtectedRoute><SchemesPage /></ProtectedRoute>} />
      <Route path="/schemes/advanced" element={<ProtectedRoute><AdvancedSchemesPage /></ProtectedRoute>} />
      
      {/* Reports & Analytics */}
      <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
      
      {/* Approval Workflow */}
      <Route path="/approvals" element={<ProtectedRoute><ApprovalWorkflowPage /></ProtectedRoute>} />
      
      {/* Expense Management */}
      <Route path="/expenses" element={<ProtectedRoute><ExpenseManagementPage /></ProtectedRoute>} />
      
      {/* Sample & Gift */}
      <Route path="/samples" element={<ProtectedRoute><SampleGiftManagementPage /></ProtectedRoute>} />
      
      {/* Inventory */}
      <Route path="/inventory" element={<ProtectedRoute><InventoryManagementPage /></ProtectedRoute>} />
      
      {/* Pre-Orders */}
      <Route path="/pre-orders" element={<ProtectedRoute><PreOrderBookingPage /></ProtectedRoute>} />
      
      {/* Training */}
      <Route path="/training" element={<ProtectedRoute><ProductTrainingPage /></ProtectedRoute>} />
      
      {/* Credit Management */}
      <Route path="/credit" element={<ProtectedRoute><CreditManagementPage /></ProtectedRoute>} />
      
      {/* Master Data */}
      <Route path="/master/products" element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
      <Route path="/master/schemes" element={<ProtectedRoute><AdvancedSchemesPage /></ProtectedRoute>} />
      <Route path="/master/territories" element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
      <Route path="/master/users" element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
      
      <Route path="/settings" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppRoutes />
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
