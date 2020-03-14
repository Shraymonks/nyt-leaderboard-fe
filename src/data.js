import {
  useFirestore,
  useFirestoreCollectionData,
} from 'reactfire';

export function useLeaderboard(period) {
  const ref = useFirestore()
    .collection('leaderboard')
    .orderBy('name');

  const leaderboard = useFirestoreCollectionData(ref);

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

export function usePlayerResults(name, period) {
  const ref = useFirestore()
    .collection('leaderboard')
    .where("name", "==", name)

  const results = useFirestoreCollectionData(ref)[0]?.results;

  if (!period) {
    return results;
  }

  return results.filter(({date}) => {
    const d = new Date(date);

    return d >= new Date(period.start) && d <= new Date(period.end);
  });
}

export function usePuzzleLeaderboard(date, period) {
  return useLeaderboard(period).map(({name, results}) => ({
    name,
    time: results.find(result => result.date === date)?.time,
  })).sort((a, b) => {
    if (a.time != null && b.time != null) {
      return a.time - b.time;
    }
    return a.time != null ? -1 : 1;
  });
}

export function usePuzzleResults(period) {
  const times = new Map();

  for (const {name, results} of useLeaderboard(period)) {
    for (const {date, time} of results) {
      if (times.has(date)) {
        times.get(date).push({name, time});
      } else {
        times.set(date, [{name, time}]);
      }
    }
  }

  return Array.from(times).map(([date, results]) => ({
    date,
    results: results.sort((a, b) => a.time - b.time),
  })).sort((a, b) => new Date(b.date) - new Date(a.date));
}
