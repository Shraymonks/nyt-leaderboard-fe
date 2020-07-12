import Link from 'next/link';
import styled from 'styled-components';
import {useRouter} from 'next/router';

import Heading from 'Heading';
import Layout, {Container, MessageContainer} from 'Layout';
import RankedList, {RankedListItem} from 'RankedList';
import {getLatestPuzzleDate, getOffsetDate, secondsToMinutes} from 'utils';
import {Period, PlayerResults, PuzzleResult, useLeaderboard, usePuzzleResults} from 'data';

interface PillProps {
  isActive: boolean;
}

const Pill = styled.a<PillProps>`
  background: ${({isActive}) => isActive ? '#000': '#fff'};
  border: 1px solid ${({isActive}) => isActive ? '#000' : '#ccc'};
  border-radius: 50px;
  color: ${({isActive}) => isActive ? '#fff' : '#000'};
  display: inline-block;
  font-weight: ${({isActive}) => isActive ? '700' : '500'};
  margin: 12px 6px 0;
  padding: 8px 16px;
  text-align: center;
  text-decoration: none;

  &:hover {
    background: ${({isActive}) => isActive ? '#000': '#f4f4f4'};
  }

  /* Fix pixel shift from bold styling */
  &::before {
    content: attr(title);
    display: block;
    font-weight: 700;
    height: 0;
    visibility: hidden;
  }
`;

const Filters = styled.div`
  padding-top: 18px;
  text-align: center;
`;

const StatContainer = styled.div`
  margin: 30px;

  @media (min-width: 800px) {
    min-width: 300px;
  }
`;

interface PeriodFilterProps {
  href: string;
  isActive: boolean;
  title: string;
}

function PeriodFilter({href, isActive, title}: PeriodFilterProps) {
  return (
    <Link href={href} passHref scroll={false}>
      <Pill isActive={isActive} title={title}>{title}</Pill>
    </Link>
  );
}

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
  leaderboard: PlayerResults[];
}

interface PuzzleResultsStatProps {
  leaderboard: PlayerResults[];
  puzzleResults: PuzzleResult[];
}

function AverageRanks({leaderboard, puzzleResults}: PuzzleResultsStatProps) {
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

function AverageTimes({leaderboard}: StatProps) {
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

function CurrentStreak({leaderboard}: StatProps) {
  const latestPuzzleDate = getLatestPuzzleDate();

  const list = leaderboard.map(({name, results}) => {
    let result = 0;
    let lastDate = getOffsetDate(latestPuzzleDate, -1);

    for (let i = 0; i < results.length; i++) {
      const {date} = results[i];
      if (date === lastDate || date === latestPuzzleDate) {
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

function FastestTimes({leaderboard}: StatProps) {
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

function MedianRanks({leaderboard, puzzleResults}: PuzzleResultsStatProps) {
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

function LongestStreak({leaderboard}: StatProps) {
  const latestPuzzleDate = getLatestPuzzleDate();

  const list = leaderboard.map(({name, results}) => {
    let streak = 0;
    let longest = 0;
    let lastDate = getOffsetDate(latestPuzzleDate, -1);

    for (let i = 0; i < results.length; i++) {
      const {date} = results[i];
      if (date === lastDate || date === latestPuzzleDate) {
        streak++;
      } else {
        if (streak > longest) {
          longest = streak;
        }
        streak = 1;

        if (longest > results.length - i) {
          break;
        }
      }
      lastDate = getOffsetDate(date, -1);
    }

    return {
      name,
      result: Math.max(streak, longest),
    };
  }).sort(compareResultsDescending);

  return <Stat list={list} title="Longest Streak" />;
}

function MedianTimes({leaderboard}: StatProps) {
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

function NumberSolved({leaderboard}: StatProps) {
  const list = leaderboard.map(({name, results}) => ({
    name,
    result: results.length,
  })).sort(compareResultsDescending);

  return <Stat list={list} title="Puzzles Solved" />;
}

function PuzzlesWon({leaderboard, puzzleResults}: PuzzleResultsStatProps) {
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

function SlowestTimes({leaderboard}: StatProps) {
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

  const leaderboard = useLeaderboard(period);
  const puzzleResults = usePuzzleResults(period);

  return (
    <Container>
      <CurrentStreak leaderboard={leaderboard} />
      <LongestStreak leaderboard={leaderboard} />
      <PuzzlesWon leaderboard={leaderboard} puzzleResults={puzzleResults} />
      <NumberSolved leaderboard={leaderboard} />
      <AverageTimes leaderboard={leaderboard} />
      <MedianTimes leaderboard={leaderboard} />
      <AverageRanks leaderboard={leaderboard} puzzleResults={puzzleResults}/>
      <MedianRanks leaderboard={leaderboard} puzzleResults={puzzleResults}/>
      <FastestTimes leaderboard={leaderboard} />
      <SlowestTimes leaderboard={leaderboard} />
    </Container>
  );
}

function Home() {
  const {period} = useRouter().query;
  const periodString = Array.isArray(period) ? period[0]: period;

  return (
    <Layout title="NYT Crossword Stats">
      <Filters>
        <PeriodFilter href="/?period=7" isActive={periodString === '7'} title="Last 7 days" />
        <PeriodFilter href="/?period=30" isActive={periodString === '30'} title="Last 30 days" />
        <PeriodFilter href="/" isActive={periodString == null} title="All time" />
      </Filters>
      <StatsSection periodDays={periodString} />
    </Layout>
  );
}

export default Home;
