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
  CardHeader,
  CardBody,
  HStack,
  Tag,
  TagLabel,
  TagCloseButton,
  List,
  ListItem,
  Heading,
  Flex,
  Wrap,
  Text,
  CloseButton,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Collapse,
  useDisclosure,
} from "@chakra-ui/react";

const Context = React.createContext({
  query: [],
  setQuery: () => {},
  history: [],
  setHistory: () => {},
  saved: [],
  setSaved: () => {},
})

function Query() {
  const {query, setQuery, history, setHistory} = React.useContext(Context)
  const roll = async () => {
    let params = new URLSearchParams()
    query.map((q) => params.append("t", q))
    const res = await fetch("http://localhost:8000/api/roll?" + params)
    const answer = await res.json()
    setHistory([answer].concat(...history))
  }
  return (
    <Box boxShadow="base" borderRadius="3">
      <ButtonGroup>
        <Button onClick={roll} isDisabled={query.length === 0} colorScheme="purple">
          Roll!
        </Button>
        <Button onClick={() => setQuery([])} isDisabled={query.length === 0}>
          Clear Query
        </Button>
        <Button onClick={() => setHistory([])} isDisabled={history.length === 0}>
          Clear History
        </Button>
      </ButtonGroup>
      <Container minH="2em">
        {
          query.map((q, i) => (
            <Tag size='md' key={i}>
              <TagLabel>{q}</TagLabel>
              <TagCloseButton onClick={() => setQuery(query.toSpliced(i, 1))}/>
            </Tag>
          ))
        }
      </Container>
    </Box>
  )
}

function History() {
  const {history, setHistory} = React.useContext(Context)
  return (
    <Container spacing={5}>
      {
        history.map((entry, i) => (
          <HistoryCard key={i} onClose={() => setHistory(history.toSpliced(i, 1))} entry={entry}/>
        ))
      }
    </Container>
  )
}

function HistoryCard({onClose, entry}) {
  const {setQuery, saved, setSaved} = React.useContext(Context)
  return (
    <Card>
      <Flex justifyContent="space-between">
        <ButtonGroup>
          <Button
            onClick={() => {
              let s = saved.concat(entry)
              setSaved(s)
              localStorage.setItem("saved", JSON.stringify(s))
            }}>
            💾
          </Button>
          <Button
            onClick={() => {
              let q = []
              for (let key in entry) {
                for (let i = 0; i < entry[key].length; i++) {
                  q.push(key)
                }
              }
              setQuery(q)
            }}
          >
            ↻
          </Button>
        </ButtonGroup>
        <CloseButton onClick={onClose} alignSelf="flex-end"/>
      </Flex>
      <CardBody>
        {
          Object.keys(entry).map((table, i) => (
            <HStack key={i} alignItems="flex-start">
              <Heading size="xs">{table}</Heading>
              <List>
                {
                  entry[table].map((roll, i) => (
                    <ListItem key={i}>
                      <Text fontSize="xs">
                        {roll}
                      </Text>
                    </ListItem>
                  ))
                }
              </List>
            </HStack>
          ))
        }
      </CardBody>
    </Card>
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
    <Wrap spacing={3} columns={3}>
      {
        tables.map((table, i) => (
          <Button key={table + i} onClick={() => {
            setQuery(query.concat(table))
          }}>{table}</Button>
        ))
      }
    </Wrap>
  )
}

function Categories() {
  const [categories, setCategories] = useState({})
  const fetchCategories = async () => {
    const res = await fetch("http://localhost:8000/api/categories")
    const c = await res.json()
    setCategories(c)
  }
  useEffect(() => {
    fetchCategories()
  }, [])
  return (
    <Wrap spacing={3}>
      {
        Object.keys(categories).map((category, i) => (
          <CategoryCard key={i} category={category} tables={categories[category]}/>
        ))
      }
    </Wrap>
  )
}

function CategoryCard({category, tables}) {
  const {query, setQuery} = React.useContext(Context)
  const {isOpen, onToggle} = useDisclosure()
  return (
    <Card w="30%" minW="10em">
      <CardHeader>
        <Button variant="ghost" onClick={onToggle}>
          {(isOpen ? "⏷ " : "⏵ ") + category}
        </Button>
      </CardHeader>
      <Collapse in={isOpen} animateOpacity>
        <CardBody>
          <Wrap spacing={2}>
          {
            tables.map((table, i) => (
              <Button size="sm" key={table + i} onClick={() => {
                setQuery(query.concat(table))
              }}>{table}</Button>
            ))
          }
          </Wrap>
        </CardBody>
      </Collapse>
    </Card>
  )
}

function SavedRolls() {
  const {saved, setSaved} = React.useContext(Context)
  return (
    <Wrap spacing={5}>
      {
        saved.map((s, i) => (
          <HistoryCard key={i} entry={s} onClose={() => {
            let s = saved.toSpliced(i, 1)
            setSaved(s)
            localStorage.setItem("saved", JSON.stringify(s))
          }} />
        ))
      }
    </Wrap>
  )
}

function App() {
  const [query, setQuery] = useState([])
  const [history, setHistory] = useState([])
  const [saved, setSaved] = useState([])

  useEffect(() => {
    const s = JSON.parse(localStorage.getItem("saved"))
    if (s) {
      setSaved(s)
    }
  }, [])

  return (
    <ChakraProvider>
      <Context.Provider value={{query, setQuery, history, setHistory, saved, setSaved}}>
        <Flex>
          <Tabs variant="enclosed">
            <TabList>
              <Tab>All Tables</Tab>
              <Tab>By Category</Tab>
              <Tab>Saved</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <Tables/>
              </TabPanel>
              <TabPanel>
                <Categories/>
              </TabPanel>
              <TabPanel>
                <SavedRolls/>
              </TabPanel>
            </TabPanels>
          </Tabs>
          <Stack minW="30em" boxShadow="base" borderRadius="5">
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
