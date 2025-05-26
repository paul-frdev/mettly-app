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
            ? 'bg-[#0f0880] text-white hover:bg-[#0d0666]'
            : 'text-[#0f0880] hover:text-[#e42627]'
          } transition-colors`}
      >
        EN
      </Button>
      <Button
        variant={currentLocale === 'uk' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => switchLanguage('uk')}
        className={`${currentLocale === 'uk'
            ? 'bg-[#0f0880] text-white hover:bg-[#0d0666]'
            : 'text-[#0f0880] hover:text-[#e42627]'
          } transition-colors`}
      >
        UA
      </Button>
    </div>
  );
} 