import React from 'react';
import styled from 'styled-components';

const GameHeading = styled.h2`
  font: 700 16px 'NYT-Franklin';
  letter-spacing: 0.5px;
  margin: 0 0 8px;
  text-transform: uppercase;
`;

const HeadingGroup = styled.hgroup`
  margin: 0 15px;
  text-align: center;
`;

const StyledHeading = styled.h1`
  font: 35px/38px 'NYT-KarnakCondensed';
  margin: 0 0 3px;
`;

const SubHeading = styled.h3`
  font: 16px 'NYT-Franklin';
  margin: 0;
`;

interface HeadingProps {
  heading: string;
  subHeading?: string;
}

function Heading({heading, subHeading}: HeadingProps) {
  return (
    <HeadingGroup>
      <GameHeading>The Mini Crossword</GameHeading>
      <StyledHeading>{heading}</StyledHeading>
      {subHeading && <SubHeading>{subHeading}</SubHeading>}
    </HeadingGroup>
  );
}

export default React.memo(Heading);
