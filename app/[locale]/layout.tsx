import {NextIntlClientProvider} from 'next-intl';
import {getMessages, setRequestLocale} from 'next-intl/server';
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const rtlLocales = ['ar']

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const messages = await getMessages();
  const dir = rtlLocales.includes(locale) ? 'rtl' : 'ltr';

  return (
    <NextIntlClientProvider messages={messages}>
      <div lang={locale} dir={dir}>
        <Navbar />
        <div className="pt-16">
          {children}
        </div>
        <Footer />
      </div>
    </NextIntlClientProvider>
  );
}