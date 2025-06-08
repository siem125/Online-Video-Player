'use client';

import Link from 'next/link';
import Icon from '@/app/Components/CustomIcons/Icon'
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

// Map of links to display in the side navigation.
// Depending on the size of the application, this would be stored in a database.
const links = [
  { name: 'Home', href: '/Dashboard', icon: 'house' },
  {
    name: 'Movie',
    href: '/Dashboard/movies',
    icon: 'video_camera',
  },
  { name: 'Serie', href: '/Dashboard/series', icon: 'television' },
  { name: 'Anime', href: '/Dashboard/anime', icon: 'pokeball' },
];

export default function NavLinks() {
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
