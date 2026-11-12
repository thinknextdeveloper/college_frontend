import type { Metadata } from 'next';
import { Suspense } from 'react';
import Providers from '@/components/Providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Student Admission Portal',
  description: 'Online admission and student management system',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={null}>
          <Providers>{children}</Providers>
        </Suspense>
      </body>
    </html>
  );
}
