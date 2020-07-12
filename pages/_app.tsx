import {AppProps} from 'next/app';
import {FirebaseAppProvider} from 'reactfire';
import 'styles.css';

const firebaseConfig = {
  apiKey: 'AIzaSyDItcXNOObI0-jcbLbPYwbnAH96Jx2dqJ0',
  authDomain: 'nyt-crossword-leaderboard.firebaseapp.com',
  databaseURL: 'https://nyt-crossword-leaderboard.firebaseio.com',
  projectId: 'nyt-crossword-leaderboard',
  storageBucket: 'nyt-crossword-leaderboard.appspot.com',
  messagingSenderId: '304703383218',
  appId: '1:304703383218:web:8e2a1353b699d6d6bf0bab'
};

function MyApp({Component, pageProps}: AppProps) {
  return (
    <FirebaseAppProvider firebaseConfig={firebaseConfig}>
      <Component {...pageProps} />
    </FirebaseAppProvider>
  );
}

export default MyApp;
