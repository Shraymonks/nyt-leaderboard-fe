import {
  useFirestore,
  useFirestoreCollectionData,
} from 'reactfire';

export function useLeaderboard() {
  const ref = useFirestore()
    .collection('leaderboard')
    .orderBy('name');

  return useFirestoreCollectionData(ref);
}

export function usePlayerResults(name) {
  const ref = useFirestore()
    .collection('leaderboard')
    .where("name", "==", name)

  return useFirestoreCollectionData(ref)[0]?.results;
}

export function usePuzzleLeaderboard(date) {
  const ref = useFirestore()
    .collection('leaderboard')
    .orderBy('name');

  return useFirestoreCollectionData(ref).map(({name, results}) => ({
    name,
    time: results.find(result => result.date === date)?.time,
  })).sort((a, b) => {
    if (a.time != null && b.time != null) {
      return a.time - b.time;
    }
    return a.time != null ? -1 : 1;
  });
}

export function usePuzzleResults() {
  const ref = useFirestore()
    .collection('leaderboard')
    .orderBy('name');

  const leaderboard = useFirestoreCollectionData(ref);

  const times = new Map();

  for (const {name, results} of leaderboard) {
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
