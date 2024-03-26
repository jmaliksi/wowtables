import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import {
  Box,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardHeader,
  Center,
  ChakraProvider,
  CloseButton,
  Collapse,
  Container,
  Flex,
  HStack,
  Heading,
  List,
  ListItem,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tag,
  TagCloseButton,
  TagLabel,
  Text,
  Wrap,
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
    const res = await fetch("/api/roll?" + params)
    const answer = await res.json()
    setHistory([answer].concat(...history))
  }
  return (
    <Box boxShadow="base" borderRadius="3" padding="4px">
      <Center>
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
      </Center>
      <Container minH="2em" paddingTop="3px" borderRadius="3">
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
    <Box overflow="scroll">
      <Container spacing={5}>
        {
          history.map((entry, i) => (
            <HistoryCard key={i} onClose={() => setHistory(history.toSpliced(i, 1))} entry={entry}/>
          ))
        }
      </Container>
    </Box>
  )
}

function HistoryCard({onClose, entry}) {
  const {setQuery, saved, setSaved} = React.useContext(Context)
  return (
    <Box marginY="4px">
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
    </Box>
  )
}

function Tables() {
  const [tables, setTables] = useState([])
  const {query, setQuery} = React.useContext(Context)
  const fetchTables = async () => {
    const res = await fetch("/api/tables")
    const t = await res.json()
    setTables(t)
  }
  useEffect(() => {
    fetchTables()
  }, [])
  return (
    <Box overflow="scroll">
      <Wrap spacing={3} columns={3}>
        {
          tables.map((table, i) => (
            <Button key={table + i} onClick={() => {
              setQuery(query.concat(table))
            }}>{table}</Button>
          ))
        }
      </Wrap>
    </Box>
  )
}

function Categories() {
  const [categories, setCategories] = useState({})
  const fetchCategories = async () => {
    const res = await fetch("/api/categories")
    const c = await res.json()
    setCategories(c)
  }
  useEffect(() => {
    fetchCategories()
  }, [])
  return (
    <Box overflow="scroll">
      <Wrap spacing={3}>
        {
          Object.keys(categories).map((category, i) => (
            <CategoryCard key={i} category={category} tables={categories[category]}/>
          ))
        }
      </Wrap>
    </Box>
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
    <Box overflow="scroll" width="100%">
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
    </Box>
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
        <Flex h="vh" w="vw">
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
          <Stack minW="22em" boxShadow="base" borderRadius="5">
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
