import {FirebaseAppProvider} from 'reactfire';
import {createGlobalStyle} from 'styled-components';

const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: 'nyt-franklin';
    font-style: normal;
    font-weight: 500;
    src: url('/franklin-normal-500.woff2');
  }

  @font-face {
    font-family: 'nyt-franklin';
    font-style: normal;
    font-weight: 700;
    src: url('/franklin-normal-700.woff2');
  }

  @font-face {
    font-family: 'nyt-karnakcondensed';
    font-style: normal;
    font-weight: 700;
    src: url("/karnakcondensed-normal-700.woff2");
  }

  body {
    font-family: 'nyt-franklin';
    margin: 0;
    min-width: 320px;

    @media (max-width: 799px) {
      margin-top: 68px;
    }
  }
`;

const firebaseConfig = {
  apiKey: 'AIzaSyDItcXNOObI0-jcbLbPYwbnAH96Jx2dqJ0',
  authDomain: 'nyt-crossword-leaderboard.firebaseapp.com',
  databaseURL: 'https://nyt-crossword-leaderboard.firebaseio.com',
  projectId: 'nyt-crossword-leaderboard',
  storageBucket: 'nyt-crossword-leaderboard.appspot.com',
  messagingSenderId: '304703383218',
  appId: '1:304703383218:web:8e2a1353b699d6d6bf0bab'
};

function MyApp({Component, pageProps}) {
  return (
    <FirebaseAppProvider firebaseConfig={firebaseConfig}>
      <GlobalStyle />
      <Component {...pageProps} />
    </FirebaseAppProvider>
  );
}

export default MyApp;
