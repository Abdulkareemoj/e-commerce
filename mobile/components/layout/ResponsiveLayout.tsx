import { View, useWindowDimensions } from 'react-native';
import { AppSidebar } from './AppSidebar';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  role?: 'user' | 'vendor' | 'admin';
  hideSidebar?: boolean;
}

export function ResponsiveLayout({
  children,
  role = 'user',
  hideSidebar = false,
}: ResponsiveLayoutProps) {
  const { width } = useWindowDimensions();
  const isWeb = width >= 1024;

  if (isWeb && !hideSidebar) {
    return (
      <View className="bg-background flex-1 flex-row">
        <AppSidebar role={role} />
        <View className="flex-1 overflow-hidden">{children}</View>
      </View>
    );
  }

  return <View className="bg-background flex-1">{children}</View>;
}
