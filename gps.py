import requests
from math import sqrt
from pqueue import PriorityQueue

querystring = {"user":"anantdgoel_7202ce"}

def id_to_xy(id):
    x = id%150
    y = id/150
    return (x,y)

def xy_to_id(x, y):
    return (y*150)+x

def get_map():
    map = [[[] for y in range(150)] for x in range(150)]
    url = "https://gps.hackmirror.icu/api/map"
    response = requests.get(url, params=querystring)
    response = response.json()
    i=0
    for node in response['graph']:
        x, y = id_to_xy(i)
        for n in node:
            map[x][y].append(id_to_xy(n))
        i+=1
    return map

if __name__ == '__main__':
    print(get_map())