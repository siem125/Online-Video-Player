'use client';

import Link from 'next/link';
import Icon from '@/app/Components/CustomIcons/Icon'
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

// Map of links to display in the side navigation.
// Depending on the size of the application, this would be stored in a database.
const links = [
  { name: 'Home', href: '/Admin', icon: 'house' },
  {
    name: 'Shows',
    href: '/Admin/Shows',
    icon: 'television',
  },
  { name: 'Users', href: '/Admin/Users', icon: 'television' },
];

export default function AdminNavLinks() {
  const pathname = usePathname();
  return (
    <>
      {links.map((link) => {
        //const LinkIcon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              'sidenav-btn',
              pathname === link.href && 'highlighted'
            )}
            >
            <Icon name={link.icon} className="w-6" />
            <span className="hidden md:block">{link.name}</span>
          </Link>
        );
      })}
    </>
  );
}
