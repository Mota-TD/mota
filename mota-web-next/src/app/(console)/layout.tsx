import type { ReactNode } from 'react';

import { ConsoleLayout } from '@/components/layout/console-layout';

interface ConsoleLayoutWrapperProps {
  children: ReactNode;
}

export default function ConsoleLayoutWrapper({ children }: ConsoleLayoutWrapperProps) {
  return <ConsoleLayout>{children}</ConsoleLayout>;
}