import React from "react";
import styled from "styled-components";


const Container = styled.div`
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
  margin-top: 100px;
  margin-bottom: 30px;
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

const Home: React.FC = () => {
  return (
    <Container>
      <TopContent>
        <Title>High Performance Todo</Title>
        <Description>This project for making high performance App in React.</Description>
      </TopContent>
    </Container>
  )
};

export default Home;
