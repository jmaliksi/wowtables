import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import {
  ChakraProvider,
  Button,
  Stack,
  Container,
  ButtonGroup,
  Box,
  Card,
  CardBody,
  HStack,
  Tag,
  TagLabel,
  TagCloseButton,
  List,
  ListItem,
  Heading,
  Wrap,
  Flex,
} from "@chakra-ui/react";

const Context = React.createContext({
  query: [],
  setQuery: () => {},
  history: [],
  setHistory: () => {},
})

function Query() {
  const {query, setQuery, history, setHistory} = React.useContext(Context)
  const roll = async () => {
    let params = new URLSearchParams()
    query.map((q) => params.append("t", q))
    const res = await fetch("http://localhost:8000/api/roll?" + params)
    const answer = await res.json()
    setHistory(history.concat(answer))
  }
  return (
    <Box>
      <HStack>
        {
          query.map((q, i) => (
            <Tag size='md' key={i}>
              <TagLabel>{q}</TagLabel>
              <TagCloseButton onClick={() => setQuery(query.toSpliced(i, 1))}/>
            </Tag>
          ))
        }
      </HStack>
      <ButtonGroup>
        <Button onClick={roll}>
          Roll!
        </Button>
        <Button onClick={() => setQuery([])}>
          Clear
        </Button>
      </ButtonGroup>
    </Box>
  )
}

function History() {
  const {history} = React.useContext(Context)
  return (
    <Container>
      {
        history.map((entry, i) => (
          <Card key={i}>
            <CardBody>
              {
                Object.keys(entry).map((table, i) => (
                  <Box key={i}>
                    <Heading size='xs'>{table}</Heading>
                    <List>
                      {
                        entry[table].map((roll, i) => (
                          <ListItem key={i}>
                          {roll}
                          </ListItem>
                        ))
                      }
                    </List>
                  </Box>
                ))
              }
            </CardBody>
          </Card>
        ))
      }
    </Container>
  )
}

function Tables() {
  const [tables, setTables] = useState([])
  const {query, setQuery} = React.useContext(Context)
  const fetchTables = async () => {
    const res = await fetch("http://localhost:8000/api/tables")
    const t = await res.json()
    setTables(t)
  }
  useEffect(() => {
    fetchTables()
  }, [])
  return (
    <Container>
      <Wrap spacing={2}>
        {
          tables.map((table) => (
            <Button key={table} onClick={() => {
              setQuery(query.concat(table))
            }}>{table}</Button>
          ))
        }
      </Wrap>
    </Container>
  )
}

function App() {
  const [query, setQuery] = useState([])
  const [history, setHistory] = useState([])
  return (
    <ChakraProvider>
      <Context.Provider value={{query, setQuery, history, setHistory}}>
        <Flex>
          <Tables/>
          <Stack>
            <Query/>
            <History/>
          </Stack>
        </Flex>
      </Context.Provider>
    </ChakraProvider>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
