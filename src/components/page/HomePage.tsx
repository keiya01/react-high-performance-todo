import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";


const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #292929;
  width: 100%;
  height: 100vh;
  padding: 1rem 0;
`;

const TopContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-bottom: 100px;
`;

const Title = styled.h1`
  font-size: 5rem;
  color: #fff;
`;

const Description = styled.p`
  margin-top: 50px;
  font-size: 2rem;
  color: #aaa;
`;

const Anchor = styled(Link)`
  color: #fff;
  font-size: 2rem;
`;

const Home: React.FC = () => {
  return (
    <Container>
      <TopContent>
        <Title>High Performance Todo</Title>
        <Description>This project for making high performance App in React.</Description>
      </TopContent>
      <Anchor to="/todo">Let's Start</Anchor>
    </Container>
  )
};

export default Home;
