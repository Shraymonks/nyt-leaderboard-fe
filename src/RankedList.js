import styled from 'styled-components';

const List = styled.ol`
  list-style-type: none;
  padding: 0;
`;

const ListItem = styled.li`
  align-items: center;
  border-bottom: 1px solid #cdcdcd;
  display: flex;
`;

const Name = styled.span`
  flex: 1;
  padding: 12px 0;
`;

const Rank = styled.span`
  font-family: 'NYT-KarnakCondensed';
  width: 30px;
`;

const UnrankedItem = styled(ListItem)`
  color: #c4c4c4;
`;

function RankedList({list}) {
  let lastRank = 0;
  let lastResult;

  const listItems = list.map(({name, result}) => {
    if (result == null) {
      return (
        <UnrankedItem key={name}>
          <Rank>•</Rank>
          <Name>{name}</Name>
          <span>--</span>
        </UnrankedItem>
      );
    }

    const rank = result === lastResult ? null : ++lastRank;
    lastResult = result;

    return (
      <ListItem key={name}>
        <Rank>{rank}</Rank>
        <Name>{name}</Name>
        <span>{result}</span>
      </ListItem>
    );
  });

  return <List>{listItems}</List>;
}

export default RankedList;
