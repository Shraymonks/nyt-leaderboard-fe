import Layout from 'Layout';
import {secondsToMinutes} from 'utils';
import {usePlayerResults} from 'data';

function averageTime(results) {
  return secondsToMinutes(
    results.reduce((sum, {time}) => sum + time, 0) / results.length
  );
}

function Stats({name}) {
  const results = usePlayerResults(name);

  if (!results) {
    return `Player ${name} not found.`;
  }

  return (
    <div>
      <h1>{name} Stats</h1>
      <dl>
        <dt>Puzzles Completed</dt>
        <dd>{results.length}</dd>
        <dt>Average Solve Time</dt>
        <dd>{averageTime(results)}</dd>
      </dl>
    </div>
  );
}

function PlayerPage({name}) {
  return (
    <Layout title={name}>
      <Stats name={name} />
    </Layout>
  );
}

PlayerPage.getInitialProps = ctx => ({
  name: ctx.query.name,
});

export default PlayerPage;
