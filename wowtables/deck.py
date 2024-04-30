import random
from collections import Counter
import pprint

suits = ["wands", "cups", "swords", "pentacles"]
ranks  = ["ace", "2", '3', '4', '5', '6', '7', '8', '9', '10', 'page', 'knight', 'queen', 'king']
minors = [f'{r}_{s}' for s in suits for r in ranks]
majors = [str(n) for n in range(22)]

lucky = "ace_wands"
lucky_rank = "ace"
lucky_suit = "wands"

#luckies = ["four_swords", "five_pentacles", "page_cups"]
luckies = ["1", "2", "3", "4"]
curse = '0'

def draw(n, d=0):
    deck = majors + minors
    random.shuffle(deck)
    draws = deck[d:d+n]
    '''
    if len([c for c in draws if c.endswith(lucky_suit)]) >= 2:
        return 'CRIT'
    '''
    '''
    if curse in draws and random.random() < .5:
        return 'FAIL'
    '''
    '''
    if sum((l in draws for l in luckies)) >= 1:
        return 'CRIT'
    '''
    draws = [card for card in draws if random.random() > .5]
    '''
    if lucky in draws:
        return 'CRIT'
    '''
    highest = ''
    for card in draws:
        if card in minors and not highest:
            highest = card
        if card in majors or card.startswith('ace'):
            highest = card
    if highest in majors:
        return 'SUCCESS'
    if highest in minors:
        return 'MIXED'
    return 'FAIL'


def roll(n):
    highest = 0
    r = [random.randint(1, 6) for _ in range(n)]
    r.sort()
    '''
    if len(r) >= 2 and r[-2:] == [6, 6]:
        return 'CRIT'
    '''
    if r[-1] == 6:
        return 'SUCCESS'
    if r[-1] > 3:
        return 'MIXED'
    return 'FAIL'


def pbta(b):
    res = random.randint(1,6) + random.randint(1, 6) + b
    if res >= 10:
        return 'SUCCESS'
    if res >= 7:
        return 'MIXED'
    return 'FAIL'


if __name__ == '__main__':
    attempts = 10000
    cardres = {
        'CRIT': [],
        'SUCCESS': [],
        'MIXED': [],
        'FAIL': [],
    }
    diceres = {
        'CRIT': [],
        'SUCCESS': [],
        'MIXED': [],
        'FAIL': [],
    }
    pbtar = {
        'CRIT': [],
        'SUCCESS': [],
        'MIXED': [],
        'FAIL': [],
    }
    for n in range(1, 7):
        c = Counter([draw(n, d=0) for _ in range(attempts)])
        for k, v in cardres.items():
            v.append(str(round(c[k] / attempts * 100)) + '%')
        dc = Counter([roll(n) for _ in range(attempts)])
        for k, v in diceres.items():
            v.append(str(round(dc[k] / attempts * 100)) + '%')

        pc = Counter([pbta(n - 3) for _ in range(attempts)])
        for k, v in pbtar.items():
            v.append(str(round(pc[k] / attempts * 100)) + '%')
        #pprint.pprint({k: v/attempts for k,v in c.items()})

        #pprint.pprint({k: v/attempts for k,v in dc.items()})
        '''
        print(f'\t\ttarot\t{n}d6')
        for state in ['CRIT', 'SUCCESS', 'MIXED', 'FAIL']:
            print(f'{state}\t\t{round(c.get(state, 0) / attempts * 100, 1)}%\t{round(dc.get(state,0) / attempts * 100, 1)}%')
        '''
    print('draw\t\t1\t2\t3\t4\t5\t6\n')
    for state in ['CRIT', 'SUCCESS', 'MIXED', 'FAIL']:
        print(f'\t{state}\t{"\t".join(cardres[state])}')
    print('')
    print('dice\t\t1d6\t2d6\t3d6\t4d6\t5d6\t6d6\n')
    for state in ['CRIT', 'SUCCESS', 'MIXED', 'FAIL']:
        print(f'\t{state}\t{"\t".join(diceres[state])}')
    print('')
    print('pbta\t\t-2\t-1\t0\t1\t+2\t+3\n')
    for state in ['CRIT', 'SUCCESS', 'MIXED', 'FAIL']:
        print(f'\t{state}\t{"\t".join(pbtar[state])}')
