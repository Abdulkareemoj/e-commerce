import { router } from 'expo-router';

type UserRole = 'user' | 'vendor' | 'admin';
type VendorStatus = 'pending' | 'approved' | 'rejected' | null | undefined;


// Get the appropriate dashboard route based on user role and vendor status.

export function getDashboardRoute(role: UserRole, vendorStatus?: VendorStatus): string {
  if (role === 'admin') return '/(admin)/(tabs)/dashboard';
  if (role === 'vendor') {
    if (vendorStatus === 'pending') return '/(vendor)/pending';
    if (vendorStatus === 'rejected') return '/(vendor)/rejected';
    return '/(vendor)/(tabs)/dashboard';
  }
  return '/(user)/(tabs)/home';
}


// Navigate to the appropriate dashboard based on user role.

export function navigateToDashboard(role: UserRole, vendorStatus?: VendorStatus) {
  const route = getDashboardRoute(role, vendorStatus);
  router.replace(route as any);
}


 // Check if the user has the required role.
 
export function hasRole(userRole: UserRole | undefined, requiredRole: UserRole): boolean {
  return userRole === requiredRole;
}

// Check if the user is a vendor with approved status.
export function isApprovedVendor(role: UserRole | undefined, vendorStatus: VendorStatus): boolean {
  return role === 'vendor' && vendorStatus === 'approved';
}
