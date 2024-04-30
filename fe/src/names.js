import { useState, useEffect } from 'react';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  ButtonGroup,
  FormControl,
  FormLabel,
  HStack,
  Heading,
  IconButton,
  List,
  ListItem,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Portal,
  Select,
  Text,
  VStack,
  Wrap,
} from "@chakra-ui/react";
import { CheckIcon, ChevronDownIcon } from "@chakra-ui/icons";

const ONOMANCER_URL = 'https://onomancer.sibr.dev/api/';

export function Names({query}) {
  const [names, setNames] = useState([])
  const saveNames = (nms) => {
    setNames(nms)
    localStorage.setItem("names", JSON.stringify(nms))
  }
  const addNames = (nms, color) => {
    let newNames = [...names]
    for (let i = 0; i < nms.length; i++) {
      newNames.push([nms[i], color !== undefined ? color : 'white'])
    }
    saveNames(newNames)
  }
  useEffect(() => {
    const n = JSON.parse(localStorage.getItem("names"))
    if (n) {
      setNames(n)
    }
  }, [])
  const [mode, setMode] = useState('normal')
  const [highlight, setHighlight] = useState(-1)

  return (
    <Box>
      {mode === 'edit' && <NamesAdder names={names} addNames={addNames}/>}
      <NamesHeader names={names} saveNames={saveNames} mode={mode} setMode={setMode} setHighlight={setHighlight}/>
      <NamesAccordion names={names} saveNames={saveNames} mode={mode} highlight={highlight} setHighlight={setHighlight} query={query}/>
    </Box>
  )
}

function NamesHeader({names, saveNames, setHighlight, mode, setMode}) {
  return (
    <ButtonGroup>
      <Menu>
        <MenuButton as={Button} rightIcon={<ChevronDownIcon/>}>
          Sort
        </MenuButton>
        <MenuList>
          <MenuItem onClick={() => {
              saveNames(names.toSorted((a, b) => a[1].localeCompare(b[1])))
            }}
          >
            Color
          </MenuItem>
          <MenuItem onClick={() => saveNames(names.toSorted((a,b)=>a[0].localeCompare(b[0])))}>
            Alphabetical
          </MenuItem>
        </MenuList>
      </Menu>
      <Button onClick={() => setHighlight(Math.floor(Math.random() * names.length))}>
        🎲
      </Button>
      <Button onClick={() => setMode(mode === 'edit' ? 'normal' : 'edit')}>
        {mode === 'edit' ? "Done" : "Edit"}
      </Button>
    </ButtonGroup>
  )
}

function NamesAdder({names, addNames}) {
  return (
    <Box border='1px solid gray' marginBottom='2em' borderRadius="5" padding='.5em'>
      <Accordion defaultIndex={[0]}>
        <AccordionItem>
          <AccordionButton>
            <Box>
              By Threshold
            </Box>
            <AccordionIcon/>
          </AccordionButton>
          <AccordionPanel>
            <AddByThreshold addNames={addNames}/>
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem>
          <AccordionButton>
            <Box>
              Con Huevos
            </Box>
            <AccordionIcon/>
          </AccordionButton>
          <AccordionPanel>
            <AddByEggs addNames={addNames}/>
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem>
          <AccordionButton>
            <Box>
              Crawl
            </Box>
            <AccordionIcon/>
          </AccordionButton>
          <AccordionPanel>
            <AddByCrawl names={names} addNames={addNames}/>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Box>
  )
}

function AddByCrawl({names, addNames}) {
  const crawlNames = async (base, fanout, limit, threshold) => {
    const res = await fetch(ONOMANCER_URL + 'crawlNames/' + base + '?fanout=' + fanout + '&limit=' + limit + '&threshold=' + threshold)
    const na = await res.json()
    return na
  }
  const [base, setBase] = useState(names.length > 0 ? names[0] : '')
  const [fanout, setFanout] = useState(5)
  const [limit, setLimit] = useState(5)
  const [threshold, setThreshold] = useState(3)
  return (<>
    <FormControl>
      <FormLabel>
        Base Name
      </FormLabel>
      <Select
        onChange={(e) => setBase(e.target.value)}
      >
        {names.map((n, i) => (
          <option value={n[0]} key={i}>{n[0]}</option>
        ))}
      </Select>
    </FormControl>
    <ButtonGroup>
      <FormControl>
        <FormLabel>
          Fanout
        </FormLabel>
        <NumberInput onChange={setFanout} value={fanout}>
          <NumberInputField/>
          <NumberInputStepper>
            <NumberIncrementStepper/>
            <NumberDecrementStepper/>
          </NumberInputStepper>
        </NumberInput>
      </FormControl>
      <FormControl>
        <FormLabel>
          Threshold
        </FormLabel>
        <NumberInput onChange={setThreshold} value={threshold}>
          <NumberInputField/>
          <NumberInputStepper>
            <NumberIncrementStepper/>
            <NumberDecrementStepper/>
          </NumberInputStepper>
        </NumberInput>
      </FormControl>
      <FormControl>
        <FormLabel>
          Count
        </FormLabel>
        <NumberInput onChange={setLimit} value={limit}>
          <NumberInputField/>
          <NumberInputStepper>
            <NumberIncrementStepper/>
            <NumberDecrementStepper/>
          </NumberInputStepper>
        </NumberInput>
      </FormControl>
    </ButtonGroup>
    <FormControl>
      <Button
        onClick={() => crawlNames(base, fanout, limit, threshold).then((ns) => addNames(ns))}
      >
        Get Names
      </Button>
    </FormControl>

  </>)
}

function AddByEggs({addNames}) {
  const getEggs = async (t1, t2, limit) => {
    const [firsts, seconds] = await Promise.all([
      fetch(ONOMANCER_URL + 'getEggs?random=1&first=' + t1 + '&limit=' + limit),
      fetch(ONOMANCER_URL + 'getEggs?random=1&second=' + t2 + '&limit=' + limit),
    ])
    let f = await firsts.json()
    let s = await seconds.json()
    let na = []
    for (let i = 0; i < limit; i++) {
      na.push(f[i] + ' ' + s[i])
    }
    return na
  }
  const [count, setCount] = useState(5)
  const [ft, setFT] = useState(30)
  const [st, setST] = useState(3)
  return (<>
    <ButtonGroup>
      <FormControl>
        <FormLabel>
          First Power
        </FormLabel>
        <NumberInput onChange={(n) => {setFT(n)}} value={ft}>
          <NumberInputField/>
          <NumberInputStepper>
            <NumberIncrementStepper/>
            <NumberDecrementStepper/>
          </NumberInputStepper>
        </NumberInput>
      </FormControl>
      <FormControl>
        <FormLabel>
          Second Power
        </FormLabel>
        <NumberInput onChange={(n) => {setST(n)}} value={st}>
          <NumberInputField/>
          <NumberInputStepper>
            <NumberIncrementStepper/>
            <NumberDecrementStepper/>
          </NumberInputStepper>
        </NumberInput>
      </FormControl>
      <FormControl>
        <FormLabel>
          Count
        </FormLabel>
        <NumberInput onChange={(n) => {setCount(n)}} value={count}>
          <NumberInputField/>
          <NumberInputStepper>
            <NumberIncrementStepper/>
            <NumberDecrementStepper/>
          </NumberInputStepper>
        </NumberInput>
      </FormControl>
    </ButtonGroup>
    <FormControl>
      <Button
        onClick={() => getEggs(ft, st, count).then((ns) => addNames(ns))}
      >
        Get Names
      </Button>
    </FormControl>

  </>)
}   

function AddByThreshold({addNames}) {
  const getNames = async (threshold, limit) => {
    const res = await fetch(ONOMANCER_URL + 'getNames?random=1&threshold=' + threshold + '&limit=' + limit)
    const na = await res.json()
    return na
  }
  const [count, setCount] = useState(5)
  const [threshold, setThreshold] = useState(3)

  return (
    <>
    <ButtonGroup>
      <FormControl>
        <FormLabel>
          Threshold
        </FormLabel>
        <NumberInput onChange={(n) => {setThreshold(n)}} value={threshold}>
          <NumberInputField/>
          <NumberInputStepper>
            <NumberIncrementStepper/>
            <NumberDecrementStepper/>
          </NumberInputStepper>
        </NumberInput>
      </FormControl>
      <FormControl>
        <FormLabel>
          Count
        </FormLabel>
        <NumberInput onChange={(n) => {setCount(n)}} value={count}>
          <NumberInputField/>
          <NumberInputStepper>
            <NumberIncrementStepper/>
            <NumberDecrementStepper/>
          </NumberInputStepper>
        </NumberInput>
      </FormControl>
    </ButtonGroup>
    <FormControl>
      <Button
        onClick={() => getNames(threshold, count).then((ns) => addNames(ns))}
      >
        Get Names
      </Button>
    </FormControl>
    </>
  )
}

function NamesAccordion({names, saveNames, mode, highlight, setHighlight, query}) {
  const API_URL = process.env.NODE_ENV === 'production' ? '/' : 'http://localhost:8000/';
  const roll = async () => {
    let params = new URLSearchParams()
    query.map((q) => params.append("t", q))
    const res = await fetch(API_URL + "api/roll?" + params)
    const answer = await res.json()
    return answer
  }
  return (
    <Accordion allowToggle index={highlight !== -1 ? highlight : undefined} onClick={(e) => setHighlight(-1)}>
    {
      names.map((data, i) => (
        <AccordionItem key={i} bg={data[1] + ".100"}>
          <HStack>
            {
              mode === 'edit' ?
              <Button onClick={() => saveNames(names.toSpliced(i, 1))}>
                🗑️
              </Button>
              :
              <ColorPicker
                defaultColor={data[1]}
                onClick={(c) => {
                  let n = [...names]
                  n[i][1] = c
                  saveNames(n)
                }}
              />
            }
            <VStack textAlign='left'>
              <AccordionButton>
                <Box>{data[0]}</Box>
                <AccordionIcon/>
              </AccordionButton>
              <AccordionPanel textAlign='left'>
                <Box>
                {
                  data[2] !== undefined && Object.keys(data[2]).map((table, i) => (
                    <HStack key={i} alignItems="flex-start">
                      <Heading size="xs">{table}</Heading>
                      <List>
                        {
                          data[2][table].map((roll, i) => (
                            <ListItem key={i}>
                              <Text fontSize="xs">{roll}</Text>
                            </ListItem>
                          ))
                        }
                      </List>
                    </HStack>
                  ))
                }
                </Box>
                <Button
                  isDisabled={query?.length === 0}
                  colorScheme="purple"
                  onClick={() => {
                    roll().then((answer) => {
                      let n = [...names]
                      n[i][2] = answer
                      saveNames(n)
                    })
                  }}
                  >
                  Roll!
                </Button>
              </AccordionPanel>
            </VStack>
          </HStack>
        </AccordionItem>
      ))
    }
    </Accordion>
  )
}

function ColorPicker({onClick, defaultColor}) {
  const colors = ['white', 'gray', 'red', 'orange', 'yellow', 'green', 'teal', 'blue', 'cyan', 'purple', 'pink']
  const [selected, setSelected] = useState(defaultColor !== undefined ? defaultColor : 'white')
  return (
    <Popover>
      <PopoverTrigger>
        <IconButton border="1px solid gray" colorScheme={selected} isRound={true} variant="solid"/>
      </PopoverTrigger>
      <Portal>
        <PopoverContent>
          <PopoverArrow />
          <PopoverHeader>{selected}</PopoverHeader>
          <PopoverCloseButton/>
          <PopoverBody>
            <Wrap>
            {
              colors.map((c, j) => (
                <IconButton
                  border="1px solid gray"
                  colorScheme={c} isRound={true}  variant="solid"
                  aria-label={c}
                  key={j}
                  icon={selected === c ? <CheckIcon color="black"/> : ""}
                  onClick={() => {
                    setSelected(c);
                    onClick(c);
                  }}
                />
              ))
            }
            </Wrap>
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  )
}
