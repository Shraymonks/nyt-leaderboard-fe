import Head from 'next/head';
import {Suspense} from 'react';

function Layout({children, title}) {
  return (
    <div>
      <Head>
        <title>{title}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Suspense fallback="loading...">
        {children}
      </Suspense>
    </div>
  );
}

export default Layout;
