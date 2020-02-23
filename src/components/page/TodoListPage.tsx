import React, { useState, ChangeEvent, KeyboardEvent, useCallback } from 'react';
import styled from 'styled-components';
import { Todo } from 'src/constants/todo';


const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #292929;
  width: 100%;
  height: 100vh;
`;

const Input = styled.input`
  margin-top: 200px;
  font-size: 1.6rem;
  padding: 10px 15px;
  width: 250px;
  border: none;
  background-color: #fff;
  :focus {
    outline: 2px solid #058703;
  }
  ::placeholder {
    font-size: 1.6rem;
    color: #bbb;
  }
`;

const List = styled.ul`
  margin-top: 50px;
  max-width: 300px;
  width: 90%;
`;

const Item = styled.li`
  width: 100%;
  padding: 20px 10px;
  color: #fff;
  :not(:last-child) {
    border-bottom: 1px solid #fff;
  }
`;

let todoID = 0;

const TodoListPage = () => {
  const [text, setText] = useState('');
  const [todoList, setTodoList] = useState<Todo[]>([]);

  const handleOnChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  }, [])

  const handleOnKeydown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if(text.length <= 3) return;
    if(e.keyCode === 13) {
      setTodoList(prev => ([...prev, {id: ++todoID, title: text, isComplete: false}]));
      setText('');
    }
  }, [text]);

  return (
    <Container>
      <Input onChange={handleOnChange} onKeyDown={handleOnKeydown} placeholder="Enter Todo"/>
      <List>
        {todoList.map(todo => (
          <Item key={todo.id}>{todo.title}</Item>
        ))}
      </List>
    </Container>
  );
};

export default TodoListPage;
