import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";


const Container = styled.div`
  background-color: #292929;
  width: 100%;
  height: 100vh;
`;

const Top: React.FC = () => {
  return (
    <Container>
      <h1>Top Page!</h1>
      <Link to="/about">about</Link>
    </Container>
  )
};

export default Top;
