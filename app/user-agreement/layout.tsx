import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'User Agreement — TrainerUniverse',
  description:
    'The terms governing your use of TrainerUniverse. TrainerUniverse is a marketplace that connects trainers and students and is not responsible for the interactions, sessions, or meetings between them.',
};

export default function UserAgreementLayout({ children }: { children: React.ReactNode }) {
  return children;
}
