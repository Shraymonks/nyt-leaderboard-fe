import {
  useFirestore,
  useFirestoreCollectionData,
} from 'reactfire';

export type Period = {
  end: string;
  start: string;
} | undefined

interface PlayerResults {
  name: string;
  results: PlayerResult[];
}

export function useLeaderboard(period?: Period): PlayerResults[] {
  const ref = useFirestore()
    .collection('leaderboard')
    .orderBy('name');

  const leaderboard: PlayerResults[] = useFirestoreCollectionData(ref);

  if (!period) {
    return leaderboard;
  }
  return leaderboard.map(({name, results}) => ({
    name,
    results: results.filter(({date}) => {
      const d = new Date(date);

      return d >= new Date(period.start) && d <= new Date(period.end);
    })
  }));
}

interface PlayerResult {
  date: string;
  time: number;
}

export function usePlayerResults(name: string, period?: Period): PlayerResult[] {
  const ref = useFirestore()
    .collection('leaderboard')
    .where("name", "==", name)

  const leaderboard: PlayerResults[] = useFirestoreCollectionData(ref);
  const results = leaderboard[0]?.results;

  if (!period) {
    return results;
  }

  return results.filter(({date}) => {
    const d = new Date(date);

    return d >= new Date(period.start) && d <= new Date(period.end);
  });
}

interface PuzzleLeaderboardTime {
  name: string;
  time: number | null;
}

export function usePuzzleLeaderboard(date: string, period?: Period): PuzzleLeaderboardTime[] {
  return useLeaderboard(period).map(({name, results}) => ({
    name,
    time: results.find(result => result.date === date)?.time ?? null,
  })).sort((a, b) => {
    if (a.time != null && b.time != null) {
      return a.time - b.time;
    }
    return a.time != null ? -1 : 1;
  });
}

interface PlayerTime {
  name: string;
  time: number;
}

interface PuzzleResult {
  date: string;
  results: PuzzleLeaderboardTime[];
}


export function usePuzzleResults(period?: Period): PuzzleResult[] {
  const times: Map<string, PlayerTime[]> = new Map();

  for (const {name, results} of useLeaderboard(period)) {
    for (const {date, time} of results) {
      const playerResults = times.get(date);
      if (playerResults) {
        playerResults.push({name, time});
      } else {
        times.set(date, [{name, time}]);
      }
    }
  }

  return Array.from(times).map(([date, results]) => ({
    date,
    results: results.sort((a, b) => a.time - b.time),
  })).sort((a, b) => +new Date(b.date) - +new Date(a.date));
}
