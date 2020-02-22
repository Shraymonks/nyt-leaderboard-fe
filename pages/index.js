import {Fragment} from 'react';
import Link from 'next/link';

import Layout from 'Layout';
import {useLeaderboard} from 'data';

function PlayerList() {
  const leaderboard = useLeaderboard();

  const listItems = leaderboard.map(({name, results}) => (
    <li key={name}>
      <Link href="/player/[name]" as={`/player/${name}`}>
        <a>{name} - {results.length} Completed</a>
      </Link>
    </li>
  ));

  return <ul>{listItems}</ul>;
}

function Home() {
  return (
    <Layout title="NYT Mini Leaderboard">
      <PlayerList />
    </Layout>
  );
}

export default Home;
