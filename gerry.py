import numpy as np
from scipy import stats
import json
import math

districts = [[0,1,2,3,4],[5,6,7,8,9],[10,11,12,13,14],[15,16,17,18,19],[20,21,22,23,24],[25,26,27,28,29],[30,31,32,33,34],[35,36,37,38,39],[40,41,42,43,44],[45,46,47,48,49],[50,51,52,53,54],[55,56,57,58,59],[60,61,62,63,64],[65,66,67,68,69],[70,71,72,73,74],[75,76,77,78,79],[80,81,82,83,84],[85,86,87,88,89],[90,91,92,93,94],[95,96,97,98,99]]

def prob_win(a, b):
    min_needed = (a+b)/2
    prob = stats.norm.cdf(min_needed, loc=(a*0.6)+(b*0.4), scale=math.sqrt((a*0.6*0.4)+(b*0.6*0.4)))
    return prob

def district_imbalance(populations):
    mean = sum(populations)/20
    imbalances = [(p-mean)**2 for p in populations]
    return sum(imbalances)

def eeg(a, b):
    expected_a = stats.norm.ppf(0.5, loc=(a*0.6)+(b*0.4), scale=math.sqrt((a*0.6*0.4)+(b*0.6*0.4)))
    min_needed = (a+b)/2
    expected_b = (a+b)-expected_a
    if expected_a > expected_b:
        wasted_a = expected_a-min_needed
        wasted_b = expected_b
    else:
        wasted_a = expected_a
        wasted_b = expected_b-min_needed
    return (wasted_a, wasted_b)

def main():
    # Read in voter data
    with open('voters.json', 'r') as f:
        data = json.loads(f.readline())
        data = data['voters_by_block']
        f.close()
        string = ''
    
    # for i in range(100):
    #     if prob_win(data['party_A'][i], data['party_B'][i]) > 0.5:
    #         string += 'A, '
    #     else:
    #         string += 'B, '
    #     if (i+1)%10==0:
    #         print string
    #         string = ''
    probs = []
    populations = []
    wasted_votes_a = []
    wasted_votes_b = []
    for district in districts:
        a = sum([data['party_A'][i] for i in district])
        b = sum([data['party_B'][i] for i in district])
        probs.append(prob_win(a, b))
        wasted_a, wasted_b = eeg(a, b)
        wasted_votes_a.append(wasted_a)
        wasted_votes_b.append(wasted_b)
        populations.append(a+b)
    print('Expected value:', sum(probs))
    print('Populations:', populations)
    imbalance = district_imbalance(populations)
    print('Imbalance:', imbalance)
    gap = (sum(wasted_votes_a)-sum(wasted_votes_b))/sum(populations)
    print('EEG:', gap)
    exp_b = sum(probs)>=10
    imbalance_b = imbalance <= 670000000000
    eeg_b = gap>=-0.173
    print('Expected wins satisfied:', sum(probs)>=10)
    print('Imbalance satisfied:', imbalance <= 670000000000)
    print('EEG satisfied:', gap>=-0.173)
    if eeg_b and imbalance_b and exp_b:
        print("Fuck, we did it")

if __name__ == '__main__':
    main()