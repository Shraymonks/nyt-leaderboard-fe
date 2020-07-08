import Link from 'next/link';
import styled from 'styled-components';
import {useRouter} from 'next/router';

import Heading from 'Heading';
import Layout, {Container, MessageContainer} from 'Layout';
import RankedList, {RankedListItem} from 'RankedList';
import {getLatestPuzzleDate, getOffsetDate, secondsToMinutes} from 'utils';
import {Period, useLeaderboard, usePuzzleResults} from 'data';

interface PeriodFilterProps {
  isActive: boolean;
}

const PeriodFilter = styled.a<PeriodFilterProps>`
  background: ${({isActive}) => isActive ? '#000': '#fff'};
  border: 1px solid ${({isActive}) => isActive ? '#000' : '#ccc'};
  border-radius: 50px;
  color: ${({isActive}) => isActive ? '#fff' : '#000'};
  display: inline-block;
  font-weight: ${({isActive}) => isActive ? '700' : '500'};
  margin: 10px 10px 0;
  padding: 8px 16px;
  text-decoration: none;

  &:hover {
    background: ${({isActive}) => isActive ? '#000': '#f4f4f4'};
  }
`;

const Filters = styled.div`
  margin: -10px 0 0;
  padding-top: 30px;
  text-align: center;
`;

const StatContainer = styled.div`
  margin: 30px;

  @media (min-width: 800px) {
    min-width: 300px;
  }
`;

interface StatContainerProps {
  list: RankedListItem[];
  title: string;
}

function Stat({list, title}: StatContainerProps) {
  return (
    <StatContainer>
      <Heading heading={title} />
      <RankedList list={list} />
    </StatContainer>
  );
}

interface Result {
  name: string;
  result: number;
}

type CompareFunction = (a: number, b: number) => number;

function compareResults(a: Result, b: Result, compareFunction: CompareFunction): number {
  if (a.result === b.result || isNaN(a.result) && isNaN(b.result)) {
    return a.name < b.name ? -1 : 1;
  }

  const comparison = compareFunction(a.result, b.result);
  if (isFinite(comparison)) {
    return comparison;
  }

  return isFinite(a.result) ? -1 : 1;
}

function compareResultsAscending(a: Result, b: Result): number {
  return compareResults(a, b, (x, y) => x - y);
}

function compareResultsDescending(a: Result, b: Result): number {
  return compareResults(a, b, (x, y) => y - x);
}

interface StatProps {
  period: Period;
}

function AverageRanks({period}: StatProps) {
  const leaderboard = useLeaderboard(period);
  const puzzleResults = usePuzzleResults(period);

  const gamesPlayed = new Map();
  const summedRanks = new Map();

  for (const {name} of leaderboard) {
    gamesPlayed.set(name, 0);
    summedRanks.set(name, 0);
  }

  for (const {results} of puzzleResults) {
    let lastRank = 0;
    let lastTime;

    for (const {name, time} of results) {
      const rank = time === lastTime ? lastRank : ++lastRank;
      lastTime = time;

      summedRanks.set(name, summedRanks.get(name) + rank);
      gamesPlayed.set(name, gamesPlayed.get(name) + 1);
    }
  }

  const list = Array.from(summedRanks).map(([name, summedRank]) => ({
    name,
    result: summedRank / gamesPlayed.get(name),
  })).sort(compareResultsAscending)
    .map(({name, result}) => ({
      name,
      result: isNaN(result) ? null : result.toFixed(2),
    }));

  return <Stat list={list} title="Average Rank" />
}

function AverageTimes({period}: StatProps) {
  const leaderboard = useLeaderboard(period);

  const list = leaderboard.map(({name, results}) => ({
    name,
    result: results.reduce(
      (sum, {time}) => sum + time,
      0,
    ) / results.length,
  })).sort(compareResultsAscending)
    .map(({name, result}) => ({
      name,
      result: isNaN(result) ? null : secondsToMinutes(result),
    }));

  return <Stat list={list} title="Average Solve Time" />;
}

function CurrentStreak({period}: StatProps) {
  const leaderboard = useLeaderboard(period);

  const end = period?.end ?? getLatestPuzzleDate();

  const list = leaderboard.map(({name, results}) => {
    let result = 0;
    let lastDate = getOffsetDate(end, -1);

    for (let i = 0; i < results.length; i++) {
      const {date} = results[i];
      if (date === end || date === lastDate) {
        result++;
        lastDate = getOffsetDate(date, -1);
      } else {
        break;
      }
    }

    return {
      name,
      result,
    };
  }).sort(compareResultsDescending);

  return <Stat list={list} title="Current Streak" />;
}

function FastestTimes({period}: StatProps) {
  const leaderboard = useLeaderboard(period);

  const list = leaderboard.map(({name, results}) => ({
    name,
    result: results.reduce(
      (fastest, {time}) => Math.min(time, fastest),
      Infinity,
    ),
  })).sort(compareResultsAscending)
    .map(({name, result}) => ({
      name,
      result: isFinite(result) ? secondsToMinutes(result) : null,
    }));

  return <Stat list={list} title="Fastest Solve Time" />;
}

function MedianRanks({period}: StatProps) {
  const leaderboard = useLeaderboard(period);
  const puzzleResults = usePuzzleResults(period);

  const ranks: Map<string, number[]> = new Map();

  for (const {name} of leaderboard) {
    ranks.set(name, []);
  }

  for (const {results} of puzzleResults) {
    let lastRank = 0;
    let lastTime;

    for (const {name, time} of results) {
      const rank = time === lastTime ? lastRank : ++lastRank;
      lastTime = time;

      const playerRanks = ranks.get(name);
      if (playerRanks) {
        playerRanks.push(rank);
      }
    }
  }

  const list = Array.from(ranks).map(([name, playerRanks]) => ({
    name,
    result: playerRanks.sort(
      (a, b) => a - b
    )[Math.floor(playerRanks.length / 2)],
  })).sort(compareResultsAscending);

  return <Stat list={list} title="Median Rank" />
}

function LongestStreak({period}: StatProps) {
  const leaderboard = useLeaderboard(period);

  const end = period?.end ?? getLatestPuzzleDate();

  const list = leaderboard.map(({name, results}) => {
    let result = 0;
    let longest = 0;
    let lastDate = getOffsetDate(end, -1);

    for (let i = 0; i < results.length; i++) {
      const {date} = results[i];
      if (date === end || date === lastDate) {
        result++;
      } else {
        if (result > longest) {
          longest = result;
        }
        result = 1;
      }
      lastDate = getOffsetDate(date, -1);
    }

    return {
      name,
      result: Math.max(result, longest),
    };
  }).sort(compareResultsDescending);

  return <Stat list={list} title="Longest Streak" />;
}

function MedianTimes({period}: StatProps) {
  const leaderboard = useLeaderboard(period);

  const list = leaderboard.map(({name, results}) => ({
    name,
    result: results.sort((a, b) => (
      b.time - a.time
    ))[Math.floor(results.length / 2)]?.time,
  })).sort(compareResultsAscending)
    .map(({name, result}) => ({
      name,
      result: isNaN(result) ? null : secondsToMinutes(result),
    }));

  return <Stat list={list} title="Median Solve Time" />;
}

function NumberSolved({period}: StatProps) {
  const leaderboard = useLeaderboard(period);

  const list = leaderboard.map(({name, results}) => ({
    name,
    result: results.length,
  })).sort(compareResultsDescending);

  return <Stat list={list} title="Puzzles Solved" />;
}

function PuzzlesWon({period}: StatProps) {
  const leaderboard = useLeaderboard();
  const puzzleResults = usePuzzleResults(period);

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
  })).sort(compareResultsDescending);

  return <Stat list={list} title="Puzzles Won" />
}

function SlowestTimes({period}: StatProps) {
  const leaderboard = useLeaderboard(period);

  const list = leaderboard.map(({name, results}) => ({
    name,
    result: results.reduce(
      (slowest, {time}) => Math.max(time, slowest),
      0,
    ),
  })).sort(compareResultsDescending)
    .map(({name, result}) => ({
      name,
      result: result > 0 ? secondsToMinutes(result) : null,
    }));

  return <Stat list={list} title="Slowest Solve Time" />;
}

interface StatsProps {
  periodDays: string | undefined;
}

function StatsSection({periodDays}: StatsProps) {
  let period: Period;
  if (periodDays != null) {
    const days = parseInt(periodDays, 10);
    if (!/^\d+$/.test(periodDays) || isNaN(days) || days <= 0) {
      return <MessageContainer>Invalid period</MessageContainer>;
    }

    const end = getLatestPuzzleDate();
    period = {
      start: getOffsetDate(end, 1 - days),
      end,
    };
  }
  return (
    <Container>
      <CurrentStreak period={period} />
      <LongestStreak period={period} />
      <PuzzlesWon period={period} />
      <NumberSolved period={period} />
      <AverageTimes period={period} />
      <MedianTimes period={period} />
      <AverageRanks period={period} />
      <MedianRanks period={period} />
      <FastestTimes period={period} />
      <SlowestTimes period={period} />
    </Container>
  );
}

function Home() {
  const {period} = useRouter().query;
  const periodString = Array.isArray(period) ? period[0]: period;

  return (
    <Layout title="NYT Crossword Stats">
      <Filters>
        <Link href="/?period=7" passHref scroll={false}>
          <PeriodFilter isActive={periodString === '7'}>Last 7 days</PeriodFilter>
        </Link>
        <Link href="/?period=30" passHref scroll={false}>
          <PeriodFilter isActive={periodString === '30'}>Last 30 days</PeriodFilter>
        </Link>
        <Link href="/" passHref scroll={false}>
          <PeriodFilter isActive={periodString == null}>All time</PeriodFilter>
        </Link>
      </Filters>
      <StatsSection periodDays={periodString} />
    </Layout>
  );
}

export default Home;
