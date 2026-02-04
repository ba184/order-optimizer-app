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
import DSRListPage from "./pages/sales-team/DSRListPage";
import DSRViewPage from "./pages/sales-team/DSRViewPage";
import LeaveManagementPage from "./pages/sales-team/LeaveManagementPage";
import LeadsPage from "./pages/sales-team/LeadsPage";
import LiveTrackingPage from "./pages/sales-team/LiveTrackingPage";
import DistributorsPage from "./pages/outlets/DistributorsPage";
import DistributorDetailPage from "./pages/outlets/DistributorDetailPage";
import RetailersPage from "./pages/outlets/RetailersPage";
import RetailerDetailPage from "./pages/outlets/RetailerDetailPage";
import DistributorFormPage from "./pages/outlets/DistributorFormPage";
import RetailerFormPage from "./pages/outlets/RetailerFormPage";
import VendorsPage from "./pages/outlets/VendorsPage";
import VendorDetailPage from "./pages/outlets/VendorDetailPage";
import VendorFormPage from "./pages/outlets/VendorFormPage";
import OrdersListPage from "./pages/orders/OrdersListPage";
import OrderViewPage from "./pages/orders/OrderViewPage";
import CreateOrderPage from "./pages/orders/CreateOrderPage";
import AdvancedSchemesPage from "./pages/AdvancedSchemesPage";
import ReportsLayout from "./pages/reports/ReportsLayout";
import ReportsDashboard from "./pages/reports/ReportsDashboard";
import DailySalesReport from "./pages/reports/sales/DailySalesReport";
import TargetAchievementReport from "./pages/reports/sales/TargetAchievementReport";
import GenericReport from "./pages/reports/GenericReport";
import ProductsPage from "./pages/master/ProductsPage";
import ProductFormPage from "./pages/master/ProductFormPage";
import ProductViewPage from "./pages/master/ProductViewPage";
import VariantMasterPage from "./pages/master/VariantMasterPage";
import VariantFormPage from "./pages/master/VariantFormPage";
import VariantViewPage from "./pages/master/VariantViewPage";
import WarehouseMasterPage from "./pages/master/WarehouseMasterPage";
import WarehouseFormPage from "./pages/master/WarehouseFormPage";
import WarehouseViewPage from "./pages/master/WarehouseViewPage";
import PresentationsPage from "./pages/master/PresentationsPage";
import TerritoriesPage from "./pages/master/TerritoriesPage";
import UsersPage from "./pages/master/UsersPage";
import RolesPermissionsPage from "./pages/master/RolesPermissionsPage";
import TargetManagementPage from "./pages/master/TargetManagementPage";
import CountryMasterPage from "./pages/master/CountryMasterPage";
import StateMasterPage from "./pages/master/StateMasterPage";
import CityMasterPage from "./pages/master/CityMasterPage";
import ZoneMasterPage from "./pages/master/ZoneMasterPage";
import SettingsPage from "./pages/SettingsPage";
import ExpenseManagementPage from "./pages/ExpenseManagementPage";
import SampleGiftManagementPage from "./pages/SampleGiftManagementPage";
import InventoryManagementPage from "./pages/InventoryManagementPage";
import PreOrderBookingPage from "./pages/PreOrderBookingPage";
import PreOrderViewPage from "./pages/PreOrderViewPage";
import MarketingCollateralPage from "./pages/MarketingCollateralPage";

import CreditManagementPage from "./pages/CreditManagementPage";
import FeedbackComplaintsPage from "./pages/FeedbackComplaintsPage";
import ReturnsManagementPage from "./pages/ReturnsManagementPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <MainLayout>{children}</MainLayout>;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
      
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      
      {/* Sales Team */}
      <Route path="/sales-team/attendance" element={<ProtectedRoute><AttendancePage /></ProtectedRoute>} />
      <Route path="/sales-team/beat-plans" element={<ProtectedRoute><BeatPlansPage /></ProtectedRoute>} />
      <Route path="/sales-team/dsr" element={<ProtectedRoute><DSRListPage /></ProtectedRoute>} />
      <Route path="/sales-team/dsr/new" element={<ProtectedRoute><DSRSubmissionPage /></ProtectedRoute>} />
      <Route path="/sales-team/dsr/:id" element={<ProtectedRoute><DSRViewPage /></ProtectedRoute>} />
      <Route path="/sales-team/dsr/:id/edit" element={<ProtectedRoute><DSRSubmissionPage /></ProtectedRoute>} />
      <Route path="/sales-team/leads" element={<ProtectedRoute><LeadsPage /></ProtectedRoute>} />
      <Route path="/sales-team/leaves" element={<ProtectedRoute><LeaveManagementPage /></ProtectedRoute>} />
      <Route path="/sales-team/tracking" element={<ProtectedRoute><LiveTrackingPage /></ProtectedRoute>} />
      
      {/* My Work (Sales Executive) */}
      <Route path="/my-work/attendance" element={<ProtectedRoute><AttendancePage /></ProtectedRoute>} />
      <Route path="/my-work/beat-plan" element={<ProtectedRoute><BeatPlansPage /></ProtectedRoute>} />
      <Route path="/my-work/dsr" element={<ProtectedRoute><DSRSubmissionPage /></ProtectedRoute>} />
      <Route path="/my-work/leads" element={<ProtectedRoute><LeadsPage /></ProtectedRoute>} />
      <Route path="/my-work/expenses" element={<ProtectedRoute><ExpenseManagementPage /></ProtectedRoute>} />
      
      {/* Outlets */}
      <Route path="/outlets/distributors" element={<ProtectedRoute><DistributorsPage /></ProtectedRoute>} />
      <Route path="/outlets/distributors/new" element={<ProtectedRoute><DistributorFormPage /></ProtectedRoute>} />
      <Route path="/outlets/distributors/:id" element={<ProtectedRoute><DistributorDetailPage /></ProtectedRoute>} />
      <Route path="/outlets/distributors/:id/edit" element={<ProtectedRoute><DistributorFormPage /></ProtectedRoute>} />
      <Route path="/outlets/retailers" element={<ProtectedRoute><RetailersPage /></ProtectedRoute>} />
      <Route path="/outlets/retailers/new" element={<ProtectedRoute><RetailerFormPage /></ProtectedRoute>} />
      <Route path="/outlets/retailers/:id" element={<ProtectedRoute><RetailerDetailPage /></ProtectedRoute>} />
      <Route path="/outlets/retailers/:id/edit" element={<ProtectedRoute><RetailerFormPage /></ProtectedRoute>} />
      <Route path="/outlets/vendors" element={<ProtectedRoute><VendorsPage /></ProtectedRoute>} />
      <Route path="/outlets/vendors/new" element={<ProtectedRoute><VendorFormPage /></ProtectedRoute>} />
      <Route path="/outlets/vendors/:id" element={<ProtectedRoute><VendorDetailPage /></ProtectedRoute>} />
      <Route path="/outlets/vendors/:id/edit" element={<ProtectedRoute><VendorFormPage /></ProtectedRoute>} />
      
      {/* Orders */}
      <Route path="/orders/list" element={<ProtectedRoute><OrdersListPage /></ProtectedRoute>} />
      <Route path="/orders/new" element={<ProtectedRoute><CreateOrderPage /></ProtectedRoute>} />
      <Route path="/orders/:id" element={<ProtectedRoute><OrderViewPage /></ProtectedRoute>} />
      
      {/* Pre-Orders */}
      <Route path="/pre-orders" element={<ProtectedRoute><PreOrderBookingPage /></ProtectedRoute>} />
      <Route path="/pre-orders/:id" element={<ProtectedRoute><PreOrderViewPage /></ProtectedRoute>} />
      
      {/* Inventory */}
      <Route path="/inventory" element={<ProtectedRoute><InventoryManagementPage /></ProtectedRoute>} />
      <Route path="/collaterals" element={<ProtectedRoute><MarketingCollateralPage /></ProtectedRoute>} />
      
      {/* Expenses */}
      <Route path="/expenses" element={<ProtectedRoute><ExpenseManagementPage /></ProtectedRoute>} />
      
      {/* Sample & Gift */}
      <Route path="/samples" element={<ProtectedRoute><SampleGiftManagementPage /></ProtectedRoute>} />
      
      {/* Credit Management */}
      <Route path="/credit" element={<ProtectedRoute><CreditManagementPage /></ProtectedRoute>} />
      
      {/* Feedback & Returns */}
      <Route path="/feedback" element={<ProtectedRoute><FeedbackComplaintsPage /></ProtectedRoute>} />
      <Route path="/returns" element={<ProtectedRoute><ReturnsManagementPage /></ProtectedRoute>} />
      
      {/* Reports & Analytics */}
      <Route path="/reports" element={<ProtectedRoute><ReportsLayout /></ProtectedRoute>}>
        <Route index element={<ReportsDashboard />} />
        <Route path="sales/daily" element={<DailySalesReport />} />
        <Route path="sales/target" element={<TargetAchievementReport />} />
        <Route path="sales/*" element={<GenericReport />} />
        <Route path="productivity/*" element={<GenericReport />} />
        <Route path="outlets/*" element={<GenericReport />} />
        <Route path="products/*" element={<GenericReport />} />
        <Route path="territory/*" element={<GenericReport />} />
        <Route path="schemes/*" element={<GenericReport />} />
        <Route path="forecast/*" element={<GenericReport />} />
      </Route>
      
      {/* Master Data */}
      <Route path="/master/products" element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
      <Route path="/master/products/new" element={<ProtectedRoute><ProductFormPage /></ProtectedRoute>} />
      <Route path="/master/products/:id" element={<ProtectedRoute><ProductViewPage /></ProtectedRoute>} />
      <Route path="/master/products/:id/edit" element={<ProtectedRoute><ProductFormPage /></ProtectedRoute>} />
      <Route path="/master/variants" element={<ProtectedRoute><VariantMasterPage /></ProtectedRoute>} />
      <Route path="/master/variants/new" element={<ProtectedRoute><VariantFormPage /></ProtectedRoute>} />
      <Route path="/master/variants/:id" element={<ProtectedRoute><VariantViewPage /></ProtectedRoute>} />
      <Route path="/master/variants/:id/edit" element={<ProtectedRoute><VariantFormPage /></ProtectedRoute>} />
      <Route path="/master/warehouses" element={<ProtectedRoute><WarehouseMasterPage /></ProtectedRoute>} />
      <Route path="/master/warehouses/new" element={<ProtectedRoute><WarehouseFormPage /></ProtectedRoute>} />
      <Route path="/master/warehouses/:id" element={<ProtectedRoute><WarehouseViewPage /></ProtectedRoute>} />
      <Route path="/master/warehouses/:id/edit" element={<ProtectedRoute><WarehouseFormPage /></ProtectedRoute>} />
      <Route path="/master/schemes" element={<ProtectedRoute><AdvancedSchemesPage /></ProtectedRoute>} />
      <Route path="/master/countries" element={<ProtectedRoute><CountryMasterPage /></ProtectedRoute>} />
      <Route path="/master/states" element={<ProtectedRoute><StateMasterPage /></ProtectedRoute>} />
      <Route path="/master/cities" element={<ProtectedRoute><CityMasterPage /></ProtectedRoute>} />
      <Route path="/master/zones" element={<ProtectedRoute><ZoneMasterPage /></ProtectedRoute>} />
      <Route path="/master/territories" element={<ProtectedRoute><TerritoriesPage /></ProtectedRoute>} />
      <Route path="/master/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
      <Route path="/master/roles" element={<ProtectedRoute><RolesPermissionsPage /></ProtectedRoute>} />
      <Route path="/master/targets" element={<ProtectedRoute><TargetManagementPage /></ProtectedRoute>} />
      <Route path="/master/presentations" element={<ProtectedRoute><PresentationsPage /></ProtectedRoute>} />
      
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      
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