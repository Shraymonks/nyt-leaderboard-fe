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
