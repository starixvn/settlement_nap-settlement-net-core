import { SportType } from './../../shared/constants/sport-type.native';
export const BetType = {
    relatePlayer: ['9680', '9676', '9730', '9736', '9690', '9686', '9731', '9737',
        '9662', '9663', '9668', '9650', '9672', '9656', '9671', '9651', '9675', '9657']
}

export const MappingValue: { [key: string]: string } = {
    'D': 'Draw',
    'Y': 'Yes',
    'B': 'Bottom',
    'M': 'Middle',
    'NM': 'Top or Bottom',
    'NB': 'Top or Middle',
    'O': 'OverLord',
    'C': 'Caught',
    'NC': 'Not Caught',
    'LBW': 'LBW',
    'RO': 'Run Out',
    'S': 'Stumped',
    'OT': 'Others',
    'NONE': 'None',
}

export const MappingValueWithBettype: { [key: string]: string } = {
    'T-9113' : 'Top',
    'T-9141' : 'Tyrant',
    'NT-9135': 'Middle or Bottom',
    'NT-9142' : 'Overlord or Middle',
}

export const BetTypeWithNo: { [key: number]: string[] } = {
    [SportType.volleyBall]: ['3914'],
    [SportType.cricket]: ['9624', '9630', '9625', '9631'],
    [SportType.eSports]: ['9073', '9075', '9087', '9124', '9132', '9133']
}