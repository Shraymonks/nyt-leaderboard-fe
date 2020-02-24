import Head from 'next/head';
import Link from 'next/link';
import styled from 'styled-components';
import {Suspense} from 'react';
import {useRouter} from 'next/router';

import {getLatestPuzzleDate} from 'utils';

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  margin: auto;
  padding: 30px;

  @media (max-width: 799px) {
    flex-direction: column;
    margin-top: 68px;
    max-width: 600px;
  }
`;

const Header = styled.header`
  align-items: center;
  background: #fff;
  border-bottom: 1px solid #ccc;
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  min-width: 320px;
  padding: 0 24px;
  width: 100%;

  @media (max-width: 799px) {
    flex-direction: column;
    left: 0;
    padding-top: 12px;
    position: fixed;
    top: 0;
    z-index: 1;
  }
`;

const Logo = styled.img`
  height: 26px;

  @media (max-width: 799px) {
    height: 21px;
  }
`;

const StyledLink = styled.a`
  border-bottom: 3px solid;
  border-bottom-color: ${({active}) => active ? '#787886' : 'transparent'};
  color: #787886;
  display: inline-block;
  font-size: 12px;
  font-weight: 700;
  height: 64px;
  letter-spacing: 0.5px;
  line-height: 66px;
  margin-left: 50px;
  text-decoration: none;
  text-transform: uppercase;

  &:hover {
    border-color: #787886;
  }

  @media (max-width: 799px) {
    height: initial;
    line-height: initial;
    margin: 0 12px;
    padding: 6px 0;
  }
`;

function NavLink(props) {
  const {pathname} = useRouter();

  return (
    <Link href={props.href} as={props.as} passHref>
      <StyledLink active={pathname === props.href}>
        {props.children}
      </StyledLink>
    </Link>
  );
}

function Layout({children, title}) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <Header>
        <Link href="/">
          <a>
            <Logo src="/logo.svg" alt="NYT Crossword Stats" />
          </a>
        </Link>
        <nav>
          <NavLink href="/">
            Statistics
          </NavLink>
          <NavLink
            href="/leaderboard/[date]"
            as={`/leaderboard/${getLatestPuzzleDate()}`}
          >
            Leaderboards
          </NavLink>
        </nav>
      </Header>
      <Container>
        <Suspense fallback="loading...">
          {children}
        </Suspense>
      </Container>
    </>
  );
}

export const FixedContainer = styled.div`
  flex: 1;
  max-width: 600px;
`;

export default Layout;
