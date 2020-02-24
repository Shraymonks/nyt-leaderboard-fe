import Link from 'next/link';
import styled from 'styled-components';

import Heading from 'Heading';
import Layout, {FixedContainer} from 'Layout';
import RankedList from 'RankedList';
import {getOffsetDate, secondsToMinutes, toReadableDate} from 'utils';
import {usePuzzleLeaderboard} from 'data';

const Button = styled.button`
  background-color: #fff;
  border: 1px solid #ccc;
  cursor: pointer;

  &:hover {
    background-color: #f4f4f4;
  }
`;

const Header = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

const StyledNextButton = styled(Button)`
  background: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDIwLjEuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCAxMCAxNiIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMTAgMTY7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPHN0eWxlIHR5cGU9InRleHQvY3NzIj4KCS5zdDB7ZmlsbDpub25lO3N0cm9rZTojOTU5NTk1O3N0cm9rZS13aWR0aDoyO30KPC9zdHlsZT4KPHBhdGggY2xhc3M9InN0MCIgZD0iTTEsMTUuMUw4LjEsOEwxLDAuOSIvPgo8L3N2Zz4K);
  background-position: 54%;
  background-repeat: no-repeat;
  background-size: 11px;
  font-size: 0;
  height: 40px;
  width: 40px;
`;

const StyledPrevButton = styled(StyledNextButton)`
  transform: scaleX(-1);
`;

function NextButton({date}) {
  return (
    <Link href="/leaderboard/[date]" as={`/leaderboard/${getOffsetDate(date, 1)}`} passHref>
      <StyledNextButton>Next Leaderboard</StyledNextButton>
    </Link>
  );
}

function PrevButton({date}) {
  return (
    <Link href="/leaderboard/[date]" as={`/leaderboard/${getOffsetDate(date, -1)}`} passHref>
      <StyledPrevButton>Previous Leaderboard</StyledPrevButton>
    </Link>
  );
}

function PuzzleLeaderboard({date}) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return 'Invalid date';
  }

  const leaderboard = usePuzzleLeaderboard(date);
  const formattedLeaderboard = leaderboard.map(({name, time}) => ({
    name,
    result: time && secondsToMinutes(time),
  }));

  return (
    <>
      <Header>
        <PrevButton date={date} />
        <Heading heading="Your Leaderboard" subHeading={toReadableDate(date)} />
        <NextButton date={date} />
      </Header>
      <RankedList list={formattedLeaderboard} />
    </>
  );
}

function LeaderboardPage({date}) {
  return (
    <Layout title={`${date} Leaderboard`}>
      <FixedContainer>
        <PuzzleLeaderboard date={date} />
      </FixedContainer>
    </Layout>
  );
}

LeaderboardPage.getInitialProps = ctx => ({
  date: ctx.query.date,
});

export default LeaderboardPage;
