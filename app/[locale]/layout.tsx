import {NextIntlClientProvider} from 'next-intl';
import {getLocale, getMessages} from 'next-intl/server';
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const rtlLocales = ['ar']

export default async function LocaleLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
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