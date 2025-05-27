'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Button } from './button';
import { useLocale } from 'next-intl';

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();

  const switchLanguage = (newLocale: string) => {
    const newPath = pathname.replace(`/${currentLocale}`, `/${newLocale}`);
    router.push(newPath);
  };

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant={currentLocale === 'en' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => switchLanguage('en')}
        className={`${currentLocale === 'en'
          ? 'bg-[#e42627] text-white hover:bg-[#d41f20]'
          : 'text-gray-200 hover:text-white'
          } transition-colors`}
      >
        EN
      </Button>
      <Button
        variant={currentLocale === 'uk' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => switchLanguage('uk')}
        className={`${currentLocale === 'uk'
          ? 'bg-[#e42627] text-white hover:bg-[#d41f20]'
          : 'text-gray-200 hover:text-white'
          } transition-colors`}
      >
        UA
      </Button>
    </div>
  );
} 