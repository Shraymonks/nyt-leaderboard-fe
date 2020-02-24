import styled from 'styled-components';

import Heading from 'Heading';
import Layout from 'Layout';
import RankedList from 'RankedList';
import {secondsToMinutes} from 'utils';
import {useLeaderboard, usePuzzleResults} from 'data';

const StatContainer = styled.div`
  margin: 0 30px 60px;

  @media (min-width: 800px) {
    min-width: 300px;
  }
`;

function Stat({list, title}) {
  return (
    <StatContainer>
      <Heading heading={title} />
      <RankedList list={list} />
    </StatContainer>
  );
}

function AverageRanks() {
  const puzzleResults = usePuzzleResults();

  const gamesPlayed = new Map();
  const summedRanks = new Map();

  for (const {results} of puzzleResults) {
    let lastRank = 0;
    let lastTime;

    for (const {name, time} of results) {
      const rank = time === lastTime ? lastRank : ++lastRank;
      lastTime = time;

      if (summedRanks.has(name)) {
        summedRanks.set(name, summedRanks.get(name) + rank);
      } else {
        summedRanks.set(name, rank);
      }

      if (gamesPlayed.has(name)) {
        gamesPlayed.set(name, gamesPlayed.get(name) + 1);
      } else {
        gamesPlayed.set(name, 1);
      }
    }
  }

  const list = Array.from(summedRanks).map(([name, summedRank]) => ({
    name,
    result: summedRank / gamesPlayed.get(name),
  })).sort((a, b) => a.result - b.result)
    .map(({name, result}) => ({
      name,
      result: result.toFixed(2),
    }));

  return <Stat list={list} title="Average Rank" />
}

function AverageTimes() {
  const leaderboard = useLeaderboard();

  const list = leaderboard.map(({name, results}) => ({
    name,
    result: results.reduce(
      (sum, {time}) => sum + time,
      0,
    ) / results.length,
  })).sort((a, b) => a.result - b.result)
    .map(({name, result}) => ({
      name,
      result: secondsToMinutes(result),
    }));

  return <Stat list={list} title="Average Solve Time" />;
}

function FastestTimes() {
  const leaderboard = useLeaderboard();

  const list = leaderboard.map(({name, results}) => ({
    name,
    result: results.reduce(
      (fastest, {time}) => Math.min(time, fastest),
      Infinity,
    ),
  })).sort((a, b) => a.result - b.result)
    .map(({name, result}) => ({
      name,
      result: isFinite(result) ? secondsToMinutes(result) : null,
    }));

  return <Stat list={list} title="Fastest Solve Time" />;
}

function MedianRanks() {
  const puzzleResults = usePuzzleResults();

  const ranks = new Map();

  for (const {results} of puzzleResults) {
    let lastRank = 0;
    let lastTime;

    for (const {name, time} of results) {
      const rank = time === lastTime ? lastRank : ++lastRank;
      lastTime = time;

      if (ranks.has(name)) {
        ranks.get(name).push(rank);
      } else {
        ranks.set(name, [rank]);
      }
    }
  }

  const list = Array.from(ranks).map(([name, playerRanks]) => ({
    name,
    result: playerRanks.sort(
      (a, b) => a - b
    )[Math.floor(playerRanks.length / 2)],
  })).sort((a, b) => a.result - b.result);

  return <Stat list={list} title="Median Rank" />
}

function MedianTimes() {
  const leaderboard = useLeaderboard();

  const list = leaderboard.map(({name, results}) => ({
    name,
    result: results.sort((a, b) => (
      b.time - a.time
    ))[Math.floor(results.length / 2)]?.time,
  })).sort((a, b) => a.result - b.result)
    .map(({name, result}) => ({
      name,
      result: secondsToMinutes(result),
    }));

  return <Stat list={list} title="Median Solve Time" />;
}

function NumberSolved() {
  const leaderboard = useLeaderboard();

  const list = leaderboard.map(({name, results}) => ({
    name,
    result: results.length,
  })).sort((a, b) => b.result - a.result);

  return <Stat list={list} title="Puzzles Solved" />;
}

function PuzzlesWon() {
  const leaderboard = useLeaderboard();
  const puzzleResults = usePuzzleResults();

  const puzzlesWon = new Map();

  for (const {results} of puzzleResults) {
    const winningTime = results[0].time;

    for (const {name, time} of results) {
      if (time !== winningTime) {
        break;
      }

      if (puzzlesWon.has(name)) {
        puzzlesWon.set(name, puzzlesWon.get(name) + 1);
      } else {
        puzzlesWon.set(name, 1);
      }
    }
  }

  const list = leaderboard.map(({name}) => ({
    name,
    result: puzzlesWon.get(name) ?? 0,
  })).sort((a, b) => b.result - a.result);

  return <Stat list={list} title="Puzzles Won" />
}

function SlowestTimes() {
  const leaderboard = useLeaderboard();

  const list = leaderboard.map(({name, results}) => ({
    name,
    result: results.reduce(
      (slowest, {time}) => Math.max(time, slowest),
      0,
    ),
  })).sort((a, b) => b.result - a.result)
    .map(({name, result}) => ({
      name,
      result: result > 0 ? secondsToMinutes(result) : null,
    }));

  return <Stat list={list} title="Slowest Solve Time" />;
}

function Home() {
  return (
    <Layout title="NYT Crossword Stats">
      <PuzzlesWon />
      <NumberSolved />
      <AverageTimes />
      <MedianTimes />
      <AverageRanks />
      <MedianRanks />
      <FastestTimes />
      <SlowestTimes />
    </Layout>
  );
}

export default Home;
