import { router } from 'expo-router';

type UserRole = 'user' | 'vendor' | 'admin' | 'superadmin';
type VendorStatus = 'pending' | 'approved' | 'rejected' | null | undefined;


// Get the appropriate dashboard route based on user role and vendor status.

export function getDashboardRoute(role: UserRole, vendorStatus?: VendorStatus): string {
  if (role === 'admin' || role === 'superadmin') return '/(admin)/(tabs)/dashboard';
  if (role === 'vendor') return '/(vendor)/(tabs)/dashboard';
  return '/(user)/(tabs)/home';
}


// Navigate to the appropriate dashboard based on user role.

export function navigateToDashboard(role: UserRole, vendorStatus?: VendorStatus) {
  const route = getDashboardRoute(role, vendorStatus);
  router.replace(route as any);
}


 // Check if the user has the required role.
 // Superadmin passes any role check.
 
export function hasRole(userRole: UserRole | undefined, requiredRole: UserRole): boolean {
  if (userRole === 'superadmin') return true;
  return userRole === requiredRole;
}

// Check if the user is a vendor with approved status.
export function isApprovedVendor(role: UserRole | undefined, vendorStatus: VendorStatus): boolean {
  return role === 'vendor' && vendorStatus === 'approved';
}
